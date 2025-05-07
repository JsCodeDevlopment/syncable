CREATE TABLE IF NOT EXISTS users (
  id            SERIAL,
  name          VARCHAR(50) NOT NULL,
  email         VARCHAR(100) NOT NULL,
  password_hash VARCHAR(300) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT users_pk PRIMARY KEY (id),
  CONSTRAINT users_email_uk UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id                    INT NOT NULL,
  working_hours              INT NOT NULL,
  timezone                   VARCHAR(10) NOT NULL,
  auto_detect_breaks         BOOLEAN NOT NULL DEFAULT FALSE,
  enable_notifications       BOOLEAN NOT NULL DEFAULT TRUE,
  enable_email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  allow_sharing              BOOLEAN NOT NULL DEFAULT TRUE,
  share_duration_days        INT NOT NULL DEFAULT 15,
  
  CONSTRAINT user_settings_pk PRIMARY KEY (user_id),
  CONSTRAINT user_settings_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS time_entries (
  id         SERIAL,
  user_id    INT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time   TIMESTAMP NULL,
  status     VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT time_entries_pk PRIMARY KEY (id),
  CONSTRAINT time_entries_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS breaks (
  id            SERIAL,
  time_entry_id INT NOT NULL,
  start_time    TIMESTAMP NOT NULL,
  end_time      TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT breaks_pk PRIMARY KEY (id),
  CONSTRAINT breaks_time_entry_id_fk FOREIGN KEY (time_entry_id) REFERENCES time_entries (id)
);

-- run it with local local like this:
-- docker exec -i db psql -U postgres -d postgres < create_users.sql