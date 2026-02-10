package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"grc-compil/backend/internal/config"
	"grc-compil/backend/internal/util"
)

func main() {
	cfg, err := config.LoadConfig(".")
	if err != nil {
		log.Fatalf("cannot load config: %v", err)
	}

	connPool, err := pgxpool.New(context.Background(), cfg.DBURL)
	if err != nil {
		log.Fatalf("cannot connect to db: %v", err)
	}
	defer connPool.Close()

	// Default credentials
	username := "Shristi"
	email := "admin@grc-compil.com"
	password := "Shristi@2211"
	role := "admin"

	// Allow customization via args
	if len(os.Args) > 1 {
		username = os.Args[1]
	}
	if len(os.Args) > 2 {
		email = os.Args[2]
	}
	if len(os.Args) > 3 {
		password = os.Args[3]
	}

	// Hash the password
	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}

	// Insert the user
	query := `
		INSERT INTO users (username, email, org_id, password_hash, role)
		VALUES ($1, $2, (SELECT id FROM organizations LIMIT 1), $3, $4)
		ON CONFLICT (username) DO UPDATE SET password_hash = $3
		RETURNING id, username, email, role
	`

	var id int64
	var returnedUsername, returnedEmail, returnedRole string
	err = connPool.QueryRow(context.Background(), query, username, email, hashedPassword, role).
		Scan(&id, &returnedUsername, &returnedEmail, &returnedRole)
	
	if err != nil {
		log.Fatalf("failed to create user: %v", err)
	}

	fmt.Printf("\n✅ Superadmin created successfully!\n")
	fmt.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
	fmt.Printf("ID:       %d\n", id)
	fmt.Printf("Username: %s\n", returnedUsername)
	fmt.Printf("Email:    %s\n", returnedEmail)
	fmt.Printf("Role:     %s\n", returnedRole)
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n")
}
