-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "PetStatus" AS ENUM ('AVAILABLE', 'PENDING', 'ADOPTED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Species" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "slug" VARCHAR(30) NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shelter" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shelter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "breed" VARCHAR(60) NOT NULL,
    "gender" "Gender" NOT NULL,
    "ageMonths" INTEGER NOT NULL,
    "size" "PetSize" NOT NULL,
    "color" VARCHAR(40) NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "vaccinated" BOOLEAN NOT NULL DEFAULT false,
    "sterilized" BOOLEAN NOT NULL DEFAULT false,
    "status" "PetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "speciesId" INTEGER NOT NULL,
    "shelterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adopter" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adopter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdoptionRequest" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "adopterId" INTEGER NOT NULL,
    "petId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdoptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Species_slug_key" ON "Species"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Shelter_name_key" ON "Shelter"("name");

-- CreateIndex
CREATE INDEX "Pet_speciesId_idx" ON "Pet"("speciesId");

-- CreateIndex
CREATE INDEX "Pet_shelterId_idx" ON "Pet"("shelterId");

-- CreateIndex
CREATE INDEX "Pet_status_idx" ON "Pet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Adopter_email_key" ON "Adopter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionRequest_adopterId_petId_key" ON "AdoptionRequest"("adopterId", "petId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "Shelter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_adopterId_fkey" FOREIGN KEY ("adopterId") REFERENCES "Adopter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
