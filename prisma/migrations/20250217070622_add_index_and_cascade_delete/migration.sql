/*
  Warnings:

  - A unique constraint covering the columns `[purchaseRequestId,stepOrder]` on the table `purchase_request_approvals` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `budgets` DROP FOREIGN KEY `budgets_projectId_fkey`;

-- CreateIndex
CREATE INDEX `approval_schemas_name_idx` ON `approval_schemas`(`name`);

-- CreateIndex
CREATE INDEX `budgets_projectId_idx` ON `budgets`(`projectId`);

-- CreateIndex
CREATE UNIQUE INDEX `purchase_request_approvals_purchaseRequestId_stepOrder_key` ON `purchase_request_approvals`(`purchaseRequestId`, `stepOrder`);

-- CreateIndex
CREATE INDEX `user_accesses_userId_idx` ON `user_accesses`(`userId`);

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `purchase_requests` RENAME INDEX `purchase_requests_budgetId_fkey` TO `purchase_requests_budgetId_idx`;
