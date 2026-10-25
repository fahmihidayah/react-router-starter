# Data Export Feature Strategy

This document outlines a generic, reusable strategy for implementing GDPR-compliant data export functionality in any web application. The approach can be adapted to various technology stacks and database schemas.

## Overview

The **Right to Data Portability** (GDPR Article 20) requires that users can obtain their personal data in a structured, commonly used, and machine-readable format. This strategy provides a blueprint for implementing this requirement.

## Core Requirements

### Legal Requirements (GDPR)

1. **Complete Data Coverage**: Export must include ALL personal data processed by the application
2. **Machine-Readable Format**: JSON, XML, or CSV are acceptable formats
3. **Structured and Portable**: Data should be easily importable to another system
4. **Timely Response**: Must be provided within 30 days of request (shorter is better)
5. **Authentication**: Verify the requester's identity before providing data
6. **No Cost**: The export must be provided free of charge

### Technical Requirements

1. **Authorization**: Only authenticated users can export their own data
2. **Data Sanitization**: Never export passwords, tokens, or internal system IDs
3. **Soft-Deleted Records**: Decide whether to include or exclude
4. **Related Data**: Include all data linked to the user (cascading exports)
5. **Export Metadata**: Include export timestamp and version for auditability

## Architecture Pattern

### Three-Layer Approach

```
┌─────────────────────────────────────────┐
│  1. API Route Layer                     │
│  - Authentication & authorization       │
│  - HTTP response handling               │
│  - Content-Type and disposition headers │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. Service Layer                       │
│  - Business logic & orchestration       │
│  - Data aggregation & transformation    │
│  - Error handling & logging             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. Query/Repository Layer              │
│  - Database queries scoped to userId    │
│  - Individual entity fetching           │
│  - Type-safe data retrieval             │
└─────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Identify All User Data Tables

Create an inventory of all database tables/collections that contain user data:

**Example Inventory:**
```
Core User Data:
- users (profile, email, preferences)
- user_sessions
- user_consents
- terms_acceptances

Domain-Specific Data:
- learners (child profiles)
- learner_groups
- goals
- activities
- schedules
- schedule_items
- media_files

Audit & Compliance:
- consent_history
- audit_logs (optional)
```

### Step 2: Design the Export Schema

Define a consistent JSON structure that's both human-readable and machine-parsable:

```typescript
interface DataExport {
  // Export metadata
  exportedAt: string        // ISO 8601 timestamp
  exportVersion: string     // Schema version (e.g., "1.0.0")

  // Core user data
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    createdAt: string
    updatedAt: string
    // ... other user fields (NEVER include password)
  }

  // Domain entities (arrays of related data)
  domainEntityA: EntityA[]
  domainEntityB: EntityB[]

  // Audit data (if applicable)
  consents: Consent[]
  termsAcceptances: TermsAcceptance[]
}
```

**Best Practices for Schema Design:**
- Use ISO 8601 for all timestamps
- Include both human-readable labels and IDs where applicable
- Group related data logically
- Use consistent naming conventions
- Document the schema version for future compatibility

### Step 3: Implement Query Layer

Create database queries that fetch user-scoped data:

**Generic Pattern (SQL):**
```sql
-- Always scope queries to the authenticated user
SELECT * FROM table_name WHERE user_id = $userId;

-- For related data through foreign keys
SELECT child.* FROM child_table child
INNER JOIN parent_table parent ON child.parent_id = parent.id
WHERE parent.user_id = $userId;
```

**Generic Pattern (ORM/Query Builder):**
```typescript
// Direct user ownership
const userRecords = await db
  .select()
  .from(tableName)
  .where(eq(tableName.userId, userId))

// Indirect ownership through relationships
const relatedRecords = await db
  .select()
  .from(childTable)
  .innerJoin(parentTable, eq(childTable.parentId, parentTable.id))
  .where(eq(parentTable.userId, userId))
