CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`imported_at` text NOT NULL,
	`sha256` text NOT NULL,
	`license_status` text NOT NULL,
	`commercial_use` integer NOT NULL,
	`modification_allowed` integer NOT NULL,
	`attribution_required` integer NOT NULL,
	`source` text NOT NULL,
	`license` text NOT NULL,
	`media` text NOT NULL,
	`visual` text NOT NULL
);
