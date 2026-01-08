CREATE TABLE system_setting (
  `key` VARCHAR(255) NOT NULL PRIMARY KEY,
  `value` TEXT NOT NULL
);

INSERT INTO system_setting (`key`, `value`) VALUES 
('GLOBAL_SETTINGS', '{"schedule":{"startTime":"08:00","endTime":"22:00","intervalMinutes":30},"pricing":{"inspectionPrice":25000,"publicationPrice":5000}}');
