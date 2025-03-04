export class DBDatasetFiles {
  #db

  constructor(dbInstance) {
    this.#db = dbInstance
  }

  // Database queries for dataset_files table

  async getAll(gh_repo, gh_file_dir_path) {
    const query = `SELECT * FROM dataset_files WHERE gh_repo = ? AND gh_file_dir_path = ?`
    return await this.#db.query(query, [gh_repo, gh_file_dir_path])
  }

  async saveFileInfo(gh_file_name, gh_repo, gh_file_dir_path, gh_file_hash, openai_file_id) {
    const query = `
      INSERT INTO dataset_files
        (gh_file_name, gh_repo, gh_file_dir_path, gh_file_hash, openai_file_id)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        gh_file_dir_path = VALUES(gh_file_dir_path),
        gh_file_hash = VALUES(gh_file_hash),
        openai_file_id = VALUES(openai_file_id),
        last_updated = NOW()
    `
    await this.#db.query(query, [gh_file_name, gh_repo, gh_file_dir_path, gh_file_hash, openai_file_id])
  }

  async deleteFile(gh_file_name, gh_repo, gh_file_dir_path) {
    const query = `DELETE FROM dataset_files WHERE gh_file_name = ? AND gh_repo = ? AND gh_file_dir_path = ?`
    await this.#db.query(query, [gh_file_name, gh_repo, gh_file_dir_path])
  }

  async getFileId(gh_file_name, gh_repo, gh_file_dir_path) {
    const query = `SELECT openai_file_id FROM dataset_files WHERE gh_file_name = ? AND gh_repo = ? AND gh_file_dir_path = ?`
    const result = await this.#db.query(query, [gh_file_name, gh_repo, gh_file_dir_path])
    return result.length ? result[0].openai_file_id : null
  }
}