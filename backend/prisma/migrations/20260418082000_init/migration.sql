-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('draft', 'published', 'offline');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'editor');

-- CreateEnum
CREATE TYPE "CertificateCategory" AS ENUM ('honor', 'qualification', 'patent');

-- CreateEnum
CREATE TYPE "CultureValueType" AS ENUM ('mission', 'vision', 'value');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('new', 'processing', 'resolved', 'spam');

-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "sectionKey" VARCHAR(100),
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "subtitleZh" VARCHAR(500),
    "subtitleEn" VARCHAR(500),
    "imageUrl" VARCHAR(500) NOT NULL,
    "mobileImageUrl" VARCHAR(500),
    "linkUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "nameZh" VARCHAR(120) NOT NULL,
    "nameEn" VARCHAR(120),
    "descriptionZh" TEXT,
    "descriptionEn" TEXT,
    "coverImage" VARCHAR(500),
    "iconImage" VARCHAR(500),
    "slug" VARCHAR(150) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "nameZh" VARCHAR(180) NOT NULL,
    "nameEn" VARCHAR(180),
    "model" VARCHAR(120),
    "summaryZh" TEXT,
    "summaryEn" TEXT,
    "descriptionZh" TEXT,
    "descriptionEn" TEXT,
    "specsJson" JSONB,
    "featuresJson" JSONB,
    "imagesJson" JSONB,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "slug" VARCHAR(180) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsCategory" (
    "id" SERIAL NOT NULL,
    "nameZh" VARCHAR(120) NOT NULL,
    "nameEn" VARCHAR(120),
    "slug" VARCHAR(120) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "summaryZh" TEXT,
    "summaryEn" TEXT,
    "contentZh" TEXT,
    "contentEn" TEXT,
    "coverImage" VARCHAR(500),
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "slug" VARCHAR(180) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "logoUrl" VARCHAR(500) NOT NULL,
    "website" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER,
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "descriptionZh" TEXT,
    "descriptionEn" TEXT,
    "imagesJson" JSONB,
    "deliveryDate" TIMESTAMP(3),
    "slug" VARCHAR(180) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "strengthCategoryId" INTEGER,
    "nameZh" VARCHAR(255) NOT NULL,
    "nameEn" VARCHAR(255),
    "imageUrl" VARCHAR(500) NOT NULL,
    "category" "CertificateCategory" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180),
    "phone" VARCHAR(50),
    "company" VARCHAR(180),
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'new',
    "handlerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(120) NOT NULL,
    "valueZh" TEXT,
    "valueEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutSection" (
    "id" SERIAL NOT NULL,
    "sectionKey" VARCHAR(120) NOT NULL,
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "contentZh" TEXT,
    "contentEn" TEXT,
    "imageUrl" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "contentZh" TEXT,
    "contentEn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChairmanMessage" (
    "id" SERIAL NOT NULL,
    "singletonKey" VARCHAR(50) NOT NULL DEFAULT 'default',
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "contentZh" TEXT,
    "contentEn" TEXT,
    "imageUrl" VARCHAR(500),
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChairmanMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CultureValue" (
    "id" SERIAL NOT NULL,
    "type" "CultureValueType" NOT NULL,
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "contentZh" TEXT,
    "contentEn" TEXT,
    "icon" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CultureValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthCategory" (
    "id" SERIAL NOT NULL,
    "nameZh" VARCHAR(120) NOT NULL,
    "nameEn" VARCHAR(120),
    "slug" VARCHAR(150) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrengthCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthItem" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "summaryZh" TEXT,
    "summaryEn" TEXT,
    "contentZh" TEXT,
    "contentEn" TEXT,
    "imageUrl" VARCHAR(500),
    "imagesJson" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrengthItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSection" (
    "id" SERIAL NOT NULL,
    "sectionKey" VARCHAR(120) NOT NULL,
    "titleZh" VARCHAR(255) NOT NULL,
    "titleEn" VARCHAR(255),
    "contentZh" TEXT,
    "contentEn" TEXT,
    "imageUrl" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "seoTitleZh" VARCHAR(255),
    "seoTitleEn" VARCHAR(255),
    "seoDescriptionZh" TEXT,
    "seoDescriptionEn" TEXT,
    "seoKeywordsZh" VARCHAR(500),
    "seoKeywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOutlet" (
    "id" SERIAL NOT NULL,
    "regionZh" VARCHAR(120) NOT NULL,
    "regionEn" VARCHAR(120),
    "cityZh" VARCHAR(120) NOT NULL,
    "cityEn" VARCHAR(120),
    "addressZh" TEXT NOT NULL,
    "addressEn" TEXT,
    "phone" VARCHAR(50),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOutlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoMeta" (
    "id" SERIAL NOT NULL,
    "pageKey" VARCHAR(180) NOT NULL,
    "titleZh" VARCHAR(255),
    "titleEn" VARCHAR(255),
    "descriptionZh" TEXT,
    "descriptionEn" TEXT,
    "keywordsZh" VARCHAR(500),
    "keywordsEn" VARCHAR(500),
    "ogImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'editor',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Banner_sectionKey_sortOrder_idx" ON "Banner"("sectionKey", "sortOrder");

-- CreateIndex
CREATE INDEX "Banner_status_sortOrder_idx" ON "Banner"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- CreateIndex
CREATE INDEX "ProductCategory_status_sortOrder_idx" ON "ProductCategory"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductCategory_sortOrder_idx" ON "ProductCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_status_sortOrder_idx" ON "Product"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Product_isHot_status_idx" ON "Product"("isHot", "status");

-- CreateIndex
CREATE INDEX "Product_nameZh_idx" ON "Product"("nameZh");

-- CreateIndex
CREATE UNIQUE INDEX "NewsCategory_slug_key" ON "NewsCategory"("slug");

-- CreateIndex
CREATE INDEX "NewsCategory_status_sortOrder_idx" ON "NewsCategory"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_categoryId_publishDate_idx" ON "News"("categoryId", "publishDate");

-- CreateIndex
CREATE INDEX "News_status_publishDate_idx" ON "News"("status", "publishDate");

-- CreateIndex
CREATE INDEX "News_isPublished_publishDate_idx" ON "News"("isPublished", "publishDate");

-- CreateIndex
CREATE INDEX "News_sortOrder_idx" ON "News"("sortOrder");

-- CreateIndex
CREATE INDEX "Partner_status_sortOrder_idx" ON "Partner"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Partner_name_idx" ON "Partner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_slug_key" ON "Delivery"("slug");

-- CreateIndex
CREATE INDEX "Delivery_productId_idx" ON "Delivery"("productId");

-- CreateIndex
CREATE INDEX "Delivery_status_sortOrder_idx" ON "Delivery"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Delivery_deliveryDate_idx" ON "Delivery"("deliveryDate");

-- CreateIndex
CREATE INDEX "Certificate_strengthCategoryId_idx" ON "Certificate"("strengthCategoryId");

-- CreateIndex
CREATE INDEX "Certificate_category_sortOrder_idx" ON "Certificate"("category", "sortOrder");

-- CreateIndex
CREATE INDEX "Certificate_status_sortOrder_idx" ON "Certificate"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "ContactMessage_status_isRead_idx" ON "ContactMessage"("status", "isRead");

-- CreateIndex
CREATE INDEX "ContactMessage_handlerId_idx" ON "ContactMessage"("handlerId");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInfo_key_key" ON "CompanyInfo"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AboutSection_sectionKey_key" ON "AboutSection"("sectionKey");

-- CreateIndex
CREATE INDEX "AboutSection_status_sortOrder_idx" ON "AboutSection"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "TimelineEvent_year_sortOrder_idx" ON "TimelineEvent"("year", "sortOrder");

-- CreateIndex
CREATE INDEX "TimelineEvent_status_sortOrder_idx" ON "TimelineEvent"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ChairmanMessage_singletonKey_key" ON "ChairmanMessage"("singletonKey");

-- CreateIndex
CREATE INDEX "ChairmanMessage_status_idx" ON "ChairmanMessage"("status");

-- CreateIndex
CREATE INDEX "CultureValue_type_sortOrder_idx" ON "CultureValue"("type", "sortOrder");

-- CreateIndex
CREATE INDEX "CultureValue_status_sortOrder_idx" ON "CultureValue"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "StrengthCategory_slug_key" ON "StrengthCategory"("slug");

-- CreateIndex
CREATE INDEX "StrengthCategory_status_sortOrder_idx" ON "StrengthCategory"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "StrengthItem_categoryId_sortOrder_idx" ON "StrengthItem"("categoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "StrengthItem_status_sortOrder_idx" ON "StrengthItem"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSection_sectionKey_key" ON "ServiceSection"("sectionKey");

-- CreateIndex
CREATE INDEX "ServiceSection_status_sortOrder_idx" ON "ServiceSection"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "SalesOutlet_regionZh_cityZh_idx" ON "SalesOutlet"("regionZh", "cityZh");

-- CreateIndex
CREATE INDEX "SalesOutlet_status_sortOrder_idx" ON "SalesOutlet"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMeta_pageKey_key" ON "SeoMeta"("pageKey");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE INDEX "AdminUser_role_isActive_idx" ON "AdminUser"("role", "isActive");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NewsCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_strengthCategoryId_fkey" FOREIGN KEY ("strengthCategoryId") REFERENCES "StrengthCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrengthItem" ADD CONSTRAINT "StrengthItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "StrengthCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

