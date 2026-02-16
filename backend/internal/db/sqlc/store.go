package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"grc-compil/backend/internal/util"
)

// Store defines all functions to execute db queries and transactions
type Store interface {
	Querier
	ExecTx(ctx context.Context, fn func(*Queries) error) error
	Exec(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error)
	Query(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error)
	QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row
}

// SQLStore provides all functions to execute SQL queries and transactions
type SQLStore struct {
	connPool *pgxpool.Pool
	*Queries
}

// rlsDBTX is a wrapper around DBTX that enforces Row Level Security
type rlsDBTX struct {
	db DBTX
}

func (r *rlsDBTX) Exec(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
	orgID, ok := util.ExtractRLSContext(ctx)
	if !ok {
		return r.db.Exec(ctx, query, args...)
	}

	// Check if we are already in a transaction
	if tx, ok := r.db.(pgx.Tx); ok {
		_, err := tx.Exec(ctx, "SELECT set_config('app.current_org_id', $1, true)", orgID)
		if err != nil {
			return pgconn.CommandTag{}, fmt.Errorf("rls context set fail: %w", err)
		}
		return tx.Exec(ctx, query, args...)
	}

	// If it's a pool, we must run both on the same connection.
	// Starting a transaction is the most reliable way to ensure session-local state.
	if pool, ok := r.db.(*pgxpool.Pool); ok {
		tx, err := pool.Begin(ctx)
		if err != nil {
			return pgconn.CommandTag{}, err
		}
		defer tx.Rollback(ctx)

		_, err = tx.Exec(ctx, "SELECT set_config('app.current_org_id', $1, true)", orgID)
		if err != nil {
			return pgconn.CommandTag{}, fmt.Errorf("rls context set fail: %w", err)
		}

		res, err := tx.Exec(ctx, query, args...)
		if err != nil {
			return pgconn.CommandTag{}, err
		}
		return res, tx.Commit(ctx)
	}

	return r.db.Exec(ctx, query, args...)
}

func (r *rlsDBTX) Query(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
	orgID, ok := util.ExtractRLSContext(ctx)
	if !ok {
		return r.db.Query(ctx, query, args...)
	}

	if tx, ok := r.db.(pgx.Tx); ok {
		_, err := tx.Exec(ctx, "SELECT set_config('app.current_org_id', $1, true)", orgID)
		if err != nil {
			return nil, fmt.Errorf("rls context set fail: %w", err)
		}
		return tx.Query(ctx, query, args...)
	}

	if pool, ok := r.db.(*pgxpool.Pool); ok {
		tx, err := pool.Begin(ctx)
		if err != nil {
			return nil, err
		}

		_, err = tx.Exec(ctx, "SELECT set_config('app.current_org_id', $1, true)", orgID)
		if err != nil {
			tx.Rollback(ctx)
			return nil, fmt.Errorf("rls context set fail: %w", err)
		}

		rows, err := tx.Query(ctx, query, args...)
		if err != nil {
			tx.Rollback(ctx)
			return nil, err
		}
		
		return &rlsRows{rows: rows, tx: tx}, nil 
	}

	return r.db.Query(ctx, query, args...)
}

type rlsRows struct {
	rows pgx.Rows
	tx   pgx.Tx
}

func (r *rlsRows) Next() bool {
	return r.rows.Next()
}

func (r *rlsRows) Scan(dest ...interface{}) error {
	return r.rows.Scan(dest...)
}

func (r *rlsRows) Close() {
	r.rows.Close()
	r.tx.Rollback(context.Background())
}

func (r *rlsRows) Err() error {
	return r.rows.Err()
}

// Ensure rlsRows implements pgx.Rows partially (at least what sqlc needs)
// Query actually returns pgx.Rows interface.
func (r *rlsRows) FieldDescriptions() []pgconn.FieldDescription {
	return r.rows.FieldDescriptions()
}

func (r *rlsRows) CommandTag() pgconn.CommandTag {
	return r.rows.CommandTag()
}

func (r *rlsRows) Conn() *pgx.Conn {
	return r.rows.Conn()
}

func (r *rlsRows) Values() ([]interface{}, error) {
	return r.rows.Values()
}

func (r *rlsRows) RawValues() [][]byte {
	return r.rows.RawValues()
}


func (r *rlsDBTX) QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
	orgID, ok := util.ExtractRLSContext(ctx)
	if !ok {
		return r.db.QueryRow(ctx, query, args...)
	}

	if tx, ok := r.db.(pgx.Tx); ok {
		_, err := tx.Exec(ctx, "SELECT set_config('app.current_org_id', $1, true)", orgID)
		if err != nil {
			return &errorRow{err: fmt.Errorf("rls context set fail: %w", err)}
		}
		return tx.QueryRow(ctx, query, args...)
	}

	if pool, ok := r.db.(*pgxpool.Pool); ok {
		tx, err := pool.Begin(ctx)
		if err != nil {
			return &errorRow{err: err}
		}
		
		_, err = tx.Exec(ctx, "SELECT set_config('app.current_org_id', $1, true)", orgID)
		if err != nil {
			tx.Rollback(ctx)
			return &errorRow{err: fmt.Errorf("rls context set fail: %w", err)}
		}
		
		return &rlsRow{row: tx.QueryRow(ctx, query, args...), tx: tx}
	}

	return r.db.QueryRow(ctx, query, args...)
}

type rlsRow struct {
	row pgx.Row
	tx  pgx.Tx
}

func (r *rlsRow) Scan(dest ...interface{}) error {
	defer r.tx.Rollback(context.Background()) // Ensure connection is returned to pool
	return r.row.Scan(dest...)
}

type errorRow struct {
	err error
}

func (e *errorRow) Scan(dest ...interface{}) error {
	return e.err
}

// NewStore creates a new store
func NewStore(connPool *pgxpool.Pool) Store {
	return &SQLStore{
		connPool: connPool,
		Queries:  New(&rlsDBTX{db: connPool}),
	}
}

func (store *SQLStore) Exec(ctx context.Context, query string, args ...interface{}) (pgconn.CommandTag, error) {
	return store.db.Exec(ctx, query, args...)
}

func (store *SQLStore) Query(ctx context.Context, query string, args ...interface{}) (pgx.Rows, error) {
	return store.db.Query(ctx, query, args...)
}

func (store *SQLStore) QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
	return store.db.QueryRow(ctx, query, args...)
}

// ExecTx executes a function within a database transaction
func (store *SQLStore) ExecTx(ctx context.Context, fn func(*Queries) error) error {
	tx, err := store.connPool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}

	q := New(&rlsDBTX{db: tx})
	err = fn(q)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
		}
		return err
	}

	return tx.Commit(ctx)
}
