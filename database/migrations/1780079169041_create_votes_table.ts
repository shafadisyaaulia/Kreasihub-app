import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'votes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      // Menghubungkan vote ke ID karya di tabel submissions
      table.integer('submission_id').unsigned().references('id').inTable('submissions').onDelete('CASCADE')
      table.string('type').notNullable() // Berisi 'public' atau 'jury'
      table.integer('score').defaultTo(1) // Jika public nilainya otomatis 1 (seperti like/heart), jika juri nilainya bisa kustom (1-100)
      
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}