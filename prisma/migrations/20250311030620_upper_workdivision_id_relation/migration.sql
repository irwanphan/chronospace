/*
  Warnings:

  - You are about to drop the column `upperWorkDivision` on the `work_divisions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `work_divisions` DROP COLUMN `upperWorkDivision`,
    ADD COLUMN `upperWorkDivisionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `work_divisions` ADD CONSTRAINT `work_divisions_upperWorkDivisionId_fkey` FOREIGN KEY (`upperWorkDivisionId`) REFERENCES `work_divisions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
