import { HttpContext } from '@adonisjs/core/http'
import Contest from '#models/contest'
import Submission from '#models/submission'
import Vote from '#models/vote'
import { DateTime } from 'luxon'

export default class AppsController {

  public async landing({ view }: HttpContext) {
    const contests = await Contest.query()
      .preload('submissions')
      .orderBy('createdAt', 'desc')
    return view.render('pages/landing', { contests })
  }

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

  public async storeSubmission({ request, response, params, session }: HttpContext) {
    const contest = await Contest.findOrFail(params.id)
    if (DateTime.now() > contest.deadline) {
      session.flash('error', 'Maaf, masa pengumpulan karya sudah ditutup.')
      return response.redirect('back')
    }
    const data = request.only(['participant_name', 'title', 'image_url'])
    await Submission.create({
      contestId: params.id,
      participantName: data.participant_name,
      title: data.title,
      imageUrl: data.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
      finalScore: 0
    })
    session.flash('success', `Karya "${data.title}" berhasil dikirim! Semoga berhasil 🎉`)
    return response.redirect(`/sayembara/${params.id}`)
  }

  public async publicVote({ params, request, response }: HttpContext) {
    const submissionId = params.submissionId
    const submission = await Submission.findOrFail(submissionId)
    const contest = await Contest.findOrFail(submission.contestId)

    // 2. Cek apakah voting sudah dibuka (setelah melewati deadline)
    if (DateTime.now() <= contest.deadline) {
      return response.status(403).json({ 
        success: false, 
        message: 'Voting belum dibuka!' 
      })
    }

    let voterName = (request.input('voter_name') || '').trim()
    if (!voterName) {
      return response.status(400).json({ success: false, message: 'Masukkan nama kamu sebelum vote.' })
    }
    // Normalize whitespace and limit length
    voterName = voterName.replace(/\s+/g, ' ').slice(0, 100)

    // Cegah nama yang sama vote karya yang sama lebih dari sekali
    const existing = await Vote.query()
      .where('submission_id', submissionId)
      .where('type', 'public')
      .whereRaw('lower(voter_name) = ?', [voterName.toLowerCase()])
      .first()

    if (existing) {
      return response.status(400).json({ success: false, message: 'Nama ini sudah pernah memberi vote untuk karya ini.' })
    }

    await Vote.create({ 
      submissionId: Number(submissionId), 
      voterName: voterName,
      type: 'public', 
      score: 1 
    })

    await this.calculateWeights(Number(submissionId))
    return response.json({ success: true })
  }

  public async juryVote({ request, response, params, session }: HttpContext) {
    const submissionId = params.submissionId
    const scoreInput = request.input('score')
    const submission = await Submission.findOrFail(submissionId)
    const contest = await Contest.findOrFail(submission.contestId)
    if (DateTime.now() <= contest.deadline) {
      session.flash('error', 'Penilaian juri hanya bisa dilakukan setelah deadline.')
      return response.redirect('back')
    }
    await Vote.query().where('submission_id', submissionId).where('type', 'jury').delete()
    await Vote.create({ submissionId: Number(submissionId), type: 'jury', score: parseInt(scoreInput) || 0 })
    await this.calculateWeights(Number(submissionId))
    session.flash('success', `Nilai juri berhasil disimpan: ${scoreInput}/100`)
    return response.redirect('back')
  }

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

  public async adminContestDetail({ params, view }: HttpContext) {
    const contest = await Contest.query()
      .where('id', params.id)
      .preload('submissions', (query) => {
        query.orderBy('finalScore', 'desc').preload('votes')
      })
      .firstOrFail()
    return view.render('pages/admin/contest_detail', { contest })
  }

  public async updateContest({ params, request, response, session }: HttpContext) {
    const data = request.only(['title', 'category', 'description', 'weight_public', 'weight_jury', 'deadline', 'image_url'])
    const contest = await Contest.findOrFail(params.id)
    
    contest.title = data.title
    contest.category = data.category
    contest.description = data.description
    contest.weightPublic = parseInt(data.weight_public) || contest.weightPublic
    contest.weightJury = parseInt(data.weight_jury) || contest.weightJury
    contest.imageUrl = data.image_url || contest.imageUrl

    if (data.deadline) {
      contest.deadline = DateTime.fromISO(data.deadline)
    }

    await contest.save()
    session.flash('success', `Sayembara "${contest.title}" berhasil diperbarui.`)
    return response.redirect('back')
  }

  public async deleteSubmission({ params, response, session }: HttpContext) {
    const sub = await Submission.findOrFail(params.id)
    const title = sub.title
    await sub.delete()
    session.flash('success', `Karya "${title}" berhasil dihapus.`)
    return response.redirect('back')
  }

  public async storeContest({ request, response, session }: HttpContext) {
    const data = request.only(['title', 'category', 'organizer', 'description', 'weight_public', 'weight_jury', 'deadline'])
    let defaultImg = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800'
    if (data.category === 'Poster') defaultImg = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800'
    else if (data.category === 'Web Design') defaultImg = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800'
    else if (data.category === 'Logo') defaultImg = 'https://images.unsplash.com/photo-1600860269094-1aed5b96ed5e?q=80&w=800'
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
    session.flash('success', `Sayembara "${data.title}" berhasil dipublikasikan! 🎉`)
    return response.redirect('/admin/dashboard')
  }

  public async deleteContest({ params, response, session }: HttpContext) {
    const contest = await Contest.findOrFail(params.id)
    const title = contest.title
    await contest.delete()
    session.flash('success', `Sayembara "${title}" berhasil dihapus.`)
    return response.redirect('/admin/dashboard')
  }

  private async calculateWeights(submissionId: number) {
    const submission = await Submission.findOrFail(submissionId)
    const contest = await Contest.findOrFail(submission.contestId)
    const juryVotes = await Vote.query().where('submission_id', submissionId).where('type', 'jury')
    const totalJuryScore = juryVotes.reduce((sum, v) => sum + v.score, 0)
    const avgJuryScore = juryVotes.length > 0 ? totalJuryScore / juryVotes.length : 0
    const publicVotesCount = await Vote.query().where('submission_id', submissionId).where('type', 'public').count('* as total')
    const currentPublicVotes = Number(publicVotesCount[0].$extras.total || 0)
    const maxPublicResult = await Vote.query()
      .join('submissions', 'votes.submission_id', 'submissions.id')
      .where('submissions.contest_id', contest.id)
      .where('votes.type', 'public')
      .join('votes as v2', 'v2.submission_id', 'submissions.id')
      .groupBy('votes.submission_id')
      .select('votes.submission_id')
      .count('* as total')
      .orderBy('total', 'desc')
      .first()
    const maxPublicVotes = maxPublicResult ? Number(maxPublicResult.$extras.total) : 1
    const publicComponent = (currentPublicVotes / maxPublicVotes) * contest.weightPublic
    const juryComponent = avgJuryScore * (contest.weightJury / 100)
    submission.finalScore = Number((publicComponent + juryComponent).toFixed(2))
    await submission.save()
  }
}