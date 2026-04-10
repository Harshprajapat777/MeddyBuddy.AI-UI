import { Trash2, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ReminderCard({ reminder, onDelete }) {
  const { id, medicine, dosage, times, active } = reminder
  // times is string[] from API e.g. ["8:00 AM", "8:00 PM"]
  const timesDisplay = Array.isArray(times) ? times.join(' · ') : times

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group bg-card border border-card-border rounded-xl p-3 flex items-start gap-3
                 hover:border-accent/30 hover:shadow-sm transition-all duration-200"
    >
      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
        <Bell className="w-3.5 h-3.5 text-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans font-medium text-text-primary truncate">{medicine}</p>
        <p className="text-xs font-sans text-text-muted">{dosage}</p>
        <p className="text-xs font-sans text-text-muted mt-1">{timesDisplay}</p>
      </div>

      <button
        onClick={() => onDelete(id)}
        className="shrink-0 p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10
                   transition-all duration-200 opacity-0 group-hover:opacity-100"
        title="Delete reminder"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
