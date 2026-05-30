import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Submission from '#models/submission'

export default class Vote extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare submissionId: number

  @column()
  declare type: string // 'public' atau 'jury'

  @column()
  declare score: number // 1 untuk publik, kustom (1-100) untuk juri

  // Relasi: Vote ini ditujukan untuk sebuah Submission (Karya)
  @belongsTo(() => Submission)
  declare submission: BelongsTo<typeof Submission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}