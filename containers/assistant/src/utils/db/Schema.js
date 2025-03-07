import migrations from './schemas/index.js'

export class Schema {
  #db
  #migrations

  constructor(dbInstance) {
    this.#db = dbInstance
    this.#migrations = migrations
  }

  get currentTargetVersion() {
    // Find highest version from the migration list
    return this.#migrations.reduce((max, m) => Math.max(max, m.version), 0)
  }

  async initialize() {
    await this.createVersionTable()

    const currentVersion = await this.getCurrentVersion()
    console.log(`Current schema version: ${currentVersion}, target version: ${this.currentTargetVersion}`)

    // Run each migration in sequence
    for (const m of this.#migrations) {
      if (currentVersion < m.version) {
        console.log(`Running migration: ${m.name} (v${m.version})`)

        try {
          await m.up(this.#db)
          await this.setVersion(m.version)
          console.log(`Migration ${m.name} (v${m.version}) completed`)
        } catch (error) {
          console.error(`Failed to apply migration ${m.name} (v${m.version}):`, error.message)
          throw new Error(`Migration failure: ${error.message}`)
        }
      }
    }

    console.log('Database schema is up to date')
  }

  async createVersionTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS schema_version (
        version INT PRIMARY KEY,
        name VARCHAR(255),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
    await this.#db.rawQuery(sql)
  }

  async getCurrentVersion() {
    const tableExists = await this.#db.tableExists('schema_version')
    if (!tableExists) return 0

    const result = await this.#db.rawQuery('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1')
    // return result.length > 0 ? result[0].version : 0
    return result.length ? result[0].version : 0
  }

  async setVersion(v, name = null) {
    const sql = `
      INSERT INTO schema_version (version, name)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE version = VALUES(version), name = VALUES(name)
    `
    await this.#db.query(sql, [v, name])
    console.log(`Schema version set to ${v}`)
  }
}