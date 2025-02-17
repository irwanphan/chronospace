/*
  Warnings:

  - Added the required column `budgetItemId` to the `purchase_request_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `purchase_request_items` ADD COLUMN `budgetItemId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `purchase_request_items_budgetItemId_idx` ON `purchase_request_items`(`budgetItemId`);

-- AddForeignKey
ALTER TABLE `purchase_request_items` ADD CONSTRAINT `purchase_request_items_budgetItemId_fkey` FOREIGN KEY (`budgetItemId`) REFERENCES `budgeted_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
