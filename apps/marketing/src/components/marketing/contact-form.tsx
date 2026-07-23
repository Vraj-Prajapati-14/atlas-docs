'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const FIELDS = [
  { name: 'name', label: 'Your Name', type: 'text', required: true },
  { name: 'restaurant', label: 'Restaurant Name', type: 'text', required: true },
  { name: 'phone', label: 'Phone / WhatsApp Number', type: 'tel', required: true },
  { name: 'email', label: 'Email (optional)', type: 'email', required: false },
] as const

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/20 bg-success/5 px-6 py-14 text-center">
        <CheckCircle2 size={32} className="text-success" />
        <p className="text-lg font-bold text-ink">Thanks — we&apos;ve got it.</p>
        <p className="max-w-sm text-sm text-ink-500">
          Our team will reach out on WhatsApp or phone shortly to set up your demo.
        </p>
      </div>
    )
  }

  return (
    <form
      // Lead capture backend not wired yet — connect to the API before launch.
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="space-y-4"
    >
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1.5 block text-sm font-semibold text-ink">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            required={field.required}
            className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-300 focus:border-primary focus:outline-none"
          />
        </div>
      ))}

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-ink">
          How can we help? (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-300 focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Request a Callback
      </button>
    </form>
  )
}
