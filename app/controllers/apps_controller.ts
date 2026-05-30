import { HttpContext } from '@adonisjs/core/http'
import Contest from '#models/contest'
import Submission from '#models/submission'
import Vote from '#models/vote'
import { DateTime } from 'luxon'

export default class AppsController {
  
  /**
   * 1. HALAMAN UTAMA (LANDING PAGE)
   */
  public async landing({ view }: HttpContext) {
    const contests = await Contest.query()
      .preload('submissions')
      .orderBy('createdAt', 'desc')

    return view.render('pages/landing', { contests })
  }

  /**
   * 2. HALAMAN DETAIL SAYEMBARA
   */
  public async contestDetail({ params, view }: HttpContext) {
    const contest = await Contest.query()
      .where('id', params.id)
      .preload('submissions', (query) => {
        query.orderBy('finalScore', 'desc').preload('votes')
      })
      .firstOrFail()

    const isClosed = DateTime.now() > contest.deadline

    return view.render('pages/contest_detail', { contest, isClosed })
  }

  /**
   * 3. SUBMIT KARYA (PESERTA)
   */
  public async storeSubmission({ request, response, params }: HttpContext) {
    const contest = await Contest.findOrFail(params.id)
    if (DateTime.now() > contest.deadline) {
      return response.redirect('back') // Cegah pengumpulan jika udah deadline
    }

    const data = request.only(['participant_name', 'title', 'image_url'])
    
    await Submission.create({
      contestId: params.id,
      participantName: data.participant_name,
      title: data.title,
      imageUrl: data.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
      finalScore: 0
    })

    return response.redirect(`/sayembara/${params.id}`)
  }

  /**
   * 4. PROSES VOTE PUBLIK (SINKRONISASI PARAMETER AMAN)
   */
  public async publicVote({ params, response }: HttpContext) {
    const submissionId = params.submissionId
    const submission = await Submission.findOrFail(submissionId)
    const contest = await Contest.findOrFail(submission.contestId)

    if (DateTime.now() <= contest.deadline) {
      return response.status(403).json({ success: false, message: 'Voting belum dibuka' }) // Cegah nyolong vote
    }

    await Vote.create({
      submissionId: Number(submissionId),
      type: 'public',
      score: 1
    })

    // Hitung ulang bobot setelah vote berhasil masuk
    await this.calculateWeights(Number(submissionId))

    return response.json({ success: true })
  }

  /**
   * 5. PROSES INPUT NILAI JURI
   */
  public async juryVote({ request, response, params }: HttpContext) {
    const submissionId = params.submissionId
    const scoreInput = request.input('score')
    
    // Keamanan cek Juri juga! (Opsional / bisa dinonaktifkan kalau juri dibolehkan vote duluan, tapi kita batasi juri hanya bisa vote pasca-deadline juga)
    const submission = await Submission.findOrFail(submissionId)
    const contest = await Contest.findOrFail(submission.contestId)
    if (DateTime.now() <= contest.deadline) {
      return response.redirect('back')
    }

    await Vote.query().where('submission_id', submissionId).where('type', 'jury').delete()

    await Vote.create({
      submissionId: Number(submissionId),
      type: 'jury',
      score: parseInt(scoreInput) || 0
    })

    await this.calculateWeights(Number(submissionId))

    return response.redirect('back')
  }

  /**
   * 6. HALAMAN DASHBOARD ADMIN
   */
  public async adminDashboard({ view }: HttpContext) {
    const contests = await Contest.query().preload('submissions').orderBy('createdAt', 'desc')
    
    const totalContests = await Contest.query().count('* as total')
    const totalSubmissions = await Submission.query().count('* as total')
    const totalVotes = await Vote.query().count('* as total')

    return view.render('pages/admin/dashboard', { 
      contests,
      stats: {
        contests: totalContests[0].$extras.total || 0,
        submissions: totalSubmissions[0].$extras.total || 0,
        votes: totalVotes[0].$extras.total || 0
      }
    })
  }

  /**
   * ADMIN ACTION: DETAIL KONTEST KHUSUS ADMIN (Lihat Pendaftar)
   */
  public async adminContestDetail({ params, view }: HttpContext) {
    const contest = await Contest.query()
      .where('id', params.id)
      .preload('submissions', (query) => {
        query.orderBy('finalScore', 'desc').preload('votes')
      })
      .firstOrFail()

    return view.render('pages/admin/contest_detail', { contest })
  }

