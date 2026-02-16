package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"grc-compil/backend/internal/config"
	db "grc-compil/backend/internal/db/sqlc"
	"grc-compil/backend/internal/util"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
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

	store := db.New(connPool)
	ctx := context.Background()

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

	// Run Migrations manually
	migrations := []string{
		"internal/db/migrations/000006_programs_schema.up.sql",
		"internal/db/migrations/000007_add_departments.up.sql",
		"internal/db/migrations/000008_v1_parity_schema.up.sql",
		"internal/db/migrations/000009_enhance_risks_tasks.up.sql",
	}

	for _, migFile := range migrations {
		migContent, err := os.ReadFile(migFile)
		if err != nil {
			log.Printf("Warning: migration file not found at %s: %v", migFile, err)
			continue
		}
		_, err = connPool.Exec(ctx, string(migContent))
		if err != nil {
			log.Printf("Migration %s skipped or failed (might already exist): %v", migFile, err)
		} else {
			fmt.Printf("Applied migration %s successfully.\n", migFile)
		}
	}

	// 1. Create Organization (if not exists)
	org, err := store.CreateOrganization(ctx, "Default Org")
	if err != nil {
		orgs, _ := store.ListOrganizations(ctx)
		if len(orgs) > 0 {
			org = orgs[0]
		} else {
			log.Printf("Failed to create/find org: %v", err)
		}
	}

	// Hash the password with configured cost
	hashedPassword, err := util.HashPassword(password, cfg.BcryptCost)
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}

	// Insert the user
	query := `
		INSERT INTO users (username, email, org_id, password_hash, role, email_verified)
		VALUES ($1, $2, $3, $4, $5, true)
		ON CONFLICT (username) DO UPDATE SET password_hash = $4
		RETURNING id, username, email, role
	`

	var adminID int64
	var returnedUsername, returnedEmail, returnedRole string
	err = connPool.QueryRow(ctx, query, username, email, org.ID, hashedPassword, role).
		Scan(&adminID, &returnedUsername, &returnedEmail, &returnedRole)

	if err != nil {
		log.Printf("failed to create/update user (might already exist): %v", err)
	} else {
		fmt.Printf("\n✅ Superadmin created/updated successfully!\n")
		fmt.Printf("ID:       %d\n", adminID)
		fmt.Printf("Username: %s\n", returnedUsername)
	}

	// SEED FRAMEWORKS
	seedFrameworks(ctx, store)
	seedAssets(ctx, store, org)
	seedDepartments(ctx, store, org)
}

func seedFrameworks(ctx context.Context, store *db.Queries) {
	fws := []struct {
		Name, Desc, Ver string
		Controls        []struct{ Code, Title, Cat string }
	}{
		{
			"SOC 2 Type II", "Service Organization Control 2", "2017",
			[]struct{ Code, Title, Cat string }{
				{"CC1.1", "COSO Principle 1: Integrity and Ethics", "Governance"},
				{"CC6.1", "Logical Access Security", "Logical Access"},
			},
		},
		{
			"ISO 27001", "Information Security Management", "2022",
			[]struct{ Code, Title, Cat string }{
				{"A.5.1", "Policies for information security", "Organizational"},
			},
		},
	}

	for _, f := range fws {
		fw, err := store.CreateFramework(ctx, db.CreateFrameworkParams{
			Name:        f.Name,
			Description: pgtype.Text{String: f.Desc, Valid: true},
			Version:     pgtype.Text{String: f.Ver, Valid: true},
			Status:      "published",
		})
		if err != nil {
			log.Printf("Skipping framework %s: %v", f.Name, err)
			continue
		}
		fmt.Printf("Created Framework: %s\n", fw.Name)

		for _, c := range f.Controls {
			ctrl, err := store.CreateControl(ctx, db.CreateControlParams{
				OrgID:    pgtype.UUID{Bytes: [16]byte{}, Valid: true}, // Default org ID or pass it
				Code:     c.Code,
				Title:    c.Title,
				Category: pgtype.Text{String: c.Cat, Valid: true},
			})
			if err != nil {
				log.Printf("Failed to create control %s: %v", c.Code, err)
				continue
			}

			_, err = store.MapControl(ctx, db.MapControlParams{
				FrameworkID: fw.ID,
				ControlID:   ctrl.ID,
			})
			if err != nil {
				log.Printf("Failed to map control %s to framework: %v", c.Code, err)
			}
		}
	}
}

func seedAssets(ctx context.Context, store *db.Queries, org db.Organization) {
	assets := []struct{ Name, Type string }{
		{"AWS Production Environment", "cloud_infrastructure"},
		{"Corporate HR Portal", "application"},
		{"Customer Database (PostgreSQL)", "database"},
	}

	for _, a := range assets {
		_, err := store.CreateAsset(ctx, db.CreateAssetParams{
			Name:        a.Name,
			Type:        a.Type,
			Description: pgtype.Text{Valid: false},
			OwnerID:     org.ID,
		})
		if err != nil {
			log.Printf("Failed to create asset %s: %v", a.Name, err)
		} else {
			fmt.Printf("Created Asset: %s\n", a.Name)
		}
	}
}

func seedDepartments(ctx context.Context, store *db.Queries, org db.Organization) {
	depts := []struct{ Name, Desc string }{
		{"Engineering", "Core product development team"},
		{"Information Technology", "Infrastructure and support"},
		{"Human Resources", "People and culture"},
		{"Finance", "Financial operations"},
	}

	for _, d := range depts {
		_, err := store.CreateDepartment(ctx, db.CreateDepartmentParams{
			Name:        d.Name,
			Description: pgtype.Text{String: d.Desc, Valid: true},
			HeadUserID:  org.ID,
		})
		if err != nil {
			log.Printf("Failed to create department %s: %v", d.Name, err)
		} else {
			fmt.Printf("Created Department: %s\n", d.Name)
		}
	}
}
