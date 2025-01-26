-- CreateTable
CREATE TABLE `work_divisions` (
    `id` VARCHAR(191) NOT NULL,
    `divisionCode` VARCHAR(191) NOT NULL,
    `divisionName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `upperDivision` VARCHAR(191) NULL,
    `divisionHead` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `work_divisions_divisionCode_key`(`divisionCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