  /**
   * ADMIN ACTION: EDIT SAYEMBARA (Update)
   */
  public async updateContest({ params, request, response }: HttpContext) {
    const data = request.only(['title', 'category', 'description', 'weight_public', 'weight_jury', 'deadline', 'image_url'])
    const contest = await Contest.findOrFail(params.id)

    let deadlineIsoStrStr = data.deadline
    if(deadlineIsoStrStr) {
       deadlineIsoStrStr = DateTime.fromISO(data.deadline).toSQL() || data.deadline
    }

    contest.title = data.title
    contest.category = data.category
    contest.description = data.description
    contest.weightPublic = parseInt(data.weight_public) || contest.weightPublic
    contest.weightJury = parseInt(data.weight_jury) || contest.weightJury
    contest.deadline = DateTime.fromSQL(deadlineIsoStrStr)
    if (data.image_url) {
      contest.imageUrl = data.image_url
    }

    await contest.save()

    return response.redirect('back')
  }

  /**
   * ADMIN ACTION: HAPUS SUBMISSION / PESERTA
   */
  public async deleteSubmission({ params, response }: HttpContext) {
    const sub = await Submission.findOrFail(params.id)
    await sub.delete()
    return response.redirect('back')
  }

  /**
   * 7. ADMIN ACTION: BUAT SAYEMBARA BARU
   */
  public async storeContest({ request, response }: HttpContext) {
    const data = request.only(['title', 'category', 'organizer', 'description', 'weight_public', 'weight_jury', 'deadline'])

    let defaultImg = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800'
    if (data.category === 'Poster') {
      defaultImg = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800' // Poster vibe
    } else if (data.category === 'Web Design') {
      defaultImg = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800' // Web/Mac vibe
    } else if (data.category === 'Logo') {
      defaultImg = 'https://images.unsplash.com/photo-1600860269094-1aed5b96ed5e?q=80&w=800' // Vector/Color vibe
    }

    await Contest.create({
      title: data.title,
      category: data.category,
      organizer: data.organizer,
      description: data.description,
      weightPublic: parseInt(data.weight_public) || 50,
      weightJury: parseInt(data.weight_jury) || 50,
      deadline: DateTime.fromISO(data.deadline),
      imageUrl: defaultImg,
      status: 'active'
    })

    return response.redirect('/admin/dashboard')
  }

  /**
   * 8. ADMIN ACTION: HAPUS SAYEMBARA
   */
  public async deleteContest({ params, response }: HttpContext) {
    const contest = await Contest.findOrFail(params.id)
    await contest.delete()
    return response.redirect('/admin/dashboard')
  }

  /**
   * 🧮 CORE ENGINE LOGIC: RUMUS PERHITUNGAN BOBOT DINAMIS
   */
  private async calculateWeights(submissionId: number) {
    const submission = await Submission.findOrFail(submissionId)
    const contest = await Contest.findOrFail(submission.contestId)

    // A. Komponen Juri (Skala 1-100)
    const juryVotes = await Vote.query().where('submission_id', submissionId).where('type', 'jury')
    const totalJuryScore = juryVotes.reduce((sum, v) => sum + v.score, 0)
    const avgJuryScore = juryVotes.length > 0 ? totalJuryScore / juryVotes.length : 0

    // B. Komponen Publik
    const publicVotesCount = await Vote.query().where('submission_id', submissionId).where('type', 'public').count('* as total')
    const currentPublicVotes = Number(publicVotesCount[0].$extras.total || 0)

    const maxPublicResult = await Vote.query()
      .join('submissions', 'votes.submission_id', 'submissions.id')
      .where('submissions.contest_id', contest.id)
      .where('votes.type', 'public')
      .groupBy('votes.submission_id')
      .select('votes.submission_id')
      .count('* as total')
      .orderBy('total', 'desc')
      .first()

    const maxPublicVotes = maxPublicResult ? Number(maxPublicResult.$extras.total) : 1

    // C. Rumus Komparasi Persentase Kustom
    const publicComponent = (currentPublicVotes / maxPublicVotes) * contest.weightPublic
    const juryComponent = avgJuryScore * (contest.weightJury / 100)

    // D. Simpan Hasil Akhir
    submission.finalScore = Number((publicComponent + juryComponent).toFixed(2))
    await submission.save()
  }
}