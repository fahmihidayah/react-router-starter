# Feature Flags Documentation

This document describes all feature toggles available in the Learning Tracker application. All features are controlled via environment variables and validated through t3-env in `app/env.ts`.

## Table of Contents

1. [Authentication Features](#authentication-features)
2. [Security Features](#security-features)
3. [Email Configuration](#email-configuration)
4. [Storage Configuration](#storage-configuration)
5. [Analytics & Tracking](#analytics--tracking)
6. [Observability](#observability)
7. [Quick Reference](#quick-reference)

---

## Authentication Features

### Google OAuth

Enable Google Sign-In for user authentication.

**Environment Variables:**
```env
GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Configuration:**
- **File**: `app/env.ts:71-83`
- **Default**: `false` (disabled)
- **Validation**: When enabled, both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are required (lines 297-303)

**How to Enable:**
1. Create a Google OAuth application in [Google Cloud Console](https://console.cloud.google.com/)
2. Set authorized redirect URIs (e.g., `https://yourdomain.com/api/auth/callback/google`)
3. Copy the Client ID and Client Secret
4. Add to your `.env` file
5. Set `GOOGLE_AUTH_ENABLED=true`

**Usage:**
- Controls whether the "Continue with Google" button appears on login/register pages
- Configured in `app/features/auth/config.server.ts:12-29`

---

## Security Features

### reCAPTCHA

Add bot protection to registration forms.

**Environment Variables:**
```env
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_MIN_SCORE=0.5
```

**Configuration:**
- **File**: `app/env.ts:88-100`
- **Default**: `false` (disabled)
- **Min Score**: `0.5` (default) - Scores range from 0.0 (bot) to 1.0 (human)
- **Validation**: When enabled, both site key and secret key are required (lines 306-312)

**How to Enable:**
1. Register your site at [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Choose reCAPTCHA v3 (recommended) or v2
3. Add your domain
4. Copy the Site Key and Secret Key
5. Add to your `.env` file
6. Set `RECAPTCHA_ENABLED=true`

**Usage:**
- Protects registration endpoints from bots
- Configured in `app/features/auth/config.server.ts:21-27`

---

### Rate Limiting

Protect API endpoints from abuse with request rate limiting.

**Environment Variables:**
```env
RATE_LIMIT_ENABLED=true  # Auto-enabled in production
RATE_LIMIT_REDIS_URL=redis://localhost:6379
# Or use generic REDIS_URL as fallback
REDIS_URL=redis://localhost:6379
RATE_LIMIT_REDIS_PREFIX=learning-tracker:rate-limit
```

**Configuration:**
- **File**: `app/env.ts:105-130`
- **Default**: Automatically enabled in `production`, disabled in `development`/`test`
- **Validation**: When enabled (and not in test), Redis URL is required (lines 314-322)

**Behavior:**
```typescript
// Auto-enabled in production
if (value === undefined) {
  return process.env.NODE_ENV === 'production'
}
```

**How to Configure:**
1. **Production**: Automatically enabled - ensure Redis is configured
2. **Development**: Set `RATE_LIMIT_ENABLED=true` to test rate limiting locally
3. **Custom Prefix**: Use `RATE_LIMIT_REDIS_PREFIX` to namespace rate limit keys

**Redis Setup:**
- Local: `docker run -d -p 6379:6379 redis:alpine`
- Production: Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)

---

## Email Configuration

### Email Provider

Choose between SMTP or Resend for sending emails.

**Environment Variables:**
```env
# Provider selection
EMAIL_PROVIDER=smtp  # or "resend"
EMAIL_DELIVERY_MODE=direct  # or "rabbitmq"

# SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Resend configuration (if EMAIL_PROVIDER=resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Common settings
EMAIL_FROM=no-reply@learningtracker.com
EMAIL_FROM_NAME=Learning Tracker
EMAIL_REPLY_TO=support@learningtracker.com
EMAIL_SUPPORT_ADDRESS=support@learningtracker.com

# Branding
EMAIL_APP_NAME=Learning Tracker
EMAIL_LOGO_URL=https://yourdomain.com/email-logo.png
```

**Configuration:**
- **File**: `app/env.ts:135-191`
- **Provider Default**: `smtp`
- **Delivery Mode Default**: `direct`

**Providers:**

#### 1. SMTP (Default)
Use any SMTP server (Gmail, SendGrid, Mailgun, etc.)

**Required variables when using SMTP:**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

**Optional:**
- `SMTP_SECURE` (default: `false`)

#### 2. Resend
Modern email API service.

**Required variables when using Resend:**
- `RESEND_API_KEY`

**How to switch:**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Test Email Endpoint

Enable a test endpoint for sending test emails (non-production only).

**Environment Variables:**
```env
EMAIL_TEST_ENDPOINT_ENABLED=true
```

**Configuration:**
- **File**: `app/env.ts:137-147`
- **Default**: Enabled outside production, disabled in production
- **Usage**: `app/features/email/config.server.ts:35-37`

**Behavior:**
```typescript
// Auto-disabled in production
if (value === undefined) {
  return process.env.NODE_ENV !== 'production'
}
```

**Access:**
- Endpoint: `/api/email/test` (when enabled)
- Use for testing email templates and configuration in development

---

## Storage Configuration

### Media Storage Driver

Choose between local file system or AWS S3 for media uploads.

**Environment Variables:**

#### Local Storage (Default)
```env
MEDIA_STORAGE_DRIVER=local
MEDIA_UPLOAD_DIR=./uploads/media
MEDIA_LOCAL_BASE_URL=/api/media/files
```

#### AWS S3 Storage
```env
MEDIA_STORAGE_DRIVER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET=your-bucket-name
S3_BUCKET_REGION=us-east-1
S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

**Configuration:**
- **File**: `app/env.ts:196-229`
- **Default**: `local`
- **Validation**: When using S3, AWS credentials and bucket name are required (lines 343-349)

**How to Switch to S3:**

1. **Create S3 Bucket:**
   - Go to AWS S3 Console
   - Create a new bucket
   - Configure bucket policy for public read (if needed)

2. **Create IAM User:**
   - Create IAM user with S3 permissions
   - Generate Access Key ID and Secret Access Key

3. **Update Environment:**
   ```env
   MEDIA_STORAGE_DRIVER=s3
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET=your-bucket-name
   ```

**Storage Comparison:**

| Feature | Local | S3 |
|---------|-------|-----|
| **Cost** | Free (server storage) | Pay per GB + requests |
| **Scalability** | Limited by disk | Unlimited |
| **CDN** | Manual setup | CloudFront integration |
| **Backup** | Manual | Automatic versioning available |
| **Multi-server** | Requires shared filesystem | Works out of the box |

---

## Analytics & Tracking

### Google Tag Manager

Add Google Analytics and other tracking scripts.

**Environment Variables:**
```env
GTM_CONTAINER_ID=GTM-XXXXXXX
```

**Configuration:**
- **File**: `app/env.ts:234-239`
- **Format Validation**: Must match pattern `GTM-[A-Z0-9]+`
- **Default**: `undefined` (disabled)

**How to Enable:**
1. Create a Google Tag Manager account at [tagmanager.google.com](https://tagmanager.google.com)
2. Create a container for your website
3. Copy the Container ID (format: `GTM-XXXXXXX`)
4. Add to `.env`:
   ```env
   GTM_CONTAINER_ID=GTM-XXXXXXX
   ```

**Usage:**
- Loaded in `app/root.tsx:38-42`
- Components used:
  - `GoogleTagManagerHead` (line 73)
  - `GoogleTagManagerNoScript` (line 78)
  - `GoogleTagManagerPageViews` (line 82)

---

### Consent Banner

Display a GDPR/privacy consent banner.

**Environment Variables:**
```env
CONSENT_BANNER_ENABLED=true
```

**Configuration:**
- **File**: `app/env.ts:244`
- **Default**: `true` (enabled)

**How to Disable:**
```env
CONSENT_BANNER_ENABLED=false
```

**Usage:**
- Rendered in `app/root.tsx:66, 81`
- Component: `app/features/privacy/components/ConsentBanner`

**When to Enable:**
- **Required**: If serving users in EU (GDPR)
- **Recommended**: For all applications using analytics/tracking
- **Optional**: Internal tools with no external tracking

---

## Observability

### Metrics & Monitoring

Enable application metrics and error tracking.

**Environment Variables:**
```env
# Metrics
OBSERVABILITY_METRICS_ENABLED=true
OBSERVABILITY_METRICS_TOKEN=your-secure-token-min-16-chars

# Sentry (error tracking)
OBSERVABILITY_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Environment & Release tracking
OBSERVABILITY_ENVIRONMENT=production
OBSERVABILITY_RELEASE=v1.2.3
```

**Configuration:**
- **File**: `app/env.ts:249-253`
- **Defaults**: All disabled
- **Validation**: In production, if metrics enabled, token is required (lines 352-360)

**Features:**

#### 1. Metrics
Application performance metrics (response times, request counts, etc.)

**Required:**
- `OBSERVABILITY_METRICS_ENABLED=true`
- `OBSERVABILITY_METRICS_TOKEN` (min 16 characters in production)

#### 2. Sentry Error Tracking
Automatic error reporting and monitoring

**Required:**
- `OBSERVABILITY_SENTRY_DSN` (get from [sentry.io](https://sentry.io))

**Optional:**
- `OBSERVABILITY_ENVIRONMENT` - Tag errors by environment
- `OBSERVABILITY_RELEASE` - Track errors by version

**How to Enable Sentry:**
1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project
3. Copy the DSN
4. Add to `.env`:
   ```env
   OBSERVABILITY_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   OBSERVABILITY_ENVIRONMENT=production
   OBSERVABILITY_RELEASE=1.0.0
   ```

---

## Quick Reference

### Feature Toggle Summary

| Feature | Env Variable | Default | Production Recommended |
|---------|-------------|---------|----------------------|
| **Authentication** |
| Google OAuth | `GOOGLE_AUTH_ENABLED` | `false` | Optional |
| **Security** |
| reCAPTCHA | `RECAPTCHA_ENABLED` | `false` | Recommended |
| Rate Limiting | `RATE_LIMIT_ENABLED` | Auto (prod: on) | Required |
| **Email** |
| Provider | `EMAIL_PROVIDER` | `smtp` | `smtp` or `resend` |
| Test Endpoint | `EMAIL_TEST_ENDPOINT_ENABLED` | Auto (prod: off) | `false` |
| **Storage** |
| Media Driver | `MEDIA_STORAGE_DRIVER` | `local` | `s3` recommended |
| **Analytics** |
| Google Tag Manager | `GTM_CONTAINER_ID` | `undefined` | Optional |
| Consent Banner | `CONSENT_BANNER_ENABLED` | `true` | `true` |
| **Observability** |
| Metrics | `OBSERVABILITY_METRICS_ENABLED` | `false` | Recommended |
| Sentry | `OBSERVABILITY_SENTRY_DSN` | `undefined` | Recommended |

---

### Environment Variable Groups

Copy these templates to get started:

#### Minimal Production Configuration
```env
# App basics
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Auth (choose one or both)
BETTER_AUTH_SECRET=your-32-char-secret-key
BETTER_AUTH_URL=https://yourdomain.com

# Email (SMTP example)
EMAIL_PROVIDER=smtp
EMAIL_FROM=no-reply@yourdomain.com
EMAIL_FROM_NAME=Learning Tracker
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security (auto-enabled in production)
RATE_LIMIT_ENABLED=true
REDIS_URL=redis://your-redis:6379
```

#### Full Production Configuration
```env
# App
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Auth
BETTER_AUTH_SECRET=your-32-char-secret-key
BETTER_AUTH_URL=https://yourdomain.com

# Google OAuth
GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# reCAPTCHA
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=6Lxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxx

# Rate Limiting
RATE_LIMIT_ENABLED=true
REDIS_URL=redis://your-redis:6379

# Email (Resend example)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=no-reply@yourdomain.com
EMAIL_FROM_NAME=Learning Tracker
EMAIL_APP_NAME=Learning Tracker

# S3 Storage
MEDIA_STORAGE_DRIVER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
S3_BUCKET=your-bucket

# Analytics
GTM_CONTAINER_ID=GTM-XXXXXXX
CONSENT_BANNER_ENABLED=true

# Observability
OBSERVABILITY_METRICS_ENABLED=true
OBSERVABILITY_METRICS_TOKEN=your-secure-token
OBSERVABILITY_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
OBSERVABILITY_ENVIRONMENT=production
OBSERVABILITY_RELEASE=1.0.0
```

#### Development Configuration
```env
# App
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learning_tracker

# Auth
BETTER_AUTH_SECRET=dev-secret-min-32-characters-long
BETTER_AUTH_URL=http://localhost:5173

# Email (test mode)
EMAIL_PROVIDER=smtp
EMAIL_TEST_ENDPOINT_ENABLED=true
SMTP_HOST=localhost
SMTP_PORT=1025  # Use Mailhog or similar

# Storage
MEDIA_STORAGE_DRIVER=local
MEDIA_UPLOAD_DIR=./uploads/media

# Security (disabled for dev)
RATE_LIMIT_ENABLED=false
RECAPTCHA_ENABLED=false
GOOGLE_AUTH_ENABLED=false

# Analytics (disabled for dev)
CONSENT_BANNER_ENABLED=false
```

---

## Validation & Error Handling

All environment variables are validated at application startup via t3-env in `app/env.ts`.

### Validation Rules

1. **Required Dependencies**: If feature is enabled, related vars must be set
2. **Format Validation**: URLs, emails, and specific patterns are validated
3. **Cross-field Validation**: Some features require multiple variables together
4. **Type Coercion**: Boolean strings (`"true"`/`"false"`) are converted to booleans

### Common Validation Errors

#### Google OAuth
```
Error: When GOOGLE_AUTH_ENABLED is true, both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided
```
**Fix**: Set both client ID and secret when enabling Google OAuth

#### reCAPTCHA
```
Error: When RECAPTCHA_ENABLED is true, both RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY must be provided
```
**Fix**: Set both reCAPTCHA keys when enabling reCAPTCHA

#### Rate Limiting
```
Error: When RATE_LIMIT_ENABLED is true, either RATE_LIMIT_REDIS_URL or REDIS_URL must be provided
```
**Fix**: Configure Redis connection when enabling rate limiting

#### S3 Storage
```
Error: When MEDIA_STORAGE_DRIVER is "s3", AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET must be provided
```
**Fix**: Set all required AWS credentials when using S3

#### Metrics
```
Error: When OBSERVABILITY_METRICS_ENABLED is true in production, OBSERVABILITY_METRICS_TOKEN must be provided and be at least 16 characters
```
**Fix**: Set a secure token (min 16 chars) for production metrics

---

## Testing Feature Flags

### In Development

1. **Create `.env.local`** (not committed):
   ```env
   # Override specific features
   GOOGLE_AUTH_ENABLED=true
   GOOGLE_CLIENT_ID=test-id
   GOOGLE_CLIENT_SECRET=test-secret
   ```

2. **Test the feature** in your local environment

3. **Verify validation** by intentionally breaking config

### In Staging

1. **Mirror production config** in staging environment
2. **Test all enabled features** before deploying to production
3. **Verify error tracking** (Sentry) is working

### In Production

1. **Enable features gradually** (one at a time)
2. **Monitor metrics** after enabling new features
3. **Have rollback plan** (disable flag if issues occur)

---

## Best Practices

1. **Use `.env.example`** as your template (already updated)
2. **Never commit `.env`** files to version control
3. **Document custom flags** if you add new features
4. **Test in staging** before enabling in production
5. **Monitor after changes** to catch issues early
6. **Keep secrets secure** - use secret management tools in production
7. **Version your `.env.example`** so team members stay in sync

---

## Adding New Feature Flags

If you need to add a new feature flag:

1. **Add to `app/env.ts`** in the appropriate section:
   ```typescript
   MY_FEATURE_ENABLED: booleanString.default(false),
   ```

2. **Add cross-validation** if needed:
   ```typescript
   if (env.MY_FEATURE_ENABLED && !env.REQUIRED_VAR) {
     throw new Error('MY_FEATURE requires REQUIRED_VAR')
   }
   ```

3. **Update `.env.example`** with documentation:
   ```env
   # My Feature - does something amazing
   MY_FEATURE_ENABLED=false
   ```

4. **Document in this file** under the appropriate section

5. **Create feature config** in `app/features/*/config.server.ts`:
   ```typescript
   export function getMyFeatureConfig() {
     return {
       enabled: env.MY_FEATURE_ENABLED,
       // other config...
     }
   }
   ```

---

## Support & Resources

- **Environment Schema**: `app/env.ts`
- **Example Config**: `.env.example`
- **Auth Config**: `app/features/auth/config.server.ts`
- **Email Config**: `app/features/email/config.server.ts`

For questions or issues, refer to the main `AGENTS.md` documentation or project README.
