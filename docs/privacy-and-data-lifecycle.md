# Privacy, Consent, and Data Lifecycle

This document outlines the privacy compliance features, data lifecycle policies, and third-party data sharing practices implemented in the Learning Tracker application.

## Privacy Policy Version

**Current Version:** 1.0.0
**Last Updated:** October 15, 2024

Version constant is defined in:
- `app/features/privacy/services/terms.service.ts` (CURRENT_PRIVACY_VERSION)
- `messages/en.json` and `messages/id.json` (privacy_version)

## Terms of Service Version

**Current Version:** 1.0.0

Version constant is defined in:
- `app/features/privacy/services/terms.service.ts` (CURRENT_TERMS_VERSION)

## Consent Management

### Enabling/Disabling Consent Banner

The consent banner can be enabled or disabled via environment variable:

```bash
# Enable consent banner (default)
CONSENT_BANNER_ENABLED=true

# Disable consent banner
CONSENT_BANNER_ENABLED=false
```

When disabled, the banner will not appear on any page. This is useful for:
- Internal/staging environments
- Jurisdictions that don't require consent banners
- Testing without consent interruption

**Note:** Even when the banner is disabled, analytics tracking should still respect user privacy laws in your jurisdiction.

### Cookie Types

The application uses three types of cookies:

1. **Essential Cookies** (Always enabled)
   - Authentication session cookies
   - Security tokens
   - Language preference
   - Required for the application to function

2. **Analytics Cookies** (Optional, requires user consent)
   - Google Analytics (when GTM_ID is configured)
   - Usage statistics
   - Performance metrics

3. **Marketing Cookies** (Optional, requires user consent)
   - Marketing campaigns
   - Ad personalization (future use)

### Consent Banner

The consent banner (`app/features/privacy/components/consent-banner.tsx`) features:

**Animations:**
- Smooth slide-up animation when appearing (0.3s ease-out)
- Smooth slide-down animation when closing (0.3s ease-out)
- Delayed appearance (100ms) for smoother page load

**Appears when:**
- User first visits the site
- Privacy policy version changes
- User clears consent preferences

Consent preferences are stored in:
- **Client-side:** `localStorage` under key `user-consent`
- **Server-side:** `user_consents` table (for authenticated users)

### Consent Tracking

All consent changes are logged in the `consent_history` table with:
- User ID
- Consent type (analytics, marketing, functional)
- Consent value (granted/revoked)
- Privacy policy version
- IP address (hashed)
- User agent
- Timestamp

## Terms Acceptance Tracking

### When Terms Are Recorded

Terms acceptance is automatically recorded during:

1. **Registration** (`acceptanceType: 'registration'`)
   - Recorded in `app/features/users/services/user.service.ts` register function
   - Captures initial acceptance of Terms and Privacy Policy

2. **Policy Updates** (`acceptanceType: 'update'`)
   - When user explicitly accepts new versions
   - Triggered when accessing protected features after policy change

3. **Forced Updates** (`acceptanceType: 'forced'`)
   - When continued use requires explicit re-acceptance
   - For significant privacy policy changes

### Terms Acceptance Storage

Stored in `terms_acceptances` table with:
- User ID
- Terms version
- Privacy version
- Acceptance type
- IP address
- User agent
- Timestamp

## Data Export (GDPR Right to Data Portability)

> **Note**: The data export feature is not currently implemented. For implementation guidance, see `app/features/privacy/EXPORT-FEATURE-STRATEGY.md`.

When implementing data export, the feature should include:

- **User Account**: Profile, email, verification status
- **Learner Data**: All learner profiles and groups
- **Learning Data**: Goals, activities, learning records
- **Schedule Data**: Daily schedules, items, and todos
- **Privacy Records**: Consents and terms acceptances

**Must Exclude**:
- Passwords and password hashes
- OAuth tokens and API keys
- Internal system IDs
- Soft-deleted records

## Data Retention Policy

### Active Accounts

- **User data:** Retained indefinitely while account is active
- **Learning records:** Retained indefinitely
- **Audit logs:** Retained for 2 years from creation
- **Consent history:** Retained indefinitely for compliance
- **Terms acceptances:** Retained indefinitely for compliance

### Deleted Accounts

When a user deletes their account:

1. **Immediate deletion (within 24 hours):**
   - User profile
   - Learner profiles
   - Goals and activities
   - Schedules
   - Media files (from object storage)

2. **Soft deletion / Retained temporarily:**
   - Audit logs: retained for 30 days post-deletion
   - Backup retention: up to 90 days

3. **Retained for compliance:**
   - Anonymous usage statistics
   - Financial records (if applicable): 7 years
   - Legal hold data (if applicable): as required

### Automated Cleanup

Recommended cron jobs (not yet implemented):

