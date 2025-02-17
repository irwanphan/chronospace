/*
  Warnings:

  - Made the column `overtime` on table `purchase_request_approvals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `purchase_request_approvals` MODIFY `overtime` VARCHAR(191) NOT NULL;
