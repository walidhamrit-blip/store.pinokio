// Where the store can be reached.
//
// The number lives here rather than inline in a component so it can be swapped
// for the shop's real line in one place. `test` marks a number that is only
// there while the WhatsApp flow is being validated.
export const WHATSAPP = {
  /** Digits only, international format, no plus sign — what wa.me expects. */
  number: '218913442640',
  /** How the number is shown to visitors. */
  display: '+218 91 344 2640',
  /** Set to false once the shop's own number is in place. */
  test: true,
} as const

/** A wa.me link, optionally prefilled with the first message of the chat. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP.number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
