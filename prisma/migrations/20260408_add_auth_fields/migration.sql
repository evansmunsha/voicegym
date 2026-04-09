-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '',
ADD COLUMN "resetToken" TEXT,
ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

-- Add unique constraint on email if not exists
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");

-- Add unique constraint on username if not exists
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");
