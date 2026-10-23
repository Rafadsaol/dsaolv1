-- Migration inicial revisável. Aplicar com prisma migrate deploy.
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'CONTACTED', 'CLOSED');
CREATE TABLE "User" (
  "id" UUID NOT NULL, "name" VARCHAR(100) NOT NULL, "email" VARCHAR(254) NOT NULL,
  "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_normalized" CHECK ("email" = lower("email")),
  CONSTRAINT "User_password_argon2id" CHECK ("passwordHash" LIKE '$argon2id$%')
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE TABLE "Customer" (
  "id" UUID NOT NULL, "name" VARCHAR(100) NOT NULL, "email" VARCHAR(254) NOT NULL,
  "phone" VARCHAR(22), "company" VARCHAR(100), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Customer_name_idx" ON "Customer"("name");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");
CREATE TABLE "Project" (
  "id" UUID NOT NULL, "title" VARCHAR(160) NOT NULL, "description" VARCHAR(4000) NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED', "customerId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Project_customerId_idx" ON "Project"("customerId");
CREATE INDEX "Project_status_createdAt_idx" ON "Project"("status", "createdAt");
CREATE TABLE "ContactRequest" (
  "id" UUID NOT NULL, "name" VARCHAR(100) NOT NULL, "email" VARCHAR(254) NOT NULL, "phone" VARCHAR(22) NOT NULL,
  "service" VARCHAR(32) NOT NULL, "message" VARCHAR(2000) NOT NULL, "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "idempotencyKey" UUID NOT NULL, "payloadHash" CHAR(64) NOT NULL, CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContactRequest_service_valid" CHECK ("service" IN ('sites','automacao','infraestrutura','outro'))
);
CREATE UNIQUE INDEX "ContactRequest_idempotencyKey_key" ON "ContactRequest"("idempotencyKey");
CREATE INDEX "ContactRequest_status_createdAt_idx" ON "ContactRequest"("status", "createdAt");
CREATE TABLE "session" (
  "sid" VARCHAR(255) NOT NULL, "sess" JSONB NOT NULL, "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX "session_expire_idx" ON "session"("expire");
CREATE TABLE "PasswordResetToken" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "tokenHash" CHAR(64) NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");
