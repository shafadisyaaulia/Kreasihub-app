import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'submissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('contest_id').unsigned().references('id').inTable('contests').onDelete('CASCADE')
      table.string('participant_name').notNullable()
      table.string('title').notNullable()
      table.string('image_url').notNullable()
      table.float('final_score').defaultTo(0)
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}