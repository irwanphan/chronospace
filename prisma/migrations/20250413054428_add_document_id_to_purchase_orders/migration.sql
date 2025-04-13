/*
  Warnings:

  - You are about to drop the column `verificationCode` on the `documents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `purchase_orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entityId` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Made the column `projectId` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `documents` DROP FOREIGN KEY `documents_projectId_fkey`;

-- DropIndex
DROP INDEX `documents_projectId_idx` ON `documents`;

-- DropIndex
DROP INDEX `documents_verificationCode_key` ON `documents`;

-- AlterTable
ALTER TABLE `documents` DROP COLUMN `verificationCode`,
    ADD COLUMN `entityId` VARCHAR(191) NOT NULL,
    ADD COLUMN `entityType` VARCHAR(191) NOT NULL,
    ADD COLUMN `fileData` LONGBLOB NULL,
    MODIFY `projectId` VARCHAR(191) NOT NULL,
    MODIFY `fileUrl` VARCHAR(191) NOT NULL,
    MODIFY `signedFileUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `purchase_orders` ADD COLUMN `documentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `purchase_orders_documentId_key` ON `purchase_orders`(`documentId`);

-- CreateIndex
CREATE INDEX `purchase_orders_documentId_idx` ON `purchase_orders`(`documentId`);

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
