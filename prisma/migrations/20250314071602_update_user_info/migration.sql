-- AlterTable
ALTER TABLE `users` ADD COLUMN `birthplace` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL DEFAULT 'Unknown';
