-- OpenAI Vector Store
CREATE TABLE IF NOT EXISTS dataset_files (
  gh_file_name VARCHAR(255) NOT NULL,
  gh_file_dir_path VARCHAR(255) NOT NULL, -- Excluding the file name
  gh_file_hash VARCHAR(64) NOT NULL,
  gh_repo VARCHAR(255) NOT NULL,
  openai_file_id VARCHAR(50), -- Comes afterwards, when the file is uploaded to OpenAI
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (gh_file_name, gh_file_dir_path, gh_repo)
);

-- Keep track of Discord users on the server
CREATE TABLE IF NOT EXISTS discord_users (
  id int AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL UNIQUE,
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keep track of threads created by users (Discord - OpenAI)
CREATE TABLE IF NOT EXISTS discord_ai_threads (
  user_id INT NOT NULL,
  discord_thread_id VARCHAR(50) PRIMARY KEY,
  openai_thread_id VARCHAR(50) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES discord_users(id) ON DELETE CASCADE,
  CONSTRAINT uc_discord_users_threads UNIQUE (user_id, discord_thread_id)
);