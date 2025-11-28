# Neon PostgreSQL Integration - Quick Start

## ✅ Completed Optimizations

### 1. Connection Pooling (Active)
- **Pooled Connection**: All app queries use Neon's connection pooler
- **Direct Connection**: Migrations use direct endpoint
- **Status**: ✅ Configured in `prisma/schema.prisma`

### 2. Neon Serverless Driver (Ready)
- **Package**: `@neondatabase/serverless` installed
- **Usage**: Available for edge/serverless functions
- **File**: `src/db/client.ts`
- **Status**: ✅ Ready to use (currently using Prisma)

### 3. Row-Level Security (Pending Setup)
- **Policies**: Created in `sql/rls_policies.sql`
- **Status**: ⏳ **ACTION REQUIRED** - Apply to database
- **How to Apply**:
  
  **Option A: Neon SQL Editor (Recommended)**
  1. Go to [Neon Dashboard](https://console.neon.tech/)
  2. Select your project
  3. Click "SQL Editor"
  4. Copy contents of `server/sql/rls_policies.sql`
  5. Paste and execute

  **Option B: psql Command Line**
  ```bash
  # Get your DIRECT_DATABASE_URL from .env
psql "YOUR_DIRECT_DATABASE_URL" -f server/sql/rls_policies.sql
  ```

### 4. Database Branching (Available)
- **Status**: ✅ Ready to use via Neon Dashboard
- **Guide**: See `docs/NEON_ADVANCED_FEATURES.md`

---

## 🎯 Next Steps

### Immediate (Required for RLS):
1. **Apply RLS Policies** (5 minutes)
   - Follow instructions above to apply `sql/rls_policies.sql`
   
2. **Update Your .env file**:
   ```bash
   # Add DIRECT_DATABASE_URL (without -pooler)
   DIRECT_DATABASE_URL="postgresql://user:pass@ep-fancy-cake-a10e6ph8.ap-southeast-1.aws.neon.tech/neondb"
   ```

3. **Restart Backend Server**:
   ```bash
   npm run server:dev
   ```

### Optional (For Advanced Use):
1. **Test RLS**: Try creating/viewing data with different user roles
2. **Create Dev Branch**: Set up a development database branch
3. **Migrate to Neon Driver**: Switch critical endpoints to serverless driver

---

## 📊 Benefits You're Getting

| Feature | Benefit | Status |
|---------|---------|--------|
| Connection Pooling | No connection limits, faster queries | ✅ Active |
| Neon Serverless | Edge deployment ready | ✅ Available |
| Row-Level Security | Database-level data isolation | ⏳ Needs setup |
| Database Branching | Safe testing, preview environments | ✅ Available |

---

## 🔒 Security with RLS

Once RLS is applied:
- **Companies** can only see/edit their own data
- **Auditors** can view companies, update verification
- **Registries** have broader access for oversight
- **Carbon Credits** are public, but only owners can manage
- **Sessions** are strictly user-isolated

---

## 📚 Documentation

- **Full Guide**: `server/docs/NEON_ADVANCED_FEATURES.md`
- **RLS Policies**: `server/sql/rls_policies.sql`
- **DB Client**: `server/src/db/client.ts`

---

## ⚠️ Important Notes

1. **RLS Requires Setup**: Policies won't work until you apply the SQL file
2. **Test Before Production**: Test RLS thoroughly with different roles
3. **Connection URLs**: Ensure `.env` has both DATABASE_URL (pooled) and DIRECT_DATABASE_URL
4. **Neon Dashboard**: Monitor connections and performance

---

## 🚀 Quick Test

After applying RLS:
```bash
# Create a test user and company
npm run server:dev

# Use the API to register and create a company
# Then try to access another user's company (should fail)
```

---

**Need Help?** See `docs/NEON_ADVANCED_FEATURES.md` for troubleshooting and detailed guides.
