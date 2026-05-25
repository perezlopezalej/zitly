'use client'

import { useState } from 'react'

const inputClass =
  'w-full border border-foreground/15 rounded-lg px-4 py-3 text-base text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors'

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setTimeout(() => {
      setPending(false)
      setSent(true)
    }, 700)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start py-8">
        <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mb-6 text-primary text-xl">
          ✓
        </div>
        <h2 className="font-display text-3xl text-foreground mb-3">Mensaje enviado.</h2>
        <p className="text-muted-foreground">Te responderemos en menos de 24 horas.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1.5">
          Nombre <span className="text-primary">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          placeholder="Tu nombre"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1.5">
          Email <span className="text-primary">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1.5">
          Mensaje <span className="text-primary">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder="¿En qué podemos ayudarte?"
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-12 inline-flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-60"
      >
        {pending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
