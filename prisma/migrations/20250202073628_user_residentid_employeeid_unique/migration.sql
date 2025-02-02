/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[residentId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_employeeId_key` ON `User`(`employeeId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_residentId_key` ON `User`(`residentId`);
