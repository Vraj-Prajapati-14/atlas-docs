'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <form
      // Email capture backend not wired yet — swap onSubmit for a real endpoint before launch.
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="flex items-center gap-2"
    >
      <input
        type="email"
        required
        placeholder="Enter your email"
        disabled={submitted}
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-ink-400 focus:border-primary focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={submitted}
        aria-label="Subscribe"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-600 disabled:bg-success"
      >
        {submitted ? <Check size={16} /> : <ArrowRight size={16} />}
      </button>
    </form>
  )
}