```

**Key Principles:**
- Every query MUST scope to the authenticated user
- Never fetch data belonging to other users
- Handle missing data gracefully (empty arrays, not errors)
- Consider performance (add indexes on userId columns)

### Step 4: Implement Service Layer

Orchestrate all queries and transform data into the export format:

```typescript
async function exportUserData(userId: string): Promise<DataExport | null> {
  // 1. Fetch core user data
  const user = await getUserById(userId)
  if (!user) return null

  // 2. Fetch all related entities (in parallel for performance)
  const [
    entityA,
    entityB,
    entityC,
    consents,
    terms,
  ] = await Promise.all([
    getEntityAByUserId(userId),
    getEntityBByUserId(userId),
    getEntityCByUserId(userId),
    getConsentsForUser(userId),
    getTermsAcceptancesForUser(userId),
  ])

  // 3. Sanitize sensitive data
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    // NEVER include: password, passwordHash, authTokens, etc.
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }

  // 4. Build the export object
  return {
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0.0',
    user: sanitizedUser,
    entityA,
    entityB,
    entityC,
    consents,
    termsAcceptances: terms,
  }
}
```

### Step 5: Implement API Endpoint

Create a protected API route that returns the export:

**REST API Example:**
```
GET /api/data-export
Authorization: Bearer <token> or Session cookie
Response: application/json
Content-Disposition: attachment; filename="data-export-{userId}-{timestamp}.json"
```

**Implementation Pattern:**
```typescript
// Pseudo-code for any framework
async function handleDataExport(request) {
  // 1. Authenticate & get user
  const user = await authenticateRequest(request)
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  // 2. Check permission (if using RBAC)
  if (!userHasPermission(user, 'account.read')) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  // 3. Generate export
  const exportData = await exportUserData(user.id)
  if (!exportData) {
    return jsonResponse({ error: 'User not found' }, 404)
  }

  // 4. Return as downloadable JSON
  const filename = `data-export-${user.id}-${Date.now()}.json`

  return jsonResponse(exportData, 200, {
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  })
}
```

### Step 6: Add UI Integration

Provide users with an easy way to request their data:

**User Settings Page:**
```
Privacy & Data
├─ Download Your Data
│  ├─ Description: "Get a copy of all your data in JSON format"
│  └─ Button: "Download Data Export"
│
├─ What's Included?
│  ├─ Profile information
│  ├─ Content you've created
│  ├─ Activity history
│  └─ Consent and terms records
```

**UI Implementation Tips:**
- Add loading state (export can take time for large datasets)
- Show success/error messages
- Provide help text explaining what's included
- Consider email delivery for very large exports (async pattern)

## Performance Considerations

### For Small Datasets (< 10MB)

**Synchronous Export:**
- Generate export on-demand in the API request
- Return JSON directly in HTTP response
- Simple, immediate user experience

### For Large Datasets (> 10MB)

**Asynchronous Export with Job Queue:**

```
User Request → Create Export Job → Return "Processing" Response
                      ↓
                 Queue Worker
                      ↓
              Generate Export
                      ↓
           Store in Object Storage (S3, etc.)
                      ↓
      Send Email with Download Link
```

**Benefits:**
- Prevents timeout issues
- Better server resource management
- Allows for progress tracking
- Download links can have expiration (security)

**Job Queue Pattern:**
```typescript
// When user requests export
async function requestDataExport(userId: string) {
  const jobId = await createExportJob({
    userId,
    status: 'pending',
    createdAt: new Date(),
  })

  // Enqueue background job
  await queue.publish('data-export', { jobId, userId })

  return { jobId, status: 'processing' }
}

// Background worker
async function processExportJob(jobId: string, userId: string) {
  try {
    // Generate export
    const exportData = await exportUserData(userId)

    // Upload to storage
    const url = await uploadToStorage(
      `exports/${userId}/${jobId}.json`,
      JSON.stringify(exportData, null, 2)
    )

    // Update job status
    await updateExportJob(jobId, {
      status: 'completed',
      downloadUrl: url,
      completedAt: new Date(),
    })

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: 'Your data export is ready',
      body: `Download your data: ${url} (expires in 7 days)`,
    })
  } catch (error) {
    await updateExportJob(jobId, { status: 'failed' })
    // Log error, send notification
  }
}
```

## Security Considerations

### Authentication & Authorization

1. **Require Active Session**: User must be logged in
2. **Verify Identity**: Consider re-authentication for sensitive exports
3. **Rate Limiting**: Prevent abuse (e.g., 1 export per hour per user)
4. **Audit Logging**: Log all export requests with IP and timestamp

### Data Protection

1. **Sanitization**:
   ```typescript
   // NEVER export these fields
   const EXCLUDED_FIELDS = [
     'password',
     'passwordHash',
     'passwordSalt',
     'authToken',
     'refreshToken',
     'apiKey',
     'resetToken',
   ]
   ```

2. **Encryption in Transit**: Always use HTTPS
3. **Temporary Storage**: If using async exports, auto-delete after 7-30 days
4. **Access Control**: Pre-signed URLs with expiration for cloud storage

### Privacy Compliance

1. **Consent**: User initiates the request (no automatic exports)
2. **Scope**: Export only data belonging to the requesting user
3. **Audit Trail**: Record who requested what and when
4. **Data Minimization**: Include only necessary metadata

## Testing Strategy

### Unit Tests

Test each query function:
```typescript
describe('exportUserData', () => {
  it('should return null if user does not exist', async () => {
    const result = await exportUserData('nonexistent-id')
    expect(result).toBeNull()
  })

  it('should include all user entities', async () => {
    const result = await exportUserData('test-user-id')
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('entityA')
    expect(result).toHaveProperty('entityB')
  })

  it('should never export password fields', async () => {
    const result = await exportUserData('test-user-id')
    expect(result?.user).not.toHaveProperty('password')
    expect(result?.user).not.toHaveProperty('passwordHash')
  })

  it('should only export data for the specified user', async () => {
    const result = await exportUserData('user-1')
    // Verify all entities belong to user-1, not other users
    expect(result?.entityA.every(e => e.userId === 'user-1')).toBe(true)
  })
})
```

### Integration Tests

Test the API endpoint:
```typescript
describe('GET /api/data-export', () => {
  it('should return 401 if not authenticated', async () => {
    const response = await fetch('/api/data-export')
    expect(response.status).toBe(401)
  })

  it('should return JSON export for authenticated user', async () => {
    const response = await authenticatedFetch('/api/data-export')
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')

    const data = await response.json()
    expect(data).toHaveProperty('exportedAt')
    expect(data).toHaveProperty('user')
  })

  it('should set download filename header', async () => {
    const response = await authenticatedFetch('/api/data-export')
    const disposition = response.headers.get('Content-Disposition')
    expect(disposition).toContain('attachment')
    expect(disposition).toContain('data-export')
  })
})
```

### Manual Testing Checklist

- [ ] Export includes all expected entities
- [ ] No password or sensitive tokens in export
- [ ] Export only includes data for authenticated user
- [ ] Download triggers with correct filename
- [ ] JSON is valid and properly formatted
- [ ] Export works for users with minimal data
- [ ] Export works for users with large datasets
- [ ] Unauthorized requests are rejected
- [ ] Rate limiting prevents abuse

## Technology-Specific Examples

### Node.js + PostgreSQL + Drizzle ORM

```typescript
// app/features/privacy/queries/data-export.queries.ts
import { eq } from 'drizzle-orm'
import { db } from '~/lib/database'
import { users, learners, goals } from '~/db/schema'

