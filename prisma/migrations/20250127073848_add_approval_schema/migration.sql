-- CreateTable
CREATE TABLE `approval_schemas` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `workDivisions` JSON NOT NULL,
    `roles` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_steps` (
    `id` VARCHAR(191) NOT NULL,
    `schemaId` VARCHAR(191) NOT NULL,
    `stepNumber` INTEGER NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `specificUserId` VARCHAR(191) NULL,
    `budgetLimit` DOUBLE NULL,
    `duration` INTEGER NOT NULL,
    `overtimeAction` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `approval_steps` ADD CONSTRAINT `approval_steps_schemaId_fkey` FOREIGN KEY (`schemaId`) REFERENCES `approval_schemas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
