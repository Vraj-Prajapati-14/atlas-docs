import { config } from '../config/index.js'

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/** Normalize Indian phone to E.164 without leading + for Meta API */
function normalizePhone(phone: string): string {
  if (phone.startsWith('+')) return phone.slice(1)
  if (phone.startsWith('91') && phone.length === 12) return phone
  return `91${phone}`
}

/**
 * Send a plain-text WhatsApp message via Meta Cloud API.
 * Falls back to console.log when credentials are not set (dev mode).
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<SendResult> {
  if (!config.WHATSAPP_ACCESS_TOKEN || !config.WHATSAPP_PHONE_NUMBER_ID) {
    // eslint-disable-next-line no-console
    console.log(`[WhatsApp dev] To: ${to}\n${body}`)
    return { success: true, messageId: 'dev-mode' }
  }

  const normalized = normalizePhone(to)

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalized,
          type: 'text',
          text: { body },
        }),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: err }
    }

    const data = (await res.json()) as { messages?: Array<{ id: string }> }
    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
