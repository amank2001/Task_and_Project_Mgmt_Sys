const labels = {
  TODO:        'Todo',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
  OVERDUE:     'Overdue',
}

export default function StatusBadge({ status }) {
  const cls = `badge badge-${status?.toLowerCase()}`
  return <span className={cls}>{labels[status] ?? status}</span>
}
