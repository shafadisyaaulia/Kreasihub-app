import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Daftarkan AppsController (Gunakan sintaks pemanggilan string/lazy load sesuai standar AdonisJS v6)
const AppsController = () => import('#controllers/apps_controller')

// ==========================================
// 🌍 ROUTE PUBLIK & PESERTA
// ==========================================

// Halaman Utama / Landing Page
router.get('/', [AppsController, 'landing'])

// Halaman Detail Sayembara & Galeri Karya
router.get('/sayembara/:id', [AppsController, 'contestDetail'])

// Form Aksi: Peserta Mengunggah/Daftar Karya Baru
router.post('/sayembara/:id/submit', [AppsController, 'storeSubmission'])

// Aksi AJAX: Tombol Like/Vote Publik pada Karya
router.post('/submission/:submissionId/vote-public', [AppsController, 'publicVote'])


// ==========================================
// ⚖️ ROUTE PANEL JURI
// ==========================================

// Form Aksi: Juri Menginput Nilai Angka (1-100)
router.post('/submission/:submissionId/vote-jury', [AppsController, 'juryVote'])


// ==========================================
// ✏️ ROUTE DASHBOARD ADMIN (CRUD CONTEST)
// ==========================================

// Halaman Utama Dashboard Kelola Admin
router.get('/admin/dashboard', [AppsController, 'adminDashboard']).use(middleware.auth())

// Admin Action: Detail Sayembara Khusus Admin
router.get('/admin/sayembaras/:id', [AppsController, 'adminContestDetail']).use(middleware.auth())

// Admin Action: Edit Sayembara
router.post('/admin/sayembaras/:id/edit', [AppsController, 'updateContest']).use(middleware.auth())

// Admin Action: Membuat Sayembara Baru (Create)
router.post('/admin/sayembaras', [AppsController, 'storeContest']).use(middleware.auth())

// Admin Action: Menghapus Sayembara (Delete)
router.delete('/admin/sayembaras/:id', [AppsController, 'deleteContest']).use(middleware.auth())

// Admin Action: Menghapus Submission / Peserta
router.delete('/admin/submissions/:id', [AppsController, 'deleteSubmission']).use(middleware.auth())

// ==========================================
// 🔐 ROUTE AUTHENTICATION (LOGIN & SIGNUP)
// ==========================================
const SessionController = () => import('#controllers/session_controller')
const NewAccountController = () => import('#controllers/new_account_controller')

// Form Pendaftaran Admin (Tutup akses publik bila dipakai di production sungguhan)
router.get('/signup', [NewAccountController, 'create']).use(middleware.guest())
router.post('/signup', [NewAccountController, 'store']).use(middleware.guest())

// Halaman Login & Proses Login
router.get('/login', [SessionController, 'create']).use(middleware.guest())
router.post('/login', [SessionController, 'store']).use(middleware.guest())

// Logout (Hanya jika terotentikasi)
router.post('/logout', [SessionController, 'destroy']).use(middleware.auth())