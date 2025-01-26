-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `roleCode` VARCHAR(191) NOT NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `upperLevel` VARCHAR(191) NULL,
    `approvalLimit` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_roleCode_key`(`roleCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
