import vine from '@vinejs/vine'

/**
 * Buat skema mentah objek user
 */
const signupSchema = vine.object({
  fullName: vine.string().nullable(),
  email: vine.string().email().unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).maxLength(32), // Bersih tanpa confirmed!
})

/**
 * Ekspor sebagai validator siap pakai dengan melakukan kompilasi ulang (fresh compile)
 */
export const signupValidator = vine.compile(signupSchema)