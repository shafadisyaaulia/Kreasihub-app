import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine' 

export default class NewAccountController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  async store({ request, response, auth, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(signupValidator)
      
      const user = await User.create({ 
        ...payload,
        role: 'user' 
      })
      
      await auth.use('web').login(user)
      session.flash('success', 'Akun berhasil dibuat! Selamat bergabung di KreasiHub 🎉')
      
      return response.redirect('/')
    } catch (error: any) { 
      console.error('ERROR SIGNUP:', error)

      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        session.flash('errors', error.messages)
        session.flash('error', 'Gagal mendaftar. Silakan periksa kembali form Anda.')
      } else if (error.code === 'E_ROW_NOT_FOUND' || error.message?.includes('UNIQUE')) {
        session.flash('error', 'Email sudah terdaftar. Silakan gunakan email lain.')
      } else {
        session.flash('error', 'Gagal membuat akun. Pastikan data yang kamu masukkan sudah benar.')
      }
      
      return response.redirect('/signup')
    }
  }
}