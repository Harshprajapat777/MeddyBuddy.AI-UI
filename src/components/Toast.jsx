import { AnimatePresence, motion } from 'framer-motion'

export default function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-3 bg-white border border-card-border
                       rounded-xl px-4 py-3 shadow-lg"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                toast.type === 'error' ? 'bg-error' : 'bg-success'
              }`}
            />
            <span className="text-sm font-sans text-text-primary">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
