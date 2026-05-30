import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Submission from '#models/submission'
import User from '#models/user'

export default class Vote extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare submissionId: number

  @column()
  declare userId: number | null

  @column({ columnName: 'voter_name' })
  declare voterName: string | null

  @column()
  declare type: string

  @column()
  declare score: number

  @belongsTo(() => Submission)
  declare submission: BelongsTo<typeof Submission>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}