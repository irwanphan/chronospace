/*
  Warnings:

  - Made the column `duration` on table `purchase_request_approvals` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `createdBy` to the `purchase_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `purchase_request_approvals` MODIFY `duration` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `purchase_requests` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL;
