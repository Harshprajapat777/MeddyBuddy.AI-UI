import { useRef, useEffect, useState, useCallback } from 'react'
import { Send, Paperclip, Mic, MicOff, X, FileText, ChevronDown, Calendar, Bell, HeartPulse } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

const QUICK_ACTIONS = [
  { label: '📅 Book Appointment', text: 'I want to book an appointment' },
  { label: '💊 Set Reminder',     text: 'Set a medicine reminder for me' },
  { label: '❤️ Health Info',      text: 'Give me some health information' },
]

const WELCOME_CARDS = [
  {
    icon: Calendar,
    title: 'Book Appointments',
    desc: 'Schedule doctor visits by simply telling me who, when, and where.',
    prompt: 'I want to book an appointment',
  },
  {
    icon: Bell,
    title: 'Medicine Reminders',
    desc: 'Set reminders for any medication — dosage, timing, and frequency.',
    prompt: 'Set a medicine reminder for me',
  },
  {
    icon: HeartPulse,
    title: 'Health Information',
    desc: 'Ask about symptoms, conditions, wellness tips, or general health advice.',
    prompt: 'What are some tips for a healthy lifestyle?',
  },
]

function useSpeechRecognition(onResult) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)

  const toggle = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Speech recognition is not supported in this browser.')
      return
    }
    if (isRecording) {
      recognitionRef.current?.stop()
      return
    }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => onResult(e.results[0][0].transcript)
    rec.onend   = () => setIsRecording(false)
    rec.onerror = () => setIsRecording(false)
    rec.start()
    recognitionRef.current = rec
    setIsRecording(true)
  }, [isRecording, onResult])

  return { isRecording, toggle }
}

export default function ChatArea({ messages, isTyping, input, onInputChange, onSend, onFileUpload, disabled }) {
  const scrollRef   = useRef(null)
  const fileInputRef = useRef(null)
  const [attachedFile, setAttachedFile]     = useState(null)
  const [showScrollBtn, setShowScrollBtn]   = useState(false)

  // Show scroll-to-bottom button when not at bottom
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollBtn(distFromBottom > 120)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distFromBottom < 300) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isTyping])

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }

  const handleTranscript = useCallback(
    (text) => onInputChange((prev) => (prev ? prev + ' ' + text : text)),
    [onInputChange]
  )
  const { isRecording, toggle: toggleMic } = useSpeechRecognition(handleTranscript)

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const ACCEPTED_TYPES = ['application/pdf', 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword']

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file && ACCEPTED_TYPES.includes(file.type)) setAttachedFile(file)
    e.target.value = ''
  }

  function handleSend() {
    if (attachedFile) {
      onFileUpload(attachedFile, input.trim())
      setAttachedFile(null)
      onInputChange('')
    } else {
      onSend()
    }
  }

  function handleQuickAction(text) {
    onInputChange(text)
    setTimeout(onSend, 50)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">

      {/* Message thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4">

          {/* Welcome / empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6 pt-8 pb-4"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-hover rounded-2xl
                              flex items-center justify-center shadow-lg">
                <HeartPulse className="w-8 h-8 text-white" />
              </div>

              <div className="text-center">
                <h2 className="font-serif text-2xl text-text-primary mb-1">Hello! I'm PresGenie.AI</h2>
                <p className="text-sm font-sans text-text-muted max-w-sm">
                  I can help you book doctor appointments, set medicine reminders,
                  and answer your health questions.
                </p>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {WELCOME_CARDS.map(({ icon: Icon, title, desc, prompt }) => (
                  <button
                    key={title}
                    onClick={() => handleQuickAction(prompt)}
                    disabled={disabled}
                    className="text-left bg-white border border-card-border rounded-2xl p-4
                               hover:border-accent/40 hover:shadow-md hover:bg-accent/5
                               transition-all duration-200 group disabled:opacity-40"
                  >
                    <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center mb-3
                                    group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm font-sans font-semibold text-text-primary mb-1">{title}</p>
                    <p className="text-xs font-sans text-text-muted leading-relaxed">{desc}</p>
                  </button>
                ))}
              </div>

              <p className="text-xs font-sans text-text-muted/60 text-center">
                Type a message below or tap a card to get started
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToBottom}
            className="absolute bottom-36 right-6 z-10 w-9 h-9 rounded-full bg-white border border-card-border
                       shadow-lg flex items-center justify-center text-text-muted
                       hover:shadow-xl hover:text-accent transition-all duration-200"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quick-action chips */}
      <div className="shrink-0 bg-background px-4 pt-2">
        <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.text)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium
                         border border-card-border bg-white text-text-primary
                         hover:border-accent/40 hover:bg-accent/5 hover:text-accent
                         transition-all duration-200 cursor-pointer select-none
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 bg-background px-4 pt-2 pb-3">
        <div className="max-w-2xl mx-auto">

          {/* PDF attachment preview */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="mb-2 flex items-center gap-2 bg-white border border-card-border
                           rounded-xl px-3 py-2 w-fit max-w-full"
              >
                <div className="w-6 h-6 rounded-md bg-error/10 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-error" />
                </div>
                <span className="text-xs font-sans text-text-primary truncate max-w-[200px]">
                  {attachedFile.name}
                </span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="shrink-0 p-0.5 rounded text-text-muted hover:text-error transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Composer box */}
          <div className={`flex items-end gap-2 bg-white rounded-2xl border shadow-lg px-3 py-2
                           transition-all duration-200 hover:shadow-xl
                           ${isRecording ? 'border-error/40' : 'border-card-border'}`}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Attach PDF"
              className={`shrink-0 mb-1 p-2 rounded-xl transition-all duration-200
                          ${attachedFile
                            ? 'bg-error/10 text-error'
                            : 'text-text-muted hover:bg-accent/10 hover:text-accent'}
                          disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx,.doc" onChange={handleFileChange} className="hidden" />

            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Listening...' : 'Type a message...'}
              rows={1}
              disabled={disabled}
              className="flex-1 bg-transparent px-2 py-2 text-sm font-sans text-text-primary
                         placeholder:text-text-muted/50 focus:outline-none resize-none
                         disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />

            <button
              onClick={toggleMic}
              disabled={disabled}
              title={isRecording ? 'Stop recording' : 'Voice input'}
              className={`shrink-0 mb-1 p-2 rounded-xl transition-all duration-200
                          ${isRecording
                            ? 'bg-error text-white animate-pulse'
                            : 'text-text-muted hover:bg-accent/10 hover:text-accent'}
                          disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={handleSend}
              disabled={disabled || (!input.trim() && !attachedFile)}
              className="shrink-0 mb-1 p-2 rounded-xl bg-accent text-white
                         hover:bg-accent-hover transition-all duration-200 active:scale-95
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Medical disclaimer */}
          <p className="text-center text-[11px] font-sans text-text-muted/50 mt-2 leading-relaxed">
            HealthBot is not a substitute for professional medical advice. Always consult a qualified doctor.
          </p>
        </div>
      </div>
    </div>
  )
}