```bash
# Delete soft-deleted accounts older than 30 days
pnpm db:cleanup:deleted-accounts

# Purge old audit logs
pnpm db:cleanup:audit-logs

# Remove expired media files
pnpm db:cleanup:expired-media
```

## Third-Party Data Sharing

### Google OAuth

**When:** User chooses "Sign in with Google"

**Data Sent:**
- OAuth authorization request
- Redirect URL

**Data Received:**
- User ID (from Google)
- Email address
- Name
- Profile picture URL

**Privacy Policy:** https://policies.google.com/privacy

### Google Analytics (GTM)

**When:** User consents to analytics cookies

**Data Sent:**
- Page views
- User interactions (anonymized)
- Browser and device information
- Geographic location (city-level)

**Data NOT Sent:**
- Personally identifiable information (PII)
- Email addresses
- User names

**Privacy Policy:** https://policies.google.com/privacy

### Email Service Provider

**Provider:** Configured via `EMAIL_PROVIDER` environment variable

**Data Sent:**
- Recipient email address
- User name (for personalization)
- Email content (verification, notifications)

**Security:**
- TLS encryption in transit
- API keys stored as environment variables
- No email content stored by provider beyond delivery logs

### Cloud Storage (S3-compatible)

**When:** User uploads media files

**Data Sent:**
- Media files (images, documents)
- Metadata (filename, size, content type)

**Access Control:**
- Pre-signed URLs with expiration
- Private bucket (not publicly listable)
- Access controlled by application

**Retention:**
- Files retained until explicitly deleted by user
- Deleted files removed from storage within 24 hours

### Hosting Provider

**Data Stored:**
- Application database (PostgreSQL)
- Application logs
- Redis cache (if enabled)

**Security:**
- Encrypted at rest
- Encrypted in transit (TLS)
- Access restricted to authorized personnel

## User Rights (GDPR Compliance)

### Right to Access
- Users can view all their data through the application interface
- Data export feature can be implemented following `EXPORT-FEATURE-STRATEGY.md`

### Right to Rectification
- Users can edit their profile, learners, goals, and schedules
- Changes take effect immediately

### Right to Erasure ("Right to be Forgotten")
- Account deletion available in settings
- All personal data removed within 30 days
- Some data retained for legal compliance (see Retention Policy)

### Right to Data Portability
- Not currently implemented
- Implementation strategy available in `app/features/privacy/EXPORT-FEATURE-STRATEGY.md`
- When implemented, export should be in machine-readable JSON format

### Right to Object
- Users can opt out of analytics via consent banner
- Users can opt out of marketing communications

### Right to Withdraw Consent
- Users can change consent preferences at any time via consent settings
- Changes apply immediately to future data collection

## Data Security Measures

### In Transit
- HTTPS enforced for all connections
- TLS 1.2+ required
- Secure headers (HSTS, CSP)

### At Rest
- Encrypted database backups
- Secure credential storage (Better Auth)
- Environment variables for secrets

### Access Control
- Role-based access control (RBAC)
- Permission-based authorization
- Session management with secure cookies
- IP-based rate limiting

### Monitoring
- Audit logs for sensitive operations
- Failed login attempt tracking
- Suspicious activity alerts (future)

## Compliance Checklist

- [x] Bilingual Privacy Policy (English, Indonesian)
- [x] Cookie consent banner with granular controls
- [x] Terms acceptance tracking with versioning
- [x] Data retention policy documented
- [x] Third-party data sharing documented
- [x] Consent history audit trail
- [ ] User data export (strategy documented, not implemented)
- [ ] Automated data cleanup jobs (recommended)
- [ ] Privacy policy change notification system (recommended)
- [ ] Account anonymization for soft deletes (recommended)

## Updating Privacy Policy or Terms

When updating the privacy policy or terms of service:

1. **Update version numbers:**
   ```typescript
   // In app/features/privacy/services/terms.service.ts
   const CURRENT_TERMS_VERSION = '2.0.0'
   const CURRENT_PRIVACY_VERSION = '2.0.0'
   ```

2. **Update message files:**
   - `messages/en.json`: Update `privacy_version`, `privacy_last_updated_date`
   - `messages/id.json`: Update Indonesian translations

3. **Update page content:**
   - Modify privacy/terms section content in message files
   - Recompile with `pnpm paraglide-js compile`

4. **Notify users:**
   - Consent banner will automatically show for all users
   - Consider email notification for major changes

5. **Record acceptances:**
   - New acceptances will reference the new version
   - Consent history maintains full audit trail

## Developer Notes

- Never log or expose PII in error messages
- Always hash IP addresses before storing
- Use parameterized queries (Drizzle handles this)
- Validate all user input
- Follow principle of least privilege for data access
- Document any new third-party integrations here

## Support and Questions

For questions about privacy features or compliance:
- Review this document
- Check `app/features/privacy/` implementation
- Consult AGENTS.md for coding standards
- Contact legal/compliance team for policy questions
