import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Submission from '#models/submission'

export default class Contest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare category: string

  @column()
  declare organizer: string | null

  @column()
  declare description: string

  @column()
  declare weightPublic: number

  @column()
  declare weightJury: number

  @column.dateTime()
  declare deadline: DateTime

  @column()
  declare imageUrl: string | null

  @column()
  declare status: string

  // Relasi: Satu Kontes memiliki Banyak Submission (Karya)
  @hasMany(() => Submission)
  declare submissions: HasMany<typeof Submission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}