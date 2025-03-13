/*
  Warnings:

  - You are about to drop the column `order` on the `approval_steps` table. All the data in the column will be lost.
  - Added the required column `stepOrder` to the `approval_steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `approval_steps` DROP COLUMN `order`,
    ADD COLUMN `stepOrder` INTEGER NOT NULL;
