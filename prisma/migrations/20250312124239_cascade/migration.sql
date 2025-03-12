-- DropForeignKey
ALTER TABLE `budgeted_items` DROP FOREIGN KEY `budgeted_items_budgetId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_items` DROP FOREIGN KEY `purchase_request_items_budgetItemId_fkey`;

-- AddForeignKey
ALTER TABLE `budgeted_items` ADD CONSTRAINT `budgeted_items_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_items` ADD CONSTRAINT `purchase_request_items_budgetItemId_fkey` FOREIGN KEY (`budgetItemId`) REFERENCES `budgeted_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
