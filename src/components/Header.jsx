import { useRef, useState, useEffect } from 'react'
import { Heart, PanelLeftClose, PanelLeftOpen, Bell, Sparkles, Plus, Calendar, Clock, Pill, X, MapPin, Phone } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

function NotificationPanel({ appointments, reminders, onClose }) {
  const total = appointments.length + reminders.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-12 right-0 w-80 bg-white border border-card-border rounded-2xl
                 shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <span className="text-sm font-sans font-semibold text-text-primary">Notifications</span>
          {total > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent
                             text-[10px] font-sans font-bold leading-none">
              {total}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-card-border/60
                     transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Bell className="w-8 h-8 text-text-muted/30" />
            <p className="text-xs font-sans text-text-muted/60">No appointments or reminders yet</p>
          </div>
        ) : (
          <>
            {/* Appointments section */}
            {appointments.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-background border-b border-card-border">
                  <p className="text-[10px] font-sans font-semibold text-text-muted uppercase tracking-widest">
                    Appointments · {appointments.length}
                  </p>
                </div>
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-card-border/60
                               hover:bg-background/60 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-medium text-text-primary truncate">{apt.doctor}</p>
                      <p className="text-[11px] font-sans text-text-muted">{apt.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-text-muted/60 shrink-0" />
                        <p className="text-[11px] font-sans text-text-muted">{apt.date} · {apt.time}</p>
                      </div>
                      {apt.location && (
                        <div className="flex items-start gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-text-muted/60 shrink-0 mt-0.5" />
                          <p className="text-[11px] font-sans text-text-muted leading-relaxed">{apt.location}</p>
                        </div>
                      )}
                      {apt.contact && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-text-muted/60 shrink-0" />
                          <p className="text-[11px] font-sans text-text-muted">{apt.contact}</p>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium
                                     bg-success/10 text-success capitalize">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Reminders section */}
            {reminders.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-background border-b border-card-border">
                  <p className="text-[10px] font-sans font-semibold text-text-muted uppercase tracking-widest">
                    Reminders · {reminders.length}
                  </p>
                </div>
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="flex items-start gap-3 px-4 py-3 border-b border-card-border/60
                               hover:bg-background/60 transition-colors last:border-b-0"
                  >
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Pill className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-medium text-text-primary truncate">{rem.medicine}</p>
                      <p className="text-[11px] font-sans text-text-muted">{rem.dosage}</p>
                      <p className="text-[11px] font-sans text-text-muted mt-0.5">
                        {Array.isArray(rem.times) ? rem.times.join(' · ') : rem.times}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium
                                     bg-success/10 text-success">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default function Header({
  isOnline, sidebarOpen, onToggleSidebar,
  notificationCount = 0, onNewChat,
  appointments = [], reminders = [],
}) {
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  return (
    <header className="shrink-0 bg-white border-b border-card-border px-5 h-16 flex items-center justify-between gap-4">

      {/* Left: sidebar toggle + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-border/60
                     transition-all duration-200"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen
            ? <PanelLeftClose className="w-5 h-5" />
            : <PanelLeftOpen  className="w-5 h-5" />
          }
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-hover rounded-xl
                          flex items-center justify-center shadow-sm shrink-0">
            <Heart className="w-[18px] h-[18px] text-white" fill="white" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-serif text-[17px] text-text-primary tracking-tight">PresGenie.AI</span>
            <span className="text-[11px] font-sans text-text-muted tracking-wide leading-none">
              Your personal health assistant
            </span>
          </div>
        </div>
      </div>

      {/* Center badge */}
      <div className="hidden sm:flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 bg-background rounded-full px-4 py-1.5 border border-card-border">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-[12px] font-sans font-medium text-text-muted">AI Health Chat</span>
        </div>
      </div>

      {/* Right: new chat + notification + status */}
      <div className="flex items-center gap-2.5">

        {/* New Chat button */}
        <button
          onClick={onNewChat}
          title="New conversation"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     border border-card-border text-text-muted text-[12px] font-sans font-medium
                     hover:border-accent/40 hover:text-accent hover:bg-accent/5
                     transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-card-border hidden sm:block" />

        {/* Notification bell + dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title="Notifications"
            className={`relative p-2 rounded-lg transition-all duration-200
                        ${notifOpen
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-muted hover:text-text-primary hover:bg-card-border/60'}`}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1
                               bg-accent text-white text-[10px] font-sans font-bold
                               rounded-full flex items-center justify-center leading-none">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <NotificationPanel
                appointments={appointments}
                reminders={reminders}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-card-border" />

        {/* Status pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                         text-[12px] font-sans font-medium transition-all duration-300 ${
                           isOnline
                             ? 'bg-success/8 border-success/20 text-success'
                             : 'bg-error/8 border-error/20 text-error'
                         }`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-success animate-pulse' : 'bg-error'}`} />
          {isOnline ? 'Connected' : 'Offline'}
        </div>

      </div>
    </header>
  )
}
