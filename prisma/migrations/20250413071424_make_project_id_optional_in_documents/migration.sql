-- DropForeignKey
ALTER TABLE `documents` DROP FOREIGN KEY `documents_projectId_fkey`;

-- DropIndex
DROP INDEX `documents_projectId_fkey` ON `documents`;

-- AlterTable
ALTER TABLE `documents` MODIFY `projectId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
