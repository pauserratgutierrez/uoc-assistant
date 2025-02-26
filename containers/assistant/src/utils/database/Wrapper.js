import mysql from 'mysql2/promise'

export class DBWrapper {
  static instance

  constructor({
    host,
    user,
    password,
    database,
    port
  }) {
    if (DBWrapper.instance) throw new Error('Use DBWrapper.getInstance(config) to get the instance')
    
    this.pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,

      connectionLimit: 10,
      queueLimit: 0,
      waitForConnections: true
    })
    
    DBWrapper.instance = this
  }

  static getInstance(config) {
    if (!DBWrapper.instance) DBWrapper.instance = new DBWrapper(config)
    return DBWrapper.instance
  }

  async close() {
    await this.pool.end()
  }

  /**
   * Main query function that executes the SQL query with the provided parameters.
   */
  async query(sql, params) {
    const connection = await this.pool.getConnection()
    try {
      const [rows] = await connection.execute(sql, params)
      return rows
    } catch (error) {
      throw new Error(error)
    } finally {
      connection.release()
    }
  }

  /**
   * Main transaction function
   */
  // async transaction(callback) {
  //   const connection = await this.pool.getConnection()
  //   try {
  //     await connection.beginTransaction()
  //     const result = await callback(connection)
  //     await connection.commit()
  //     return result
  //   } catch (error) {
  //     await connection.rollback()
  //     throw new Error(error)
  //   } finally {
  //     connection.release()
  //   }
  // }
}