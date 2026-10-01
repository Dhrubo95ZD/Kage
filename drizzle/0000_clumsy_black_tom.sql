CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`class_id` text NOT NULL,
	`profile` text NOT NULL,
	`run` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `characters_owner` ON `characters` (`owner`);