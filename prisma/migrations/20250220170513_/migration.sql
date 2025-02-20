/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `purchase_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `purchase_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `purchase_requests` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `purchase_requests_code_key` ON `purchase_requests`(`code`);

-- AddForeignKey
ALTER TABLE `purchase_requests` ADD CONSTRAINT `purchase_requests_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
