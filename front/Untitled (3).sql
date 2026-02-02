CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `phone_number` varchar(255),
  `is_vip` boolean DEFAULT false,
  `total_spend` decimal(10,2) DEFAULT 0,
  `visit_count` integer DEFAULT 0,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp
);

CREATE TABLE `staff` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `role` varchar(255) COMMENT 'e.g. Master Barber, Senior Stylist',
  `bio` text,
  `rating` decimal(3,2),
  `is_active` boolean DEFAULT true,
  `schedule` json COMMENT 'Stores weekly availability',
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `services` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) COMMENT 'Hair, Beard, Package',
  `description` text,
  `duration_minutes` integer NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` boolean DEFAULT true
);

CREATE TABLE `appointments` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer,
  `staff_id` integer,
  `service_id` integer,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` varchar(255) DEFAULT 'confirmed' COMMENT 'confirmed, completed, cancelled, no-show',
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `payments` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `appointment_id` integer,
  `user_id` integer,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(255) COMMENT 'Card, Cash, Online',
  `status` varchar(255) DEFAULT 'pending' COMMENT 'paid, pending, failed',
  `transaction_date` timestamp DEFAULT (now())
);

CREATE TABLE `marketing_campaigns` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `type` varchar(255) COMMENT 'Promo, WinBack',
  `sent_count` integer,
  `success_rate` decimal(5,2),
  `created_at` timestamp
);

CREATE TABLE `shop_settings` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `key` varchar(255) UNIQUE NOT NULL,
  `value` varchar(255),
  `description` text
);

ALTER TABLE `appointments` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `appointments` ADD FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`);

ALTER TABLE `appointments` ADD FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

ALTER TABLE `payments` ADD FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`);

ALTER TABLE `payments` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
