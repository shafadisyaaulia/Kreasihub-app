# KreasiHub (AdonisJS)

Aplikasi web sayembara/kompetisi kreatif berbasis **AdonisJS v6+** (SSR Edge), **SQLite**, dan **Lucid ORM**.

## Fitur Utama

### Halaman User (Public)
- Landing page daftar sayembara
- Detail sayembara
- Submit karya (URL gambar)
- Anti-plagiarisme: galeri karya & voting **terkunci sebelum deadline** (blind submission)

### Dashboard Admin (Wajib Login)
- Login admin
- CRUD Sayembara: buat, lihat, ubah, hapus
- Hapus submission peserta

> Catatan: Semua route `/admin/*` dibatasi **role = admin** via middleware.

## Requirement
- Node.js **>= 22**
- npm

## Instalasi

```bash
cd kreasihub-app
npm install
```

Salin env:

```bash
copy .env.example .env
```

Reset database + jalankan seeder (membuat akun admin dan data demo):

```bash
node --import=tsx bin/console.ts migration:fresh
node --import=tsx bin/console.ts db:seed
```

Jalankan aplikasi:

```bash
npm run dev
```

Akses di browser:
- Public: `http://localhost:3333/`
- Admin dashboard: `http://localhost:3333/admin/dashboard`

## Akun Admin (Seeder)
- Email: `admin@kreasihub.com`
- Password: `password123`

## Struktur Singkat
- `app/controllers` — logic request/response
- `app/models` — model database (Lucid)
- `resources/views` — Edge templates (UI)
- `database/migrations` — skema database
- `database/seeders` — data awal (akun admin + demo)

## Presentasi (Checklist)
- Struktur folder
- Fitur utama (User + Admin)
- Teknologi: AdonisJS, Edge, Lucid, SQLite
- Demo jalan: login admin + CRUD sayembara + user browsing/submit
