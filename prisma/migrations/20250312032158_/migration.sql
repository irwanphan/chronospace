/*
  Warnings:

  - You are about to drop the column `projectCode` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `projectTitle` on the `projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `projects_projectId_key` ON `projects`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `projectCode`,
    DROP COLUMN `projectId`,
    DROP COLUMN `projectTitle`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `projects_code_key` ON `projects`(`code`);
