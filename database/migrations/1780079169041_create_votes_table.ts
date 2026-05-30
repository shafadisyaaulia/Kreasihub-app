import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'votes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('submission_id').references('id').inTable('submissions').onDelete('CASCADE')

      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').nullable()

      table.string('type').notNullable()
      table.integer('score').defaultTo(1)
      table.timestamp('created_at').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}