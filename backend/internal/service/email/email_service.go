package email

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"log"
)

type EmailService interface {
	SendVerificationEmail(to, username, token string) error
	SendWelcomeEmail(to, username string) error
}

type emailService struct {
	smtpHost     string
	smtpPort     int
	smtpUsername string
	smtpPassword string
	fromEmail    string
	fromName     string
	frontendURL  string
}

func NewEmailService(
	smtpHost string,
	smtpPort int,
	smtpUsername string,
	smtpPassword string,
	fromEmail string,
	fromName string,
	frontendURL string,
) EmailService {
	return &emailService{
		smtpHost:     smtpHost,
		smtpPort:     smtpPort,
		smtpUsername: smtpUsername,
		smtpPassword: smtpPassword,
		fromEmail:    fromEmail,
		fromName:     fromName,
		frontendURL:  frontendURL,
	}
}

func (s *emailService) SendVerificationEmail(to, username, token string) error {
	// Verify URL pointing to the dedicated verification route
	verifyURL := fmt.Sprintf("%s/verify-email/%s", s.frontendURL, token)
	
	subject := "Verify Your Email - GRC Compliance"
	htmlBody := s.getVerificationEmailHTML(username, verifyURL)
	textBody := s.getVerificationEmailText(username, verifyURL)
	
	return s.sendEmail(to, subject, htmlBody, textBody)
}

func (s *emailService) SendWelcomeEmail(to, username string) error {
	subject := "Welcome to GRC Compliance!"
	htmlBody := s.getWelcomeEmailHTML(username)
	textBody := s.getWelcomeEmailText(username)
	
	return s.sendEmail(to, subject, htmlBody, textBody)
}

func (s *emailService) sendEmail(to, subject, htmlBody, textBody string) error {
	log.Printf("Attempting to send email to %s using SMTP host %s:%d", to, s.smtpHost, s.smtpPort)

	// Create message headers
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "multipart/alternative; boundary=\"boundary\""
	
	// Build message body
	var message bytes.Buffer
	for k, v := range headers {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	message.WriteString("\r\n")
	
	// Add text part
	message.WriteString("--boundary\r\n")
	message.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n")
	message.WriteString("\r\n")
	message.WriteString(textBody)
	message.WriteString("\r\n")
	
	// Add HTML part
	message.WriteString("--boundary\r\n")
	message.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	message.WriteString("\r\n")
	message.WriteString(htmlBody)
	message.WriteString("\r\n")
	
	message.WriteString("--boundary--")
	
	// SMTP authentication
	auth := smtp.PlainAuth("", s.smtpUsername, s.smtpPassword, s.smtpHost)
	
	// Send the email
	addr := fmt.Sprintf("%s:%d", s.smtpHost, s.smtpPort)
	log.Printf("Connecting to SMTP server at %s", addr)
	err := smtp.SendMail(addr, auth, s.fromEmail, []string{to}, message.Bytes())
	if err != nil {
		log.Printf("Failed to send email to %s: %v", to, err)
		return fmt.Errorf("failed to send email: %w", err)
	}
	
	log.Printf("Email successfully sent to %s", to)
	return nil
}

func (s *emailService) getVerificationEmailHTML(username, verifyURL string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Hi <strong>{{.Username}}</strong>,</p>
            <p>Welcome to <strong>GRC Compliance System</strong>! Please verify your email address to complete your registration.</p>
            <p style="text-align: center;">
                <a href="{{.VerifyURL}}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{.VerifyURL}}</p>
            <p>This link will expire in <strong>24 hours</strong>.</p>
            <p>If you didn't create an account with us, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2026 GRC Compliance System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
	
	t := template.Must(template.New("email").Parse(tmpl))
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{
		"Username":  username,
		"VerifyURL": verifyURL,
	})
	
	return buf.String()
}

func (s *emailService) getVerificationEmailText(username, verifyURL string) string {
	return fmt.Sprintf(`Hi %s,

Welcome to GRC Compliance System! Please verify your email address to complete your registration.

Verify your email by clicking this link:
%s

This link will expire in 24 hours.

If you didn't create an account with us, you can safely ignore this email.

© 2026 GRC Compliance System. All rights reserved.
`, username, verifyURL)
}

func (s *emailService) getWelcomeEmailHTML(username string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome!</h1>
        </div>
        <div class="content">
            <p>Hi <strong>{{.Username}}</strong>,</p>
            <p>Your email has been successfully verified! You can now access all features of the GRC Compliance System.</p>
            <p>Thank you for joining us!</p>
        </div>
        <div class="footer">
            <p>© 2026 GRC Compliance System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
	
	t := template.Must(template.New("email").Parse(tmpl))
	var buf bytes.Buffer
	t.Execute(&buf, map[string]string{
		"Username": username,
	})
	
	return buf.String()
}

func (s *emailService) getWelcomeEmailText(username string) string {
	return fmt.Sprintf(`Hi %s,

Your email has been successfully verified! You can now access all features of the GRC Compliance System.

Thank you for joining us!

© 2026 GRC Compliance System. All rights reserved.
`, username)
}
