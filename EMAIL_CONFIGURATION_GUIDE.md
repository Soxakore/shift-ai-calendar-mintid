# MinTid Email Configuration Guide

## Email Templates for Shift Scheduling Application

### 1. **Confirm Signup Email**
**Subject**: Welcome to MinTid - Confirm Your Account
**Purpose**: Welcome new employees to the shift scheduling system

**Template**:
```html
<h2>Welcome to MinTid Shift Scheduler! 👋</h2>
<p>Hello {{ .Name }},</p>
<p>You've been invited to join the MinTid shift scheduling platform. Click the link below to confirm your account and start managing your work schedule:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Confirm Your Account</a></p>
<p>Once confirmed, you'll be able to:</p>
<ul>
  <li>View your assigned shifts</li>
  <li>Request time off</li>
  <li>View your work schedule</li>
  <li>Receive shift notifications</li>
</ul>
<p>If you have any questions, contact your manager or admin.</p>
<p>Best regards,<br>The MinTid Team</p>
```

### 2. **Invite User Email**
**Subject**: You're Invited to MinTid - Join Your Team's Schedule
**Purpose**: Manager inviting new team members

**Template**:
```html
<h2>You're Invited to Join {{ .OrganizationName }}! 🎉</h2>
<p>Hello {{ .Name }},</p>
<p>{{ .InviterName }} has invited you to join the MinTid shift scheduling platform for {{ .OrganizationName }}.</p>
<p><a href="{{ .InvitationURL }}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
<p>As a team member, you'll be able to:</p>
<ul>
  <li>View and manage your work shifts</li>
  <li>Request schedule changes</li>
  <li>Track your working hours</li>
  <li>Communicate with your team</li>
</ul>
<p>Welcome to the team!</p>
<p>Best regards,<br>{{ .InviterName }} and the MinTid Team</p>
```

### 3. **Magic Link Email**
**Subject**: Your MinTid Login Link
**Purpose**: Passwordless login for users

**Template**:
```html
<h2>Your MinTid Login Link 🔐</h2>
<p>Hello {{ .Name }},</p>
<p>Click the link below to securely access your MinTid account:</p>
<p><a href="{{ .MagicLinkURL }}" style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Login to MinTid</a></p>
<p>This link will expire in 1 hour for security purposes.</p>
<p>If you didn't request this login, please ignore this email.</p>
<p>Best regards,<br>The MinTid Team</p>
```

### 4. **Reset Password Email**
**Subject**: Reset Your MinTid Password
**Purpose**: Password recovery for users

**Template**:
```html
<h2>Reset Your MinTid Password 🔑</h2>
<p>Hello {{ .Name }},</p>
<p>You requested to reset your password for your MinTid account. Click the link below to create a new password:</p>
<p><a href="{{ .ResetURL }}" style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
<p>This link will expire in 1 hour for security purposes.</p>
<p>If you didn't request this password reset, please contact your administrator immediately.</p>
<p>Best regards,<br>The MinTid Team</p>
```

## Development Testing with Inbucket

You can test all emails locally using Inbucket at: http://127.0.0.1:54324

## Production SMTP Setup (Future)

When ready for production, consider:
- **SendGrid** - Good for transactional emails
- **AWS SES** - Cost-effective for large volumes  
- **Postmark** - Excellent deliverability
- **Mailgun** - Feature-rich option

## Email Rate Limits (Built-in Service)
- Development: Limited sends per hour
- Not suitable for production
- Use for testing only
