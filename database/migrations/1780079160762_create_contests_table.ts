import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.string('category').notNullable()
      table.text('description').notNullable()
      table.integer('weight_public').defaultTo(50)
      table.integer('weight_jury').defaultTo(50)
      table.timestamp('deadline').notNullable()
      table.string('status').defaultTo('active')
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}