export async function exportUserData(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) return null

  const userLearners = await db.select().from(learners).where(eq(learners.userId, userId))
  const userGoals = await db.select().from(goals).where(eq(goals.userId, userId))

  return {
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0.0',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    learners: userLearners,
    goals: userGoals,
  }
}
```

### Python + Django

```python
# api/views.py
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import json

@login_required
def data_export(request):
    user = request.user

    export_data = {
        'exportedAt': datetime.now().isoformat(),
        'exportVersion': '1.0.0',
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'dateJoined': user.date_joined.isoformat(),
        },
        'posts': list(user.posts.values()),
        'comments': list(user.comments.values()),
    }

    response = JsonResponse(export_data)
    response['Content-Disposition'] = f'attachment; filename="data-export-{user.id}.json"'
    return response
```

### Ruby on Rails

```ruby
# app/controllers/api/data_export_controller.rb
class Api::DataExportController < ApplicationController
  before_action :authenticate_user!

  def index
    export_data = {
      exportedAt: Time.current.iso8601,
      exportVersion: '1.0.0',
      user: current_user.as_json(except: [:password_digest, :reset_token]),
      posts: current_user.posts,
      comments: current_user.comments,
    }

    send_data export_data.to_json,
              filename: "data-export-#{current_user.id}-#{Time.current.to_i}.json",
              type: 'application/json',
              disposition: 'attachment'
  end
end
```

## Maintenance & Updates

### Versioning Strategy

Use semantic versioning for the export schema:

- **Major version** (2.0.0): Breaking changes (field removed, renamed)
- **Minor version** (1.1.0): New fields added
- **Patch version** (1.0.1): Bug fixes, no schema changes

### When to Update

Update the export when:
1. New database tables are added that store user data
2. New fields are added to existing user data tables
3. Data relationships change
4. User-facing features change data structure

### Backward Compatibility

Maintain backward compatibility when possible:
- Deprecate fields before removing (include with null value + deprecation notice)
- Add new fields without removing old ones
- Document changes in a changelog

## Monitoring & Metrics

Track these metrics:

1. **Export Request Volume**: Requests per day/week/month
2. **Export Generation Time**: P50, P95, P99 latencies
3. **Export Size**: Average and maximum export sizes
4. **Failure Rate**: Percentage of failed export requests
5. **User Satisfaction**: Follow-up surveys on export usefulness

## Common Pitfalls to Avoid

1. **Forgetting Relationships**: Missing foreign key data
2. **Exposing Secrets**: Accidentally exporting passwords or tokens
3. **Missing Authorization**: Not verifying user owns the data
4. **Performance Issues**: N+1 queries, missing indexes
5. **Incomplete Data**: Not including all personal data
6. **No Versioning**: Unable to handle schema changes
7. **Timeout Issues**: Synchronous exports for large datasets
8. **No Audit Trail**: Not logging export requests

## Further Reading

- [GDPR Article 20: Right to Data Portability](https://gdpr-info.eu/art-20-gdpr/)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)
- [JSON Schema for API Documentation](https://json-schema.org/)
- [OAuth 2.0 for API Authorization](https://oauth.net/2/)

## Conclusion

Implementing data export functionality requires careful planning but follows predictable patterns. Key principles:

1. **User-centric**: Only export data belonging to the authenticated user
2. **Complete**: Include all personal data processed by your application
3. **Secure**: Never expose sensitive credentials or tokens
4. **Performant**: Use async patterns for large exports
5. **Auditable**: Log all export requests
6. **Maintainable**: Version your schema and document changes

This strategy can be adapted to any technology stack and serves as a starting point for GDPR-compliant data export implementations.
