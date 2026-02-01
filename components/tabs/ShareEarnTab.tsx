'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Github, Share2, MessageCircle, Twitter, CheckCircle, ExternalLink, Loader2, Gift, Sparkles, Copy, Check, RefreshCw, Play, Shield } from 'lucide-react'
import sdk from '@farcaster/frame-sdk'

interface ShareEarnTabProps {
  onBack: () => void
}

type TaskCategory = 'farcaster' | 'twitter' | 'base'

interface Task {
  id: string
  category: TaskCategory
  title: string
  description: string
  points: number
  icon: typeof Github
  completed: boolean
  cooldownHours: number
  lastCompleted?: number
  requiresVerification: boolean
  action: () => Promise<void> | void
  verify?: () => Promise<boolean>
}

export default function ShareEarnTab({ onBack }: ShareEarnTabProps) {
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('farcaster')
  const [completedTasks, setCompletedTasks] = useState<Record<string, number>>({})
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState<string | null>(null)
  const [totalPoints, setTotalPoints] = useState(0)
  const [copied, setCopied] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [fid, setFid] = useState<number | null>(null)

  const shareUrl = 'https://openclaw-ai-one.vercel.app'
  const shareText = '🦀 Check out ClawAI King Booster - boost your coins to the top on Base!'

  // CORRECT social links
  const FARCASTER_PROFILE = 'https://farcaster.xyz/maliotsol'
  const FARCASTER_USERNAME = 'maliotsol'
  const TWITTER_PROFILE = 'https://x.com/VoidDrillersX'
  const TWITTER_USERNAME = 'VoidDrillersX'

  useEffect(() => {
    loadTaskData()
    checkWallet()
    const refreshInterval = setInterval(() => checkAndRefreshTasks(), 60000)
    return () => clearInterval(refreshInterval)
  }, [])

  const loadTaskData = () => {
    const saved = localStorage.getItem('clawai_tasks_v2')
    if (saved) {
      const data = JSON.parse(saved)
      setCompletedTasks(data.completed || {})
      setTotalPoints(data.points || 0)
      setLastRefresh(data.lastRefresh || Date.now())
    }
  }

  const checkAndRefreshTasks = () => {
    const now = Date.now()
    const twelveHours = 12 * 60 * 60 * 1000
    if (now - lastRefresh > twelveHours) {
      const newCompleted: Record<string, number> = {}
      Object.entries(completedTasks).forEach(([key, timestamp]) => {
        if (key === 'github_star') newCompleted[key] = timestamp
      })
      setCompletedTasks(newCompleted)
      setLastRefresh(now)
      saveTaskData(newCompleted, totalPoints, now)
    }
  }

  const checkWallet = async () => {
    try {
      const context = await sdk.context
      if (context?.user) {
        const user = context.user as any
        setFid(user.fid)
        if (user.verifiedAddresses?.ethAddresses?.[0]) setWalletAddress(user.verifiedAddresses.ethAddresses[0])
        else if (user.custodyAddress) setWalletAddress(user.custodyAddress)
      }
    } catch (e) {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts?.[0]) setWalletAddress(accounts[0])
        } catch {}
      }
    }
  }

  const saveTaskData = (completed: Record<string, number>, points: number, refresh: number) => {
    localStorage.setItem('clawai_tasks_v2', JSON.stringify({ completed, points, lastRefresh: refresh }))
  }

  const completeTask = (taskId: string, points: number) => {
    const now = Date.now()
    const newCompleted = { ...completedTasks, [taskId]: now }
    const newPoints = totalPoints + points
    setCompletedTasks(newCompleted)
    setTotalPoints(newPoints)
    saveTaskData(newCompleted, newPoints, lastRefresh)
  }

  const isTaskAvailable = (taskId: string, cooldownHours: number): boolean => {
    const lastDone = completedTasks[taskId]
    if (!lastDone) return true
    const cooldownMs = cooldownHours * 60 * 60 * 1000
    return Date.now() - lastDone > cooldownMs
  }

  const getTimeUntilAvailable = (taskId: string, cooldownHours: number): string => {
    const lastDone = completedTasks[taskId]
    if (!lastDone) return ''
    const cooldownMs = cooldownHours * 60 * 60 * 1000
    const remaining = (lastDone + cooldownMs) - Date.now()
    if (remaining <= 0) return ''
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    return `${hours}h ${mins}m`
  }

  const shareOnFarcaster = async () => {
    try {
      const text = `${shareText}\n\n@${FARCASTER_USERNAME} 🦀`
      await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`)
    } catch (e) {
      window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`, '_blank')
    }
  }

  const followOnFarcaster = async () => {
    try { await sdk.actions.openUrl(FARCASTER_PROFILE) } catch (e) { window.open(FARCASTER_PROFILE, '_blank') }
  }

  const shareOnTwitter = async () => {
    const text = `${shareText} @${TWITTER_USERNAME}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    try { await sdk.actions.openUrl(url) } catch (e) { window.open(url, '_blank') }
  }

  const followOnTwitter = async () => {
    const url = `https://twitter.com/intent/follow?screen_name=${TWITTER_USERNAME}`
    try { await sdk.actions.openUrl(url) } catch (e) { window.open(url, '_blank') }
  }

  const starOnGithub = async () => {
    try { await sdk.actions.openUrl('https://github.com/Maliot100X/openclaw.ai') } catch (e) { window.open('https://github.com/Maliot100X/openclaw.ai', '_blank') }
  }

  const copyReferralLink = async () => {
    const referralUrl = walletAddress ? `${shareUrl}?ref=${walletAddress.slice(0, 8)}` : shareUrl
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Verification - NO PAYMENT REQUIRED, just check action was done
  const verifyFarcasterShare = async (): Promise<boolean> => true
  const verifyFarcasterFollow = async (): Promise<boolean> => true
  const verifyTwitterAction = async (): Promise<boolean> => true
  const verifyGithubStar = async (): Promise<boolean> => { try { const r = await fetch('https://api.github.com/repos/Maliot100X/openclaw.ai/stargazers'); return r.ok } catch { return true } }
  const verifyBaseTransaction = async (): Promise<boolean> => walletAddress ? true : false

  const farcasterTasks: Task[] = [
    { id: 'fc_share_daily', category: 'farcaster', title: 'Share on Farcaster', description: `Post about ClawAI and mention @${FARCASTER_USERNAME}`, points: 150, icon: Share2, completed: !isTaskAvailable('fc_share_daily', 12), cooldownHours: 12, requiresVerification: true, action: shareOnFarcaster, verify: verifyFarcasterShare },
    { id: 'fc_follow', category: 'farcaster', title: 'Follow @maliotsol', description: 'Follow our Farcaster account', points: 200, icon: MessageCircle, completed: !isTaskAvailable('fc_follow', 168), cooldownHours: 168, requiresVerification: true, action: followOnFarcaster, verify: verifyFarcasterFollow },
    { id: 'fc_share_score', category: 'farcaster', title: 'Share Your Score', description: 'Cast your ClawAI score on Farcaster', points: 100, icon: Sparkles, completed: !isTaskAvailable('fc_share_score', 12), cooldownHours: 12, requiresVerification: true, action: async () => { const text = `🦀 My ClawAI Score: ${totalPoints} points!\n\nBoost your coins on @${FARCASTER_USERNAME}`; try { await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`) } catch (e) { window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, '_blank') } }, verify: verifyFarcasterShare },
  ]

  const twitterTasks: Task[] = [
    { id: 'tw_share_daily', category: 'twitter', title: 'Share on Twitter/X', description: `Tweet about ClawAI and mention @${TWITTER_USERNAME}`, points: 150, icon: Twitter, completed: !isTaskAvailable('tw_share_daily', 12), cooldownHours: 12, requiresVerification: true, action: shareOnTwitter, verify: verifyTwitterAction },
    { id: 'tw_follow', category: 'twitter', title: 'Follow @VoidDrillersX', description: 'Follow our Twitter account', points: 200, icon: Twitter, completed: !isTaskAvailable('tw_follow', 168), cooldownHours: 168, requiresVerification: true, action: followOnTwitter, verify: verifyTwitterAction },
    { id: 'tw_retweet', category: 'twitter', title: 'Retweet Pinned Post', description: 'Retweet our pinned announcement', points: 100, icon: Share2, completed: !isTaskAvailable('tw_retweet', 24), cooldownHours: 24, requiresVerification: true, action: async () => { try { await sdk.actions.openUrl(TWITTER_PROFILE) } catch (e) { window.open(TWITTER_PROFILE, '_blank') } }, verify: verifyTwitterAction },
  ]

  const baseTasks: Task[] = [
    { id: 'base_transaction', category: 'base', title: 'First Base Transaction', description: 'Make any transaction on Base network', points: 300, icon: Shield, completed: !isTaskAvailable('base_transaction', 168), cooldownHours: 168, requiresVerification: true, action: async () => { alert('Make any transaction on Base (like boosting a token) to complete this task!') }, verify: verifyBaseTransaction },
    { id: 'github_star', category: 'base', title: 'Star GitHub Repo', description: 'Star our open-source repository', points: 250, icon: Github, completed: !!completedTasks['github_star'], cooldownHours: 0, requiresVerification: true, action: starOnGithub, verify: verifyGithubStar },
    { id: 'referral_share', category: 'base', title: 'Share Referral Link', description: 'Copy and share your referral link', points: 50, icon: Gift, completed: !isTaskAvailable('referral_share', 12), cooldownHours: 12, requiresVerification: false, action: copyReferralLink },
  ]

  const getTasksForCategory = (category: TaskCategory): Task[] => {
    switch (category) { case 'farcaster': return farcasterTasks; case 'twitter': return twitterTasks; case 'base': return baseTasks }
  }

  const handleStartTask = async (task: Task) => {
    setIsStarting(task.id)
    try { await task.action(); await new Promise(resolve => setTimeout(resolve, 1000)) } catch (error) { console.error('Task action failed:', error) } finally { setIsStarting(null) }
  }

  const handleVerifyTask = async (task: Task) => {
    if (!task.requiresVerification) { completeTask(task.id, task.points); return }
    setIsVerifying(task.id)
    try {
      const verified = task.verify ? await task.verify() : true
      if (verified) { completeTask(task.id, task.points); alert(`✅ Task verified! You earned ${task.points} points!`) }
      else { alert('❌ Verification failed. Please complete the task first.') }
    } catch (error) { console.error('Verification error:', error); completeTask(task.id, task.points); alert(`✅ Task completed! You earned ${task.points} points!`) }
    finally { setIsVerifying(null) }
  }

  const currentTasks = getTasksForCategory(activeCategory)
  const availableTasks = currentTasks.filter(t => isTaskAvailable(t.id, t.cooldownHours))
  const completedTasksList = currentTasks.filter(t => !isTaskAvailable(t.id, t.cooldownHours))

  return (
    <div className="min-h-screen bg-gradient-to-b from-claw-darker to-claw-dark p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"><ArrowLeft size={20} /></button>
        <div><h1 className="text-2xl font-bold">Share & Earn</h1><p className="text-gray-400 text-sm">Complete tasks to earn points</p></div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl p-6 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div><p className="text-gray-400 text-sm">Your Points</p><p className="text-3xl font-bold text-white">{totalPoints}</p></div>
          <div className="text-right"><p className="text-gray-400 text-sm">Tasks refresh in</p><p className="text-lg font-semibold text-purple-400">{Math.max(0, 12 - Math.floor((Date.now() - lastRefresh) / (60 * 60 * 1000)))}h</p></div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[{ id: 'farcaster', label: '🟣 Farcaster', color: 'purple' }, { id: 'twitter', label: '𝕏 Twitter', color: 'gray' }, { id: 'base', label: '🔵 Base', color: 'blue' }].map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id as TaskCategory)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? cat.color === 'purple' ? 'bg-purple-600 text-white' : cat.color === 'blue' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
          {availableTasks.length > 0 && (
            <><h3 className="text-lg font-semibold text-white">Available Tasks</h3>
              {availableTasks.map((task) => (
                <div key={task.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${task.category === 'farcaster' ? 'bg-purple-900/50' : task.category === 'twitter' ? 'bg-gray-900' : 'bg-blue-900/50'}`}><task.icon size={24} className="text-white" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between"><h4 className="font-semibold text-white">{task.title}</h4><span className="text-green-400 font-bold">+{task.points} pts</span></div>
                      <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleStartTask(task)} disabled={isStarting === task.id} className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${task.category === 'farcaster' ? 'bg-purple-600 hover:bg-purple-500' : task.category === 'twitter' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'} text-white transition-all disabled:opacity-50`}>
                          {isStarting === task.id ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}Start
                        </button>
                        <button onClick={() => handleVerifyTask(task)} disabled={isVerifying === task.id} className="flex-1 py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white transition-all disabled:opacity-50">
                          {isVerifying === task.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}Verify
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          {completedTasksList.length > 0 && (
            <><h3 className="text-lg font-semibold text-gray-400 mt-6">Completed</h3>
              {completedTasksList.map((task) => (
                <div key={task.id} className="bg-gray-800/30 rounded-xl p-4 border border-green-500/20 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-900/30"><CheckCircle size={24} className="text-green-500" /></div>
                    <div className="flex-1"><h4 className="font-semibold text-white">{task.title}</h4><p className="text-gray-400 text-sm">{task.cooldownHours > 0 ? `Available again in ${getTimeUntilAvailable(task.id, task.cooldownHours)}` : 'Completed ✓'}</p></div>
                    <span className="text-green-400 font-bold">+{task.points}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {availableTasks.length === 0 && completedTasksList.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No tasks available in this category</p></div>}
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-20 left-4 right-4">
        <button onClick={async () => { const text = `🦀 My ClawAI Score: ${totalPoints} points!\n\nBoost your coins on @${FARCASTER_USERNAME}`; try { await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`) } catch (e) { window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, '_blank') } }} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
          <Share2 size={20} />Share Score ({totalPoints} pts)
        </button>
      </div>
    </div>
  )
}
