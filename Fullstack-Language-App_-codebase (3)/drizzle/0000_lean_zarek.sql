CREATE TABLE `words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hanzi` text NOT NULL,
	`pinyin` text NOT NULL,
	`translation` text NOT NULL,
	`audio_url` text,
	`video_url` text,
	`difficulty` text NOT NULL,
	`created_at` text NOT NULL
);
