/*
  Warnings:

  - You are about to drop the column `isActive` on the `approval_schemas` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `approval_schemas` table. All the data in the column will be lost.
  - You are about to drop the column `workDivisions` on the `approval_schemas` table. All the data in the column will be lost.
  - You are about to drop the column `budgetLimit` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `overtimeAction` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `specificUserId` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `stepNumber` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `approval_steps` table. All the data in the column will be lost.
  - Added the required column `divisions` to the `approval_schemas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `approval_schemas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `approval_steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overtime` to the `approval_steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `approval_steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `approval_schemas` DROP COLUMN `isActive`,
    DROP COLUMN `roles`,
    DROP COLUMN `workDivisions`,
    ADD COLUMN `divisions` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `approval_steps` DROP COLUMN `budgetLimit`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `overtimeAction`,
    DROP COLUMN `roleId`,
    DROP COLUMN `specificUserId`,
    DROP COLUMN `stepNumber`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `limit` DOUBLE NULL,
    ADD COLUMN `order` INTEGER NOT NULL,
    ADD COLUMN `overtime` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;

-- RenameIndex
ALTER TABLE `approval_steps` RENAME INDEX `approval_steps_schemaId_fkey` TO `approval_steps_schemaId_idx`;
