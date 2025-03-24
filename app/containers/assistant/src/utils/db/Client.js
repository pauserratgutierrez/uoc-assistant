import mysql from 'mysql2/promise'

export class DBClient {
  static #instance
  #pool

  constructor(config) {
    if (DBClient.#instance) throw new Error('Use DBClient.getInstance() to get instance.')

    const { host, user, password, database, port } = config
    this.#pool = mysql.createPool({
      host, user, password, database, port,
      connectionLimit: 10,
      queueLimit: 0,
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 30000,
      maxIdle: 10,
      idleTimeout: 60000,
      namedPlaceholders: true,
    })

    DBClient.#instance = this
  }

  static getInstance(config = null) {
    if (!DBClient.#instance && config) DBClient.#instance = new DBClient(config)
    if (!DBClient.#instance) throw new Error('DB service not initialized. Provide config.')

    return DBClient.#instance
  }

  async close() {
    if (this.#pool) {
      await this.#pool.end()
      DBClient.#instance = null
    }
  }

  /**
   * Execute a SQL query
   * @param {string} sql - SQL query
   * @param {Array} [params=[]] - Query parameters
   * @param {boolean} [usePrepared=true] - Use prepared statement
   * @returns {Promise<Array>} - Query results
   */
  async query(sql, params = [], usePrepared = true) {
    const connection = await this.#pool.getConnection()
    try {
      const [rows] = usePrepared
        ? await connection.execute(sql, params)
        : await connection.query(sql)
      return rows
    } catch (error) {
      console.error('Database query error:', error.message)
      throw error
    } finally {
      connection.release()
    }
  }

  // Helper methods for common operations
  /**
   * Find a single record matching conditions
   * @param {string} table - Table name
   * @param {Object} conditions - WHERE conditions
   * @param {string|Array} fields - Fields to select
   * @returns {Promise<Object|null>} - Found record or null
   */
  async findOne(table, conditions = {}, fields = '*') {
    const whereClauses = []
    const params = []

    Object.entries(conditions).forEach(([key, value]) => {
      whereClauses.push(`${key} = ?`)
      params.push(value)
    })

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const fieldsStr = Array.isArray(fields) ? fields.join(', ') : fields
    const sql = `SELECT ${fieldsStr} FROM ${table} ${whereClause} LIMIT 1`

    const results = await this.query(sql, params)
    return results[0] || null
  }

  /**
   * Find all records matching conditions
   * @param {string} table - Table name
   * @param {Object} conditions - WHERE conditions
   * @param {string|Array} fields - Fields to select
   * @param {Object} options - Query options (orderBy, limit, offset)
   * @returns {Promise<Array>} - Found records
   */
  async findAll(table, conditions = {}, fields = '*', options = {}) {
    const { orderBy, limit, offset } = options
    const whereClauses = []
    const params = []

    Object.entries(conditions).forEach(([key, value]) => {
      if (value === null) {
        whereClauses.push(`${key} IS NULL`)
      } else {
        whereClauses.push(`${key} = ?`)
        params.push(value)
      }
    })

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : ''
    const limitClause = limit ? `LIMIT ${parseInt(limit, 10)}` : ''
    const offsetClause = offset ? `OFFSET ${parseInt(offset, 10)}` : ''
    const fieldsStr = Array.isArray(fields) ? fields.join(', ') : fields

    const sql = `SELECT ${fieldsStr} FROM ${table} ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`

    return this.query(sql, params)
  }

  /**
   * Insert a new record
   * @param {string} table - Table name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} - Insert result
   */
  async insert(table, data) {
    const keys = Object.keys(data)
    const placeholders = keys.map(() => '?').join(', ')
    const values = Object.values(data)

    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`

    return await this.query(sql, values)
  }

  /**
   * Insert a new record or update if it exists
   * @param {string} table - Table name
   * @param {Object} data - Record data to insert/update
   * @param {Array} uniqueKeys - Keys that determine uniqueness
   * @param {Object} [updateData=null] - Specific fields to update (defaults to all data fields)
   * @returns {Promise<Object>} - Result of the operation
   */
  async upsert(table, data, uniqueKeys, updateData = null) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => '?').join(', ')

    const updateFields = updateData || data
    const updateEntries = Object.entries(updateFields)
      .filter(([key]) => !uniqueKeys.includes(key)) // Don't update primary/unique keys

    const updateClauses = updateEntries.map(([key]) => 
      `${key} = VALUES(${key})`
    ).join(', ')

    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      ON DUPLICATE KEY UPDATE ${updateClauses}
    `

    return await this.query(sql, values)
  }

  /**
   * Update records matching conditions
   * @param {string} table - Table name
   * @param {Object} data - Update data
   * @param {Object} conditions - WHERE conditions
   * @returns {Promise<Object>} - Update result
   */
  async update(table, data, conditions) {
    const setValues = []
    const whereValues = []
    const setParams = []
    const whereParams = []

    Object.entries(data).forEach(([key, value]) => {
      setValues.push(`${key} = ?`)
      setParams.push(value)
    })

    Object.entries(conditions).forEach(([key, value]) => {
      if (value === null) {
        whereValues.push(`${key} IS NULL`)
      } else {
        whereValues.push(`${key} = ?`)
        whereParams.push(value)
      }
    })

    if (whereValues.length === 0) {
      throw new Error('Update requires conditions')
    }

    const sql = `UPDATE ${table} SET ${setValues.join(', ')} WHERE ${whereValues.join(' AND ')}`

    return await this.query(sql, [...setParams, ...whereParams])
  }

  /**
   * Delete records matching conditions
   * @param {string} table - Table name
   * @param {Object} conditions - WHERE conditions
   * @returns {Promise<Object>} - Delete result
   */
  async delete(table, conditions) {
    const whereValues = []
    const whereParams = []

    Object.entries(conditions).forEach(([key, value]) => {
      if (value === null) {
        whereValues.push(`${key} IS NULL`)
      } else {
        whereValues.push(`${key} = ?`)
        whereParams.push(value)
      }
    })

    if (whereValues.length === 0) {
      throw new Error('Delete requires conditions')
    }

    const sql = `DELETE FROM ${table} WHERE ${whereValues.join(' AND ')}`

    return await this.query(sql, whereParams)
  }

  /**
   * Count records in a table
   * @param {string} table - Table name
   * @param {Object} conditions - WHERE conditions
   * @returns {Promise<number>} - Count of records
   */
  async count(table, conditions = {}) {
    const whereClauses = []
    const params = []

    Object.entries(conditions).forEach(([key, value]) => {
      if (value === null) {
        whereClauses.push(`${key} IS NULL`)
      } else {
        whereClauses.push(`${key} = ?`)
        params.push(value)
      }
    })

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`

    const result = await this.query(sql, params)
    return result[0].count
  }
}