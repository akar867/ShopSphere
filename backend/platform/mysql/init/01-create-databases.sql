CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS product_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- App user (used by services)
CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED BY 'app';
GRANT ALL PRIVILEGES ON auth_db.* TO 'app'@'%';
GRANT ALL PRIVILEGES ON product_db.* TO 'app'@'%';
GRANT ALL PRIVILEGES ON order_db.* TO 'app'@'%';
GRANT ALL PRIVILEGES ON payment_db.* TO 'app'@'%';
FLUSH PRIVILEGES;

