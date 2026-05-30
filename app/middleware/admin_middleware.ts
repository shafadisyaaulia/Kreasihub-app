import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AdminMiddleware {
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

      const user = ctx.auth.user
      if (!user || user.role !== 'admin') {
        ctx.session.flash('error', 'Akses ditolak. Halaman ini khusus Admin.')
        return ctx.response.redirect('/')
      }

      return next()
    } catch {
      ctx.session.flash('error', 'Kamu harus login dulu sebagai Admin.')
      return ctx.response.redirect(this.redirectTo)
    }
  }
}
