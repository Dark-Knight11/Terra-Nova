# Neon PostgreSQL - Advanced Features Setup Guide

This document explains the advanced Neon features implemented in this project and how to use them.

## 1. Connection Pooling Optimization ✅

**What it does**: Separates pooled connections (for app queries) from direct connections (for migrations).

**Configuration**:
- `DATABASE_URL`: Uses Neon's `-pooler` endpoint for all application queries
- `DIRECT_DATABASE_URL`: Uses direct endpoint for Prisma migrations and introspection

**Your Neon URLs**:
```bash
# In your .env file:
# Pooled (for app queries) - includes "-pooler" in the hostname
DATABASE_URL="postgresql://user:password@ep-fancy-cake-a10e6ph8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Direct (for migrations) - without "-pooler"
DIRECT_DATABASE_URL="postgresql://user:password@ep-fancy-cake-a10e6ph8.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

**Benefits**:
- No connection limit errors
- Faster query performance
- Better resource utilization

---

## 2. Row-Level Security (RLS) ✅

**What it does**: Database-level security that restricts data access based on user identity.

**Implementation**: SQL policies in `server/sql/rls_policies.sql`

**How to Apply**:
```bash
# Option 1: Via psql
psql "YOUR_DIRECT_DATABASE_URL" -f server/sql/rls_policies.sql

# Option 2: Via Neon SQL Editor (recommended)
# 1. Go to your Neon dashboard
# 2. Navigate to SQL Editor
# 3. Copy and paste the contents of server/sql/rls_policies.sql
# 4. Execute the SQL
```

**Security Rules**:
- **Companies**: Can only view/edit their own data
- **Auditors**: Can view companies they audit, can update verification status
- **Registries**: Can view all companies, can verify/reject
- **Carbon Credits**: Public read, companies can manage their own
- **Sessions**: Users can only access their own sessions

**RLS Functions**:
- `auth.user_id()`: Extracts user ID from JWT token
- `auth.user_role()`: Extracts role from JWT token

**Testing RLS**:
```sql
-- Test as a company user
SET request.jwt.claims = '{"userId": "user-123", "role": "COMPANY"}';
SELECT * FROM "Company"; -- Should only see their own data
```

---

## 3. Neon Serverless Driver ✅

**What it does**: HTTP-based database driver optimized for serverless/edge environments.

**Installed**: `@neondatabase/serverless` package

**Usage** (optional migration from Prisma):
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws; // For Node.js

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Query example
const result = await pool.query('SELECT * FROM "Company"');
```

**Benefits**:
- Works in edge runtimes (Vercel Edge, Cloudflare Workers)
- No connection pooler needed (uses HTTP)
- Lower latency for single queries
- No idle connections

**Current Setup**: We're using Prisma with pooling, but you can migrate critical endpoints to Neon's driver for edge deployment.

---

## 4. Database Branching

**What it does**: Create instant database copies for development/testing.

**How to Use**:

### Via Neon Dashboard:
1. Go to your Neon project
2. Click "Branches" in sidebar
3. Click "Create Branch"
4. Select parent branch (usually `main`)
5. Name it (e.g., `feature/new-api`)

### Via Neon CLI:
```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create a branch
neonctl branches create --name feature/new-api

# Get connection string
neonctl connection-string feature/new-api
```

### Use in Development:
```bash
# .env.development
DATABASE_URL="postgresql://...@feature-branch-pooler.neon.tech/..."

# Run migrations on branch
npm run prisma:migrate
```

**Benefits**:
- Instant copies (no data copying)
- Test migrations safely
- Preview environments for PRs
- Isolated development databases

**Workflow Example**:
1. Create branch for feature
2. Test schema changes
3. Merge to main
4. Delete branch (auto-deleted after 7 days)

---

## Best Practices

### 1. Use Pooled Connection for App
```typescript
// ✅ Good - uses DATABASE_URL (pooled)
const companies = await prisma.company.findMany();
```

### 2. Use Direct Connection for Migrations
```bash
# ✅ Automatic - Prisma uses DIRECT_DATABASE_URL
npm run prisma:migrate
```

### 3. Set JWT Claims in Middleware
```typescript
// In your auth middleware after JWT verification
await prisma.$executeRaw`
  SELECT set_config('request.jwt.claims', 
    '{"userId": "${userId}", "role": "${role}"}', 
    true)
`;
```

### 4. Enable RLS in Production
```sql
-- After applying RLS policies, test thoroughly
-- Then enable in production
```

### 5. Monitor Connection Pool
Check Neon dashboard for:
- Active connections
- Query performance
- Connection pool saturation

---

## Troubleshooting

### Migration Fails
**Problem**: `error: prepared statement "s0" already exists`
**Solution**: Use `DIRECT_DATABASE_URL` (without pooler)

### RLS Blocks All Queries
**Problem**: Queries return empty even with valid JWT
**Solution**: Check JWT claims are set:
```sql
SELECT current_setting('request.jwt.claims', true);
```

### Too Many Connections
**Problem**: `sorry, too many clients already`
**Solution**: Switch to pooled endpoint (`-pooler`)

---

## Performance Tips

1. **Use Prepared Statements** with Neon Driver for repeated queries
2. **Cache Read-Heavy Queries** (user profiles, company data)
3. **Use Database Branching** for load testing
4. **Monitor via Neon Dashboard**: Query insights, slow queries
5. **Enable pgBouncer** in Neon for even better pooling

---

## Migration Checklist

- [x] Update DATABASE_URL to use `-pooler` endpoint
- [x] Add DIRECT_DATABASE_URL without `-pooler`
- [x] Update Prisma schema with `directUrl`
- [ ] Apply RLS policies to Neon database
- [ ] Set JWT claims in auth middleware
- [ ] Test RLS with different user roles
- [ ] Create development branch for testing
- [ ] Set up CI/CD to use branches for PRs

---

## Additional Resources

- [Neon Docs](https://neon.tech/docs)
- [Connection Pooling Guide](https://neon.tech/docs/connect/connection-pooling)
- [Branching Documentation](https://neon.tech/docs/guides/branching)
- [RLS in PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
