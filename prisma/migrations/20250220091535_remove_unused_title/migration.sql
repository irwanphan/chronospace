/*
  Warnings:

  - You are about to drop the column `title` on the `approval_schemas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `approval_steps` DROP FOREIGN KEY `approval_steps_schemaId_fkey`;

-- AlterTable
ALTER TABLE `approval_schemas` DROP COLUMN `title`;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_schemaId_fkey` FOREIGN KEY (`schemaId`) REFERENCES `approval_schemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
