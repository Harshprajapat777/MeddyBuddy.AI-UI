import { Lightbulb } from 'lucide-react'

export default function HealthTipCard({ tip }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-3 flex items-start gap-2.5">
      <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
      <p className="text-xs font-sans text-text-muted leading-relaxed">{tip}</p>
    </div>
  )
}
