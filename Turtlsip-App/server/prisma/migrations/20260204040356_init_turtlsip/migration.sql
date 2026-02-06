CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT,
    "title" TEXT,
    "profileImg" TEXT,
    "socialLinks" JSONB,
    "blocks" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);
