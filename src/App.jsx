import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Toast from './components/Toast'

function getOrCreateSessionId() {
  let id = localStorage.getItem('healthbot_session_id')
  if (!id) {
    id = uuidv4()
    localStorage.setItem('healthbot_session_id', id)
  }
  return id
}

const sessionId = getOrCreateSessionId()

export default function App() {
  const [isOnline, setIsOnline]         = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [isLoading, setIsLoading]       = useState(true)
  const [appointments, setAppointments] = useState([])
  const [reminders, setReminders]       = useState([])
  const [healthTips, setHealthTips]     = useState([])
  const [messages, setMessages]         = useState([])
  const [input, setInput]               = useState('')
  const [isTyping, setIsTyping]         = useState(false)
  const [toasts, setToasts]             = useState([])

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'success') => {
    const id = uuidv4()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  // ── Health check (polls every 30s) ───────────────────────────────────────
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health')
        setIsOnline(res.ok)
      } catch {
        setIsOnline(false)
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30_000)
    return () => clearInterval(interval)
  }, [])

  // ── Initial data load + manual refresh ──────────────────────────────────
  const loadSidebarData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [aptRes, remRes, tipRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/reminders'),
        fetch('/api/health-tips'),
      ])
      console.log('[PresGenie] appointments status:', aptRes.status)
      console.log('[PresGenie] reminders status:', remRes.status)
      if (aptRes.ok) {
        const apts = await aptRes.json()
        console.log('[PresGenie] appointments loaded:', apts)
        setAppointments(apts)
      }
      if (remRes.ok) setReminders(await remRes.json())
      if (tipRes.ok) setHealthTips(await tipRes.json())
    } catch (err) {
      console.error('[PresGenie] sidebar load failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadSidebarData() }, [])

  // ── Refresh appointments (used after cancel_appointment intent) ──────────
  const refreshAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) setAppointments(await res.json())
    } catch {}
  }, [])

  // ── Delete appointment (optimistic) ─────────────────────────────────────
  async function handleDeleteAppointment(id) {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    } catch {}
  }

  // ── Delete reminder (optimistic) ─────────────────────────────────────────
  async function handleDeleteReminder(id) {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    try {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
    } catch {}
  }

  // ── Report upload ────────────────────────────────────────────────────────
  async function handleFileUpload(file, extraText) {
    // Show user message with file name
    const userContent = extraText
      ? `${extraText}\n\n📄 **${file.name}**`
      : `📄 **${file.name}**\nPlease analyse this report.`
    const userMsg = { id: uuidv4(), role: 'user', content: userContent, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/report/analyze', { method: 'POST', body: formData })

      if (res.status === 413) throw new Error('File too large. Max size is 5 MB.')
      if (res.status === 415) throw new Error('Unsupported file type. Use .pdf, .txt, .docx or .doc')
      if (res.status === 422) throw new Error('Could not extract any text from the file.')
      if (!res.ok) throw new Error('Report analysis failed. Please try again.')

      const { description, follow_ups, diet, precautions } = await res.json()

      // Format as markdown for the bot bubble
      const formatted = [
        `**📋 Report Analysis**\n`,
        description,
        `\n**Follow-up Steps**`,
        follow_ups.map((s) => `- ${s}`).join('\n'),
        `\n**Diet Recommendations**`,
        diet.map((s) => `- ${s}`).join('\n'),
        `\n**Precautions**`,
        precautions.map((s) => `- ${s}`).join('\n'),
      ].join('\n')

      const botMsg = { id: uuidv4(), role: 'assistant', content: formatted, timestamp: new Date() }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      addToast(err.message, 'error')
      const errMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry — ${err.message}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsTyping(false)
    }
  }

  // ── Send message ─────────────────────────────────────────────────────────
  async function handleSend() {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg = { id: uuidv4(), role: 'user', content: text, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      })

      if (!res.ok) throw new Error('API error')

      const json = await res.json()
      console.log('[PresGenie] chat response:', json)
      const { reply, intent, data } = json

      // Intent-driven side effects
      if (intent === 'book_appointment' && data) {
        setAppointments((prev) => [data, ...prev])
        setSidebarOpen(true)
        addToast('Appointment booked — check your sidebar')
      } else if (intent === 'set_reminder' && data) {
        setReminders((prev) => [data, ...prev])
        setSidebarOpen(true)
        addToast('Reminder set — check your sidebar')
      } else if (intent === 'cancel_appointment') {
        await refreshAppointments()
      }

      const botMsg = { id: uuidv4(), role: 'assistant', content: reply, timestamp: new Date() }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      const errMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header
        isOnline={isOnline}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        notificationCount={appointments.length + reminders.length}
        onNewChat={() => setMessages([])}
        appointments={appointments}
        reminders={reminders}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          isLoading={isLoading}
          appointments={appointments}
          reminders={reminders}
          healthTips={healthTips}
          onDeleteAppointment={handleDeleteAppointment}
          onDeleteReminder={handleDeleteReminder}
          onClose={() => setSidebarOpen(false)}
          onRefresh={loadSidebarData}
        />

        <ChatArea
          messages={messages}
          isTyping={isTyping}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          disabled={isTyping}
        />
      </div>

      <Toast toasts={toasts} />
    </div>
  )
}
