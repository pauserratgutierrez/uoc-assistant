/**
 * Initial database schema (v1)
 * Creates all tables needed for the Project
 */
export async function up(db) {
  await db.rawQuery(`
    CREATE TABLE IF NOT EXISTS dataset_files (
      gh_file_name VARCHAR(255) NOT NULL,
      gh_file_dir_path VARCHAR(255) NOT NULL,
      gh_file_hash VARCHAR(64) NOT NULL,
      gh_repo VARCHAR(255) NOT NULL,
      openai_file_id VARCHAR(50),
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (gh_file_name, gh_file_dir_path, gh_repo)
    )
  `)

  await db.rawQuery(`    
    CREATE TABLE IF NOT EXISTS discord_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(20) NOT NULL UNIQUE,
      join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.rawQuery(`
    CREATE TABLE IF NOT EXISTS discord_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      assistant_channel_id VARCHAR(20),
      assistant_manager_role_id VARCHAR(20)
    )
  `)

  await db.rawQuery(`
    CREATE TABLE IF NOT EXISTS discord_ai_threads (
      user_id INT NOT NULL,
      discord_thread_id VARCHAR(50) PRIMARY KEY,
      openai_thread_id VARCHAR(50) NOT NULL,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES discord_users(id) ON DELETE CASCADE,
      CONSTRAINT uc_discord_users_threads UNIQUE (user_id, discord_thread_id)
    )
  `)

  await db.rawQuery(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      user_id INT NOT NULL,
      model VARCHAR(50) NOT NULL,
      prompt_token_cost INT NOT NULL,
      completion_token_cost INT NOT NULL,
      prompt_tokens INT NOT NULL,
      completion_tokens INT NOT NULL,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES discord_users(id) ON DELETE CASCADE
    )
  `)
}