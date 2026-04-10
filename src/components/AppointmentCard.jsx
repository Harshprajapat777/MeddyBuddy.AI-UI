import { Trash2, Calendar, MapPin, Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import StatusBadge from './StatusBadge'

export default function AppointmentCard({ appointment, onDelete }) {
  const { id, doctor, specialty, date, time, status, contact, email, location } = appointment

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
        <Calendar className="w-3.5 h-3.5 text-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans font-medium text-text-primary truncate">{doctor}</p>
        <p className="text-xs font-sans text-text-muted">{specialty}</p>
        <p className="text-xs font-sans text-text-muted mt-1">{date} · {time}</p>

        {/* Extra fields — only shown when populated from chat/vector search */}
        {location && (
          <div className="flex items-start gap-1 mt-1">
            <MapPin className="w-3 h-3 text-text-muted/60 shrink-0 mt-0.5" />
            <p className="text-[11px] font-sans text-text-muted leading-relaxed">{location}</p>
          </div>
        )}
        {contact && (
          <div className="flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-text-muted/60 shrink-0" />
            <p className="text-[11px] font-sans text-text-muted">{contact}</p>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-text-muted/60 shrink-0" />
            <p className="text-[11px] font-sans text-text-muted truncate">{email}</p>
          </div>
        )}

        <StatusBadge status={status} className="mt-1.5" />
      </div>

      <button
        onClick={() => onDelete(id)}
        className="shrink-0 p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10
                   transition-all duration-200 opacity-0 group-hover:opacity-100"
        title="Delete appointment"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
