-- CreateTable
CREATE TABLE `purchase_requests` (
    `id` VARCHAR(191) NOT NULL,
    `budgetId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_request_items` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseRequestId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `vendor` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `purchase_request_items_purchaseRequestId_idx`(`purchaseRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_request_approvals` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseRequestId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `specificUser` VARCHAR(191) NULL,
    `stepOrder` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `limit` INTEGER NULL,
    `duration` INTEGER NULL,
    `overtime` INTEGER NULL,
    `comment` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `purchase_request_approvals_purchaseRequestId_idx`(`purchaseRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `purchase_requests` ADD CONSTRAINT `purchase_requests_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_items` ADD CONSTRAINT `purchase_request_items_purchaseRequestId_fkey` FOREIGN KEY (`purchaseRequestId`) REFERENCES `purchase_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_request_approvals` ADD CONSTRAINT `purchase_request_approvals_purchaseRequestId_fkey` FOREIGN KEY (`purchaseRequestId`) REFERENCES `purchase_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
