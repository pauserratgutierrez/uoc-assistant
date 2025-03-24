-- Core users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) AUTO_INCREMENT PRIMARY KEY
);

-- Mapping table for identifying users across different platforms
CREATE TABLE IF NOT EXISTS users_platforms (
  user_id VARCHAR(50) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, platform, platform_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Discord-specific configurations
CREATE TABLE IF NOT EXISTS config_discord (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_channel_id VARCHAR(50),
  agent_manager_role_id VARCHAR(50)
);

-- Generic chats for any platform.
CREATE TABLE IF NOT EXISTS chats (
  user_id VARCHAR(50) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  chat_id VARCHAR(50) NOT NULL,
  previous_response_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, platform, chat_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);