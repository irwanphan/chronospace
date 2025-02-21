/*
  Warnings:

  - You are about to drop the column `vendor` on the `budgeted_items` table. All the data in the column will be lost.
  - Added the required column `vendorId` to the `budgeted_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `budgeted_items` DROP COLUMN `vendor`,
    ADD COLUMN `vendorId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `budgeted_items` ADD CONSTRAINT `budgeted_items_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
