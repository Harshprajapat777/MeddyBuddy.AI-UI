import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const bubbleVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Markdown component overrides – styled to fit inside the bubble
const mdComponents = {
  p:      ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em:     ({ children }) => <em className="italic">{children}</em>,
  ul:     ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
  ol:     ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
  li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
  code:   ({ children }) => (
    <code className="px-1 py-0.5 rounded text-[12px] font-mono bg-black/10">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-current/30 pl-3 italic opacity-80 mb-1">{children}</blockquote>
  ),
  h1: ({ children }) => <p className="font-serif font-semibold text-base mb-1">{children}</p>,
  h2: ({ children }) => <p className="font-serif font-semibold mb-1">{children}</p>,
  h3: ({ children }) => <p className="font-semibold mb-0.5">{children}</p>,
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[80%]">
        <div
          className={
            isUser
              ? 'bg-gradient-to-br from-accent to-accent-hover text-white rounded-2xl rounded-br-md px-4 py-3 text-sm font-sans shadow-md'
              : 'bg-card-assistant border border-card-border rounded-2xl rounded-bl-md px-4 py-3 text-sm font-sans text-text-primary shadow-sm'
          }
        >
          {isUser ? (
            <p className="leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <p className={`text-xs font-sans text-text-muted/60 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  )
}
