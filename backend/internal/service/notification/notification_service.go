package notification

import (
	"context"
	db "grc-compil/backend/internal/db/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type NotificationService interface {
	CreateNotification(ctx context.Context, arg db.CreateNotificationParams) (db.Notification, error)
	ListNotifications(ctx context.Context, userID int64, orgID uuid.UUID) ([]db.Notification, error)
	MarkAsRead(ctx context.Context, id uuid.UUID, userID int64) (db.Notification, error)
	GetUnreadCount(ctx context.Context, userID int64, orgID uuid.UUID) (int64, error)
	MarkAllAsRead(ctx context.Context, userID int64, orgID uuid.UUID) error
}

type notificationService struct {
	store db.Store
}

func NewNotificationService(store db.Store) NotificationService {
	return &notificationService{store: store}
}

func (s *notificationService) CreateNotification(ctx context.Context, arg db.CreateNotificationParams) (db.Notification, error) {
	return s.store.CreateNotification(ctx, arg)
}

func (s *notificationService) ListNotifications(ctx context.Context, userID int64, orgID uuid.UUID) ([]db.Notification, error) {
	var pgOrgID pgtype.UUID
	copy(pgOrgID.Bytes[:], orgID[:])
	pgOrgID.Valid = true

	return s.store.ListNotificationsByUser(ctx, db.ListNotificationsByUserParams{
		UserID: userID,
		OrgID:  pgOrgID,
	})
}

func (s *notificationService) MarkAsRead(ctx context.Context, id uuid.UUID, userID int64) (db.Notification, error) {
	var pgID pgtype.UUID
	copy(pgID.Bytes[:], id[:])
	pgID.Valid = true

	return s.store.MarkNotificationAsRead(ctx, db.MarkNotificationAsReadParams{
		ID:     pgID,
		UserID: userID,
	})
}

func (s *notificationService) GetUnreadCount(ctx context.Context, userID int64, orgID uuid.UUID) (int64, error) {
	var pgOrgID pgtype.UUID
	copy(pgOrgID.Bytes[:], orgID[:])
	pgOrgID.Valid = true

	return s.store.GetUnreadCount(ctx, db.GetUnreadCountParams{
		UserID: userID,
		OrgID:  pgOrgID,
	})
}

func (s *notificationService) MarkAllAsRead(ctx context.Context, userID int64, orgID uuid.UUID) error {
	var pgOrgID pgtype.UUID
	copy(pgOrgID.Bytes[:], orgID[:])
	pgOrgID.Valid = true

	return s.store.MarkAllAsRead(ctx, db.MarkAllAsReadParams{
		UserID: userID,
		OrgID:  pgOrgID,
	})
}
