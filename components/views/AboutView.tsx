'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Info, Heart, ExternalLink, Github, Twitter } from 'lucide-react'

interface AboutViewProps {
  onBack: () => void
}

export default function AboutView({ onBack }: AboutViewProps) {
  return (
    <div className="p-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Info className="text-claw-primary" size={24} />
          <h2 className="text-xl font-bold">About</h2>
        </div>
      </div>

      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-claw-primary to-claw-secondary rounded-3xl flex items-center justify-center text-5xl">
          🦀
        </div>
        <h1 className="text-3xl font-bold gradient-text">ClawAI King</h1>
        <p className="text-gray-400 mt-2">Boost your coins to the top!</p>
        <p className="text-sm text-gray-500 mt-1">Version 1.0.0</p>
      </motion.div>

      {/* Description */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">What is ClawAI King?</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          ClawAI King Booster is a Farcaster Mini App that helps you discover and promote
          tokens on Base and Zora chains. Boost your favorite coins to the ClawKing Spotlight
          and reach thousands of users!
        </p>
      </div>

      {/* Features */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Features</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>🚀 <strong>Coin Boosting</strong> – Promote tokens to the spotlight</li>
          <li>🤖 <strong>AI Assistant</strong> – Get help from OpenClaw AI</li>
          <li>🏆 <strong>Leaderboards</strong> – Compete for top rankings</li>
          <li>📊 <strong>Market Intel</strong> – Real-time token data</li>
          <li>🔗 <strong>Multi-Chain</strong> – Base, Zora, and more</li>
        </ul>
      </div>

      {/* Tech Stack */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Built With</h3>
        <div className="flex flex-wrap gap-2">
          {['Next.js', 'Farcaster', 'Base', 'Zora', 'Supabase', 'Tailwind', 'Framer Motion'].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-white/10 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="space-y-3 mb-6">
        <a
          href="https://github.com/Maliot100X/openclaw.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="card-hover flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Github size={20} />
            <span>View on GitHub</span>
          </div>
          <ExternalLink size={16} className="text-gray-400" />
        </a>
        <a
          href="https://warpcast.com/maliotsol"
          target="_blank"
          rel="noopener noreferrer"
          className="card-hover flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span>🟣</span>
            <span>Follow on Farcaster</span>
          </div>
          <ExternalLink size={16} className="text-gray-400" />
        </a>
        <a
          href="https://openclaw.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="card-hover flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span>🦀</span>
            <span>OpenClaw.ai</span>
          </div>
          <ExternalLink size={16} className="text-gray-400" />
        </a>
      </div>

      {/* Credits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center pt-6 border-t border-white/10"
      >
        <p className="text-gray-400 flex items-center justify-center gap-2">
          Made With <Heart size={16} className="text-red-500 fill-red-500" /> From
        </p>
        <p className="text-xl font-bold gradient-text mt-1">Clawn.AI</p>
        <p className="text-gray-500 text-sm mt-1">(Base / Farcaster)</p>
        <a
          href="https://warpcast.com/maliotsol"
          target="_blank"
          rel="noopener noreferrer"
          className="text-claw-primary hover:underline mt-2 inline-block"
        >
          By @maliotsol
        </a>
      </motion.div>
    </div>
  )
}
