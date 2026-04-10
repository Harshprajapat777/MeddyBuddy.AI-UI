export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-card-assistant border border-card-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50 animate-typing-dot typing-dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50 animate-typing-dot typing-dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50 animate-typing-dot typing-dot-3" />
        </div>
      </div>
    </div>
  )
}
