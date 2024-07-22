CREATE TABLE `channels` (
  `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(25),
  `login` VARCHAR(50),
  `prefix` VARCHAR(25),
  `added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  `mode` TINYINT(1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ignored_users` (
  `user_id` VARCHAR(25) UNIQUE,
  `reason` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `permissions` (
  `user_id` VARCHAR(25),
  `permission` INT(2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tokens` (
  `name` varchar(255) NOT NULL,
  `access_token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `expires_at` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;