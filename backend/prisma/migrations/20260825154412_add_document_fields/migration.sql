-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessLicense" TEXT,
ADD COLUMN     "idDocument" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" INTEGER;
