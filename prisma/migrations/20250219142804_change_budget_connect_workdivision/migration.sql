/*
  Warnings:

  - You are about to drop the column `division` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `division` on the `projects` table. All the data in the column will be lost.
  - Added the required column `workDivisionId` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workDivisionId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `budgets` DROP COLUMN `division`,
    ADD COLUMN `workDivisionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `division`,
    ADD COLUMN `workDivisionId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `budgets_workDivisionId_idx` ON `budgets`(`workDivisionId`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_workDivisionId_fkey` FOREIGN KEY (`workDivisionId`) REFERENCES `work_divisions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_workDivisionId_fkey` FOREIGN KEY (`workDivisionId`) REFERENCES `work_divisions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
