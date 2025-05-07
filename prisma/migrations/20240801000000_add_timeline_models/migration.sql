-- CreateTable
CREATE TABLE `timeline_items` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `eventId` VARCHAR(191) NULL,
    `newsId` VARCHAR(191) NULL,
    `linkId` VARCHAR(191) NULL,

    UNIQUE INDEX `timeline_items_eventId_key`(`eventId`),
    UNIQUE INDEX `timeline_items_newsId_key`(`newsId`),
    UNIQUE INDEX `timeline_items_linkId_key`(`linkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timeline_events` (
    `id` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `organizer` VARCHAR(191) NULL,
    `isAllDay` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timeline_news` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `content` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timeline_links` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `importance` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `timeline_items` ADD CONSTRAINT `timeline_items_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timeline_items` ADD CONSTRAINT `timeline_items_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `timeline_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timeline_items` ADD CONSTRAINT `timeline_items_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `timeline_news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timeline_items` ADD CONSTRAINT `timeline_items_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `timeline_links`(`id`) ON DELETE CASCADE ON UPDATE CASCADE; 