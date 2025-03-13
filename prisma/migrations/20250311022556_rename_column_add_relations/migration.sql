/*
  Warnings:

  - You are about to drop the column `divisions` on the `approval_schemas` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `approval_schemas` table. All the data in the column will be lost.
  - You are about to drop the column `limit` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `purchase_request_approvals` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `purchase_request_approvals` table. All the data in the column will be lost.
  - You are about to drop the column `limit` on the `purchase_request_approvals` table. All the data in the column will be lost.
  - You are about to drop the column `overtime` on the `purchase_request_approvals` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `purchase_request_approvals` table. All the data in the column will be lost.
  - You are about to drop the column `specificUser` on the `purchase_request_approvals` table. All the data in the column will be lost.
  - You are about to drop the column `approvalLimit` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `workDivision` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `divisionCode` on the `work_divisions` table. All the data in the column will be lost.
  - You are about to drop the column `divisionHead` on the `work_divisions` table. All the data in the column will be lost.
  - You are about to drop the column `divisionName` on the `work_divisions` table. All the data in the column will be lost.
  - You are about to drop the column `upperDivision` on the `work_divisions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `work_divisions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workDivisionIds` to the `approval_schemas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `approval_steps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overtimeAction` to the `purchase_request_approvals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `purchase_request_approvals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workDivisionId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `work_divisions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `work_divisions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `budgeted_items` DROP FOREIGN KEY `budgeted_items_budgetId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_approvals` DROP FOREIGN KEY `purchase_request_approvals_approvedBy_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_approvals` DROP FOREIGN KEY `purchase_request_approvals_specificUser_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_request_items` DROP FOREIGN KEY `purchase_request_items_budgetItemId_fkey`;

-- DropIndex
DROP INDEX `purchase_request_approvals_approvedBy_fkey` ON `purchase_request_approvals`;

-- DropIndex
DROP INDEX `purchase_request_approvals_specificUser_fkey` ON `purchase_request_approvals`;

-- DropIndex
DROP INDEX `work_divisions_divisionCode_key` ON `work_divisions`;

-- AlterTable
ALTER TABLE `approval_schemas` DROP COLUMN `divisions`,
    DROP COLUMN `roles`,
    ADD COLUMN `roleIds` VARCHAR(191) NULL,
    ADD COLUMN `workDivisionIds` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `approval_steps` DROP COLUMN `limit`,
    DROP COLUMN `role`,
    ADD COLUMN `budgetLimit` DOUBLE NULL,
    ADD COLUMN `roleId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `purchase_request_approvals` DROP COLUMN `approvedAt`,
    DROP COLUMN `approvedBy`,
    DROP COLUMN `limit`,
    DROP COLUMN `overtime`,
    DROP COLUMN `role`,
    DROP COLUMN `specificUser`,
    ADD COLUMN `actedAt` DATETIME(3) NULL,
    ADD COLUMN `actorId` VARCHAR(191) NULL,
    ADD COLUMN `budgetLimit` DOUBLE NULL,
    ADD COLUMN `overtimeAction` VARCHAR(191) NOT NULL,
    ADD COLUMN `roleId` VARCHAR(191) NOT NULL,
    ADD COLUMN `specificUserId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `roles` DROP COLUMN `approvalLimit`,
    ADD COLUMN `budgetLimit` DOUBLE NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role`,
    DROP COLUMN `workDivision`,
    ADD COLUMN `roleId` VARCHAR(191) NOT NULL,
    ADD COLUMN `workDivisionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `work_divisions` DROP COLUMN `divisionCode`,
    DROP COLUMN `divisionHead`,
    DROP COLUMN `divisionName`,
    DROP COLUMN `upperDivision`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `headId` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `upperWorkDivision` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `_ApprovalSchemaWorkDivisions` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ApprovalSchemaWorkDivisions_AB_unique`(`A`, `B`),
    INDEX `_ApprovalSchemaWorkDivisions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ApprovalSchemaRoles` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ApprovalSchemaRoles_AB_unique`(`A`, `B`),
    INDEX `_ApprovalSchemaRoles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `work_divisions_code_key` ON `work_divisions`(`code`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_workDivisionId_fkey` FOREIGN KEY (`workDivisionId`) REFERENCES `work_divisions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_divisions` ADD CONSTRAINT `work_divisions_headId_fkey` FOREIGN KEY (`headId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_specificUserId_fkey` FOREIGN KEY (`specificUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgeted_items` ADD CONSTRAINT `budgeted_items_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_items` ADD CONSTRAINT `purchase_request_items_budgetItemId_fkey` FOREIGN KEY (`budgetItemId`) REFERENCES `budgeted_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_approvals` ADD CONSTRAINT `purchase_request_approvals_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_approvals` ADD CONSTRAINT `purchase_request_approvals_specificUserId_fkey` FOREIGN KEY (`specificUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_approvals` ADD CONSTRAINT `purchase_request_approvals_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ApprovalSchemaWorkDivisions` ADD CONSTRAINT `_ApprovalSchemaWorkDivisions_A_fkey` FOREIGN KEY (`A`) REFERENCES `approval_schemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ApprovalSchemaWorkDivisions` ADD CONSTRAINT `_ApprovalSchemaWorkDivisions_B_fkey` FOREIGN KEY (`B`) REFERENCES `work_divisions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ApprovalSchemaRoles` ADD CONSTRAINT `_ApprovalSchemaRoles_A_fkey` FOREIGN KEY (`A`) REFERENCES `approval_schemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ApprovalSchemaRoles` ADD CONSTRAINT `_ApprovalSchemaRoles_B_fkey` FOREIGN KEY (`B`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
