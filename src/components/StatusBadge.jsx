const variants = {
  confirmed: 'bg-success/10 text-success',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-error/10 text-error',
  draft:     'bg-text-muted/10 text-text-muted',
  published: 'bg-success/10 text-success',
  archived:  'bg-text-muted/10 text-text-muted',
}

export default function StatusBadge({ status, className = '' }) {
  const key = status?.toLowerCase() ?? 'draft'
  const classes = variants[key] ?? variants.draft

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium capitalize ${classes} ${className}`}
    >
      {status}
    </span>
  )
}
