import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Contest from '#models/contest' // Sesuaikan jika nama modelmu 'Sayembara'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // 1. BERSIHKAN TOTAL SEMUA TABEL (Menghapus massal akun & lomba lama)
    await db.rawQuery('PRAGMA foreign_keys = OFF;')
    
    await User.query().delete()
    await Contest.query().delete()
    
    try {
      await db.from('submissions').delete()
      await db.from('votes').delete()
    } catch (e) {
      // Diabaikan jika nama tabel submission/vote berbeda
    }

    await db.rawQuery('PRAGMA foreign_keys = ON;')

    console.log('🧹 Database lama telah dibersihkan total!')

    // 2. SUNTIK DATA AKUN BARU YANG BERSIH
    await User.create({
      fullName: 'Shafa Admin',
      email: 'admin@kreasihub.com',
      password: 'password123', 
      role: 'admin',
    })

    await User.create({
      fullName: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: 'password123',
      role: 'user',
    })

    // 3. SUNTIK DATA KONTEN SAYEMBARA BARU UNTUK DEMO
    await Contest.createMany([
      {
        title: 'Lomba UI/UX Nasional Kreatif 2026',
        category: 'Web Design',
        organizer: 'Himpunan Mahasiswa Informatika',
        description: 'Rancang solusi antarmuka aplikasi mobile bertema Eco-Friendly. Terbuka untuk seluruh mahasiswa aktif di Indonesia dengan total hadiah belasan juta rupiah.',
        weightPublic: 40,
        weightJury: 60,
        status: 'active',
        deadline: DateTime.now().plus({ days: 14 }),
      },
      {
        title: 'Sayembara Desain Maskot KreasiHub',
        category: 'Logo',
        organizer: 'Internal KreasiHub Team',
        description: 'Ciptakan karakter maskot unik yang merepresentasikan semangat kolaborasi, kreativitas, dan teknologi anak muda masa kini.',
        weightPublic: 50,
        weightJury: 50,
        status: 'active',
        deadline: DateTime.now().plus({ days: 7 }),
      },
      {
        title: 'Kompetisi Poster Digital Edukasi AI',
        category: 'Poster',
        organizer: 'Lab Komputer Kreatif',
        description: 'Tuangkan ide visualmu mengenai cara bijak memanfaatkan Artificial Intelligence dalam dunia pendidikan modern lewat selembar poster digital.',
        weightPublic: 30,
        weightJury: 70,
        status: 'active',
        deadline: DateTime.now().plus({ days: 20 }),
      }
    ])

    console.log('🎉 Seeder sukses dijalankan!')
  }
}