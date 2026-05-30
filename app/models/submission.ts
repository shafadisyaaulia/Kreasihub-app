import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Contest from '#models/contest'
import Vote from '#models/vote'

export default class Submission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare contestId: number

  @column()
  declare participantName: string

  @column()
  declare title: string

  @column()
  declare imageUrl: string

  @column()
  declare finalScore: number

  @belongsTo(() => Contest)
  declare contest: BelongsTo<typeof Contest>

  @hasMany(() => Vote)
  declare votes: HasMany<typeof Vote>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}