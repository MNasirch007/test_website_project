CREATE TABLE `workspaces` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspaces_public_id_unique` ON `workspaces` (`public_id`);