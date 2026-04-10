import { useState, useEffect } from 'react'
import { ChevronDown, CalendarX, BellOff, Calendar, Bell, Lightbulb, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AppointmentCard from './AppointmentCard'
import ReminderCard from './ReminderCard'
import HealthTipCard from './HealthTipCard'

function SkeletonCard() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-6 h-6 rounded-md bg-text-muted/20 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-text-muted/20 rounded-full w-3/4" />
          <div className="h-2.5 bg-text-muted/20 rounded-full w-1/2" />
          <div className="h-2.5 bg-text-muted/20 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  )
}

function SidebarSection({ title, icon: Icon, children, defaultOpen = true, count = 0 }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Auto-open section whenever a new item is added
  useEffect(() => {
    if (count > 0) setIsOpen(true)
  }, [count])

  return (
    <div className="border-b border-card-border">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3
                   hover:bg-white/60 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-accent" />}
          <span className="text-xs font-sans font-semibold text-text-primary uppercase tracking-wider">
            {title}
          </span>
          {count > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent
                             text-[10px] font-sans font-semibold leading-none">
              {count}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Sidebar({
  isOpen,
  isLoading = false,
  appointments,
  reminders,
  healthTips,
  onDeleteAppointment,
  onDeleteReminder,
  onClose,
  onRefresh,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark/30 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -288, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed md:relative top-16 md:top-auto left-0 bottom-0 md:bottom-auto
                       w-72 shrink-0 z-40 md:z-auto
                       bg-background border-r border-card-border flex flex-col overflow-hidden"
          >
            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
              <p className="text-[11px] font-sans font-semibold text-text-muted uppercase tracking-widest">
                My Health
              </p>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh data"
                className="p-1 rounded-md text-text-muted hover:text-accent hover:bg-accent/10
                           transition-all duration-200 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* Appointments */}
              <SidebarSection title="Appointments" icon={Calendar} count={appointments.length}>
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {appointments.length === 0 ? (
                      <motion.div
                        key="apt-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-5 flex flex-col items-center gap-2 text-center"
                      >
                        <CalendarX className="w-7 h-7 text-text-muted/30" />
                        <p className="text-xs font-sans text-text-muted/70">No appointments yet</p>
                      </motion.div>
                    ) : (
                      appointments.map((apt) => (
                        <AppointmentCard key={apt.id} appointment={apt} onDelete={onDeleteAppointment} />
                      ))
                    )}
                  </AnimatePresence>
                )}
              </SidebarSection>

              {/* Reminders */}
              <SidebarSection title="Reminders" icon={Bell} count={reminders.length}>
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {reminders.length === 0 ? (
                      <motion.div
                        key="rem-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-5 flex flex-col items-center gap-2 text-center"
                      >
                        <BellOff className="w-7 h-7 text-text-muted/30" />
                        <p className="text-xs font-sans text-text-muted/70">No reminders yet</p>
                      </motion.div>
                    ) : (
                      reminders.map((rem) => (
                        <ReminderCard key={rem.id} reminder={rem} onDelete={onDeleteReminder} />
                      ))
                    )}
                  </AnimatePresence>
                )}
              </SidebarSection>

              {/* Health Tips */}
              {!isLoading && healthTips.length > 0 && (
                <SidebarSection title="Health Tips" icon={Lightbulb} defaultOpen={false}>
                  {healthTips.map((tip, i) => (
                    <HealthTipCard key={i} tip={tip.tip ?? tip} />
                  ))}
                </SidebarSection>
              )}

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
