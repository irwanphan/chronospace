-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_userId_fkey`;

-- AlterTable
ALTER TABLE `notifications` MODIFY `type` VARCHAR(191) NOT NULL DEFAULT 'info';

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
