-- Enable Row Level Security on tables
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Auditor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Registry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CarbonCredit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS TEXT AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'userId';
$$ LANGUAGE SQL STABLE;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'role';
$$ LANGUAGE SQL STABLE;

-- ============================================
-- COMPANY POLICIES
-- ============================================

-- Companies can read their own data
CREATE POLICY "Companies can view own data"
  ON "Company"
  FOR SELECT
  USING (
    "userId" = auth.user_id()
    OR auth.user_role() IN ('AUDITOR', 'REGISTRY')
  );

-- Companies can update their own data
CREATE POLICY "Companies can update own data"
  ON "Company"
  FOR UPDATE
  USING ("userId" = auth.user_id())
  WITH CHECK ("userId" = auth.user_id());

-- Companies can insert their own data
CREATE POLICY "Companies can create own profile"
  ON "Company"
  FOR INSERT
  WITH CHECK ("userId" = auth.user_id() AND auth.user_role() = 'COMPANY');

-- Companies can delete their own data
CREATE POLICY "Companies can delete own data"
  ON "Company"
  FOR DELETE
  USING ("userId" = auth.user_id());

-- Auditors and Registries can update verification status
CREATE POLICY "Auditors can verify companies"
  ON "Company"
  FOR UPDATE
  USING (auth.user_role() IN ('AUDITOR', 'REGISTRY'))
  WITH CHECK (auth.user_role() IN ('AUDITOR', 'REGISTRY'));

-- ============================================
-- AUDITOR POLICIES
-- ============================================

-- Auditors can read their own data
CREATE POLICY "Auditors can view own data"
  ON "Auditor"
  FOR SELECT
  USING (
    "userId" = auth.user_id()
    OR auth.user_role() IN ('REGISTRY')
  );

-- Auditors can update their own data
CREATE POLICY "Auditors can update own data"
  ON "Auditor"
  FOR UPDATE
  USING ("userId" = auth.user_id())
  WITH CHECK ("userId" = auth.user_id());

-- Auditors can create their profile
CREATE POLICY "Auditors can create own profile"
  ON "Auditor"
  FOR INSERT
  WITH CHECK ("userId" = auth.user_id() AND auth.user_role() = 'AUDITOR');

-- ============================================
-- REGISTRY POLICIES
-- ============================================

-- Registries can read their own data  
CREATE POLICY "Registries can view own data"
  ON "Registry"
  FOR SELECT
  USING ("userId" = auth.user_id() OR auth.user_role() = 'REGISTRY');

-- Registries can update their own data
CREATE POLICY "Registries can update own data"
  ON "Registry"
  FOR UPDATE
  USING ("userId" = auth.user_id())
  WITH CHECK ("userId" = auth.user_id());

-- Registries can create their profile
CREATE POLICY "Registries can create own profile"
  ON "Registry"
  FOR INSERT
  WITH CHECK ("userId" = auth.user_id() AND auth.user_role() = 'REGISTRY');

-- ============================================
-- CARBON CREDIT POLICIES  
-- ============================================

-- Anyone can read verified carbon credits (marketplace)
CREATE POLICY "Anyone can view carbon credits"
  ON "CarbonCredit"
  FOR SELECT
  USING (true);

-- Only companies can create carbon credits linked to them
CREATE POLICY "Companies can create own credits"
  ON "CarbonCredit"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Company" c
      WHERE c."id" = "CarbonCredit"."companyId"
      AND c."userId" = auth.user_id()
    )
  );

-- Companies can update their own credits
CREATE POLICY "Companies can update own credits"
  ON "CarbonCredit"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Company" c
      WHERE c."id" = "CarbonCredit"."companyId"
      AND c."userId" = auth.user_id()
    )
  );

-- Companies can delete their own credits
CREATE POLICY "Companies can delete own credits"
  ON "CarbonCredit"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Company" c
      WHERE c."id" = "CarbonCredit"."companyId"
      AND c."userId" = auth.user_id()
    )
  );

-- ============================================
-- SESSION POLICIES
-- ============================================

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions"
  ON "Session"
  FOR SELECT
  USING ("userId" = auth.user_id());

CREATE POLICY "Users can delete own sessions"
  ON "Session"
  FOR DELETE
  USING ("userId" = auth.user_id());

-- ============================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================

-- Add indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS "idx_company_userId" ON "Company"("userId");
CREATE INDEX IF NOT EXISTS "idx_auditor_userId" ON "Auditor"("userId");
CREATE INDEX IF NOT EXISTS "idx_registry_userId" ON "Registry"("userId");
CREATE INDEX IF NOT EXISTS "idx_carboncredit_companyId" ON "CarbonCredit"("companyId");
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "Session"("userId");
