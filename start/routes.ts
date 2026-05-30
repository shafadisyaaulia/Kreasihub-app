import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AppsController = () => import('#controllers/apps_controller')
const SessionController = () => import('#controllers/session_controller')


// 🌍 PUBLIK
router.get('/', [AppsController, 'landing'])
router.get('/sayembara/:id', [AppsController, 'contestDetail'])
router.post('/sayembara/:id/submit', [AppsController, 'storeSubmission'])
router.post('/submission/:submissionId/vote-public', [AppsController, 'publicVote'])

// ⚖️ JURI
router.post('/submission/:submissionId/vote-jury', [AppsController, 'juryVote']).use(middleware.admin())

// ✏️ ADMIN (semua pakai middleware.auth())
router.get('/admin/dashboard', [AppsController, 'adminDashboard']).use(middleware.admin())
router.get('/admin/sayembaras/:id', [AppsController, 'adminContestDetail']).use(middleware.admin())
router.post('/admin/sayembaras/:id/edit', [AppsController, 'updateContest']).use(middleware.admin())
router.post('/admin/sayembaras', [AppsController, 'storeContest']).use(middleware.admin())
router.delete('/admin/sayembaras/:id', [AppsController, 'deleteContest']).use(middleware.admin())
router.delete('/admin/submissions/:id', [AppsController, 'deleteSubmission']).use(middleware.admin())
router.get('/admin/users', [() => import('#controllers/session_controller'), 'index']).use(middleware.admin())

// 🔐 AUTH
router.get('/login', [SessionController, 'create']).use(middleware.guest())
router.post('/login', [SessionController, 'store']).use(middleware.guest())
router.post('/logout', [SessionController, 'destroy']).use(middleware.auth())