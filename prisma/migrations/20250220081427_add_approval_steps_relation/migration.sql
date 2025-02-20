/*
  Warnings:

  - You are about to drop the column `overtime` on the `approval_steps` table. All the data in the column will be lost.
  - Added the required column `overtimeAction` to the `approval_steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `approval_steps` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `approval_steps` DROP FOREIGN KEY `approval_steps_schemaId_fkey`;

-- AlterTable
ALTER TABLE `approval_steps` DROP COLUMN `overtime`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `overtimeAction` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_schemaId_fkey` FOREIGN KEY (`schemaId`) REFERENCES `approval_schemas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
