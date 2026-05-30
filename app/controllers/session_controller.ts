import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/auth'

export default class SessionController {
  /**
   * 👥 MENAMPILKAN DAFTAR PENGGUNA TERDAFTAR (UNTUK ADMIN)
   * Mengambil semua data user di database, diurutkan dari yang terbaru.
   */
  async index({ view }: HttpContext) {
    const users = await User.query().orderBy('createdAt', 'desc')
    return view.render('pages/admin/users', { users })
  }

  /**
   * Menampilkan halaman login
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Memproses data masuk (Login)
   */
  async store({ request, auth, response, session }: HttpContext) {
    const email = String(request.input('email') || '')
      .trim()
      .toLowerCase()
    const password = String(request.input('password') || '').trim()

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      
      // PENGALIHAN BERBASIS ROLE:
      if (user.role === 'admin') {
        session.flash('success', 'Selamat datang kembali, Admin! 👋')
        return response.redirect('/admin/dashboard')
      } else {
        session.flash('success', 'Selamat datang kembali! 👋')
        return response.redirect('/')
      }
      
    } catch (error) {
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        const existingUser = await User.query().where('email', email).first()
        if (!existingUser) {
          session.flash(
            'error',
            'Akun tidak ditemukan. Jalankan seed dulu: migration:fresh lalu db:seed (lihat README.md).'
          )
        } else {
          session.flash('error', 'Email atau password salah. Silakan coba lagi.')
        }
      } else {
        session.flash('error', 'Terjadi kesalahan saat login. Coba beberapa saat lagi.')
      }
      return response.redirect('/login')
    }
  }

  /**
   * Memproses keluar akun (Logout)
   */
  async destroy({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()
    session.flash('success', 'Kamu berhasil logout. Sampai jumpa!')
    return response.redirect('/login')
  }
}