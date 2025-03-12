/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `budgets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `budgets` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `budgets_code_key` ON `budgets`(`code`);
