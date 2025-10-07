CREATE TABLE `jobpost` (
	`id`	int	NOT NULL,
	`active`	int	NOT NULL,
	`url`	varchar(255)	NOT NULL,
	`company_name`	varchar(100)	NOT NULL,
	`title`	varchar(255)	NOT NULL,
	`opening_date`	datetime	NOT NULL,
	`expiration_date`	datetime	NOT NULL,
	`location`	varchar(255)	NULL	DEFAULT '미지정',
	`job_code`	text	NULL,
	`job_code_name`	text	NULL,
	`experience_level`	int	NULL,
	`experience_level_name`	varchar(255)	NULL
);

CREATE TABLE `log` (
	`LOG_NO`	int	NOT NULL,
	`CONTENT`	text	NOT NULL,
	`VAL_TEXT`	varchar(255)	NOT NULL	DEFAULT '0',
	`IS_DEL`	tinyint(1)	NOT NULL	DEFAULT '0',
	`REPO_COUNT`	int	NOT NULL	DEFAULT '0',
	`CREATED_DATE`	datetime	NOT NULL,
	`EDITED_DATE`	date	NULL,
	`COMPANY_NAME`	varchar(100)	NULL,
	`IS_CURRENTLY_EMPLOYED`	tinyint(1)	NULL	DEFAULT '0',
	`TITLE`	varchar(255)	NULL,
	`VIEW_COUNT`	INT	NULL
);

CREATE TABLE `user` (
	`USER_NO`	int	NOT NULL,
	`PASSWORD`	varchar(100)	NOT NULL,
	`NICKNAME`	varchar(100)	NOT NULL,
	`EMAIL`	varchar(100) UNIQUE NULL ,
	`CREATED_DATE`	datetime	NOT NULL,
	`IS_DEL`	tinyint(1)	NOT NULL	DEFAULT '0',
	`ROLE`	int	NOT NULL	DEFAULT '0',
	`USER_ID`	VARCHAR(100)	NULL,
	`VARCHAR`	VARCHAR(100)	NULL
);

CREATE TABLE `employment_certificate` (
	`CERTIFICATE_NO`	int	NOT NULL	COMMENT 'auto_increment, PK',
	`USER_NO`	int	NOT NULL	COMMENT 'T: 긍 / F: 부',
	`COMPANY_NAME`	varchar(100)	NOT NULL	COMMENT 'auto_increment, PK',
	`UPLOAD_DATE`	datetime	NOT NULL,
	`FILE_PATH`	varchar(255)	NOT NULL,
	`UPDATE_DATE`	datetime	NULL,
	`STATUS`	varchar(20)	NOT NULL	DEFAULT 'PENDING'	COMMENT '0:회원 1:관리자'
);

CREATE TABLE `post_tag` (
	`LOG_NO`	int	NOT NULL,
	`TAG_NO`	int	NOT NULL
);

CREATE TABLE `report` (
	`REPO_NO`	INT	NOT NULL,
	`USER_NO`	int	NOT NULL,
	`REPO_REASON`	varchar(255)	NOT NULL,
	`REPO_DATE`	datetime	NOT NULL,
	`IS_DEL`	tinyint(1)	NOT NULL	DEFAULT '0',
	`LOG_NO`	int	NOT NULL
);

CREATE TABLE `bookmark` (
	`BOOKMARK_NO`	int	NOT NULL	COMMENT 'auto_increment, PK',
	`USER_NO`	int	NOT NULL	COMMENT 'FK',
	`LOG_NO`	int	NOT NULL	COMMENT 'FK'
);

CREATE TABLE `comment` (
	`COMMENT_NO`	INT	NOT NULL,
	`CREATED_DATE`	datetime NOT NULL,	
	`LOG_NO`	int	NOT NULL,
	`CONTENT`	TEXT	NULL,
	`IS_DEL`	BOOLEAN	NOT NULL DEFAULT 0,
	`USER_NO`	int	NOT NULL,
	`PARENT_COMMENT_NO`	VARCHAR(50)	NULL
);

CREATE TABLE `tag` (
	`TAG_NO`	int	NOT NULL	DEFAULT '1',
	`TAG_NP`	TINYINT	NULL,
	`TAG_CONTENT`	VARCHAR(100)	NULL
);

ALTER TABLE `jobpost` ADD CONSTRAINT `PK_JOBPOST` PRIMARY KEY (
	`id`
);

ALTER TABLE `log` ADD CONSTRAINT `PK_LOG` PRIMARY KEY (
	`LOG_NO`
);

ALTER TABLE `user` ADD CONSTRAINT `PK_USER` PRIMARY KEY (
	`USER_NO`
);

ALTER TABLE `employment_certificate` ADD CONSTRAINT `PK_EMPLOYMENT_CERTIFICATE` PRIMARY KEY (
	`CERTIFICATE_NO`
);

ALTER TABLE `post_tag` ADD CONSTRAINT `PK_POST_TAG` PRIMARY KEY (
	`LOG_NO`,
	`TAG_NO`
);

ALTER TABLE `report` ADD CONSTRAINT `PK_REPORT` PRIMARY KEY (
	`REPO_NO`
);

ALTER TABLE `bookmark` ADD CONSTRAINT `PK_BOOKMARK` PRIMARY KEY (
	`BOOKMARK_NO`
);

ALTER TABLE `comment` ADD CONSTRAINT `PK_COMMENT` PRIMARY KEY (
	`COMMENT_NO`
);

ALTER TABLE `tag` ADD CONSTRAINT `PK_TAG` PRIMARY KEY (
	`TAG_NO`
);

ALTER TABLE `employment_certificate` ADD CONSTRAINT `FK_user_TO_employment_certificate_1` FOREIGN KEY (
	`USER_NO`
)
REFERENCES `user` (
	`USER_NO`
);

ALTER TABLE `post_tag` ADD CONSTRAINT `FK_log_TO_post_tag_1` FOREIGN KEY (
	`LOG_NO`
)
REFERENCES `log` (
	`LOG_NO`
);

ALTER TABLE `post_tag` ADD CONSTRAINT `FK_tag_TO_post_tag_1` FOREIGN KEY (
	`TAG_NO`
)
REFERENCES `tag` (
	`TAG_NO`
);

ALTER TABLE `report` ADD CONSTRAINT `FK_user_TO_report_1` FOREIGN KEY (
	`USER_NO`
)
REFERENCES `user` (
	`USER_NO`
);

ALTER TABLE `report` ADD CONSTRAINT `FK_log_TO_report_1` FOREIGN KEY (
	`LOG_NO`
)
REFERENCES `log` (
	`LOG_NO`
);

ALTER TABLE `bookmark` ADD CONSTRAINT `FK_user_TO_bookmark_1` FOREIGN KEY (
	`USER_NO`
)
REFERENCES `user` (
	`USER_NO`
);

ALTER TABLE `bookmark` ADD CONSTRAINT `FK_log_TO_bookmark_1` FOREIGN KEY (
	`LOG_NO`
)
REFERENCES `log` (
	`LOG_NO`
);

ALTER TABLE `comment` ADD CONSTRAINT `FK_log_TO_comment_1` FOREIGN KEY (
	`LOG_NO`
)
REFERENCES `log` (
	`LOG_NO`
);

ALTER TABLE `comment` ADD CONSTRAINT `FK_user_TO_comment_1` FOREIGN KEY (
	`USER_NO`
)
REFERENCES `user` (
	`USER_NO`
);

