-- CreateTable
CREATE TABLE `AdminUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Staff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(25) NULL,
    `role` ENUM('CLEANER', 'DRIVER') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Staff_role_active_idx`(`role`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `customerName` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(25) NOT NULL,
    `area` VARCHAR(50) NOT NULL,
    `address` VARCHAR(500) NULL,
    `service` VARCHAR(60) NOT NULL,
    `date` CHAR(10) NOT NULL,
    `time` CHAR(5) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `hours` DECIMAL(5, 2) NOT NULL,
    `cleanerCount` INTEGER NOT NULL,
    `hourlyRate` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID') NOT NULL DEFAULT 'UNPAID',
    `notes` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_code_key`(`code`),
    INDEX `Booking_date_idx`(`date`),
    INDEX `Booking_startsAt_endsAt_idx`(`startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingStaff` (
    `bookingId` INTEGER NOT NULL,
    `staffId` INTEGER NOT NULL,
    `role` ENUM('CLEANER', 'DRIVER') NOT NULL,

    INDEX `BookingStaff_staffId_idx`(`staffId`),
    PRIMARY KEY (`bookingId`, `staffId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BookingStaff` ADD CONSTRAINT `BookingStaff_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingStaff` ADD CONSTRAINT `BookingStaff_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
