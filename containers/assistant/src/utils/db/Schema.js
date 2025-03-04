export class Schema {
  #db

  constructor(dbInstance) {
    this.#db = dbInstance
  }

  async initialize() {
    await this.createDatasetFilesTable()
    await this.createDiscordUsersTable()
    await this.createDiscordAiThreadsTable()
    await this.createAiUsageTable()
  }

  async createDatasetFilesTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS dataset_files (
        gh_file_name VARCHAR(255) NOT NULL,
        gh_file_dir_path VARCHAR(255) NOT NULL,
        gh_file_hash VARCHAR(64) NOT NULL,
        gh_repo VARCHAR(255) NOT NULL,
        openai_file_id VARCHAR(50),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (gh_file_name, gh_file_dir_path, gh_repo)
      )
    `
    return await this.#db.rawQuery(sql)
  }

  async createDiscordUsersTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS discord_users (
        id int AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL UNIQUE,
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    return await this.#db.rawQuery(sql)
  }

  async createDiscordAiThreadsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS discord_ai_threads (
        user_id INT NOT NULL,
        discord_thread_id VARCHAR(50) PRIMARY KEY,
        openai_thread_id VARCHAR(50) NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES discord_users(id) ON DELETE CASCADE,
        CONSTRAINT uc_discord_users_threads UNIQUE (user_id, discord_thread_id)
      )
    `
    return await this.#db.rawQuery(sql)
  }

  async createAiUsageTable() {
    const sql = `
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
    `
    return await this.#db.rawQuery(sql)
  }
}