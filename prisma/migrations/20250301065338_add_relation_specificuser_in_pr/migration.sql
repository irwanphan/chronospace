-- AddForeignKey
ALTER TABLE `purchase_request_approvals` ADD CONSTRAINT `purchase_request_approvals_specificUser_fkey` FOREIGN KEY (`specificUser`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
