import { up as v1InitialMigration } from './v1.js'

/**
 * Database migrations list
 * Each migration should have:
 * - version: Unique numeric version (incremented for each migration)
 * - name: Descriptive name of the migration
 * - up: Function that performs the migration (receives db instance)
 */
export default [
  {
    version: 1,
    name: 'Initial schema',
    up: v1InitialMigration
  }
]