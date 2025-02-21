/*
  Warnings:

  - You are about to drop the column `vendor` on the `purchase_request_items` table. All the data in the column will be lost.
  - Added the required column `vendorId` to the `purchase_request_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `purchase_request_items` DROP COLUMN `vendor`,
    ADD COLUMN `vendorId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `purchase_request_items` ADD CONSTRAINT `purchase_request_items_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_approvals` ADD CONSTRAINT `purchase_request_approvals_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
