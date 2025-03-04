-- DropForeignKey
ALTER TABLE `accounts` DROP FOREIGN KEY `accounts_userId_fkey`;

-- DropForeignKey
ALTER TABLE `approval_steps` DROP FOREIGN KEY `approval_steps_schemaId_fkey`;

-- DropForeignKey
ALTER TABLE `budgeted_items` DROP FOREIGN KEY `budgeted_items_budgetId_fkey`;

-- DropForeignKey
ALTER TABLE `budgeted_items` DROP FOREIGN KEY `budgeted_items_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `budgets` DROP FOREIGN KEY `budgets_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_approvals` DROP FOREIGN KEY `purchase_request_approvals_purchaseRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_histories` DROP FOREIGN KEY `purchase_request_histories_purchaseRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_items` DROP FOREIGN KEY `purchase_request_items_purchaseRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_items` DROP FOREIGN KEY `purchase_request_items_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_userId_fkey`;

-- DropIndex
DROP INDEX `accounts_userId_fkey` ON `accounts`;

-- DropIndex
DROP INDEX `budgeted_items_vendorId_fkey` ON `budgeted_items`;

-- DropIndex
DROP INDEX `purchase_request_items_vendorId_fkey` ON `purchase_request_items`;

-- DropIndex
DROP INDEX `sessions_userId_fkey` ON `sessions`;

-- DropIndex
DROP INDEX `user_roles_roleId_fkey` ON `user_roles`;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_schemaId_fkey` FOREIGN KEY (`schemaId`) REFERENCES `approval_schemas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgeted_items` ADD CONSTRAINT `budgeted_items_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgeted_items` ADD CONSTRAINT `budgeted_items_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_items` ADD CONSTRAINT `purchase_request_items_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_items` ADD CONSTRAINT `purchase_request_items_purchaseRequestId_fkey` FOREIGN KEY (`purchaseRequestId`) REFERENCES `purchase_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_approvals` ADD CONSTRAINT `purchase_request_approvals_purchaseRequestId_fkey` FOREIGN KEY (`purchaseRequestId`) REFERENCES `purchase_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_histories` ADD CONSTRAINT `purchase_request_histories_purchaseRequestId_fkey` FOREIGN KEY (`purchaseRequestId`) REFERENCES `purchase_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
