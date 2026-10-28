import { Link } from 'react-router'
import { markRead, removeNotification, timeAgo } from '../../lib/notifications.js'

// One notification, in the bell and on the notifications page. The title is the link when there is one.
export default function NotificationItem({ item, onNavigate, canDelete = false }) {
  const body = (
    <>
      <span className="flex items-center gap-2">
        {!item.read && <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-(--color-page-button)" />}
        <span className={`text-base leading-7 ${item.read ? 'font-normal' : 'font-bold'}`}>
          {item.title}
          {!item.read && <span className="sr-only"> (غير مقروء)</span>}
        </span>
      </span>
      <span className="block pt-0.5 text-[15px] leading-6 text-(color:--color-page-muted)">{item.body}</span>
      <span className="block pt-1 text-xs leading-5 text-(color:--color-page-muted)">{timeAgo(item.created_at)}</span>
    </>
  )
  const rowClass = 'block min-w-0 flex-1 rounded-xl p-3 text-start outline-(--color-page-primary) hover:bg-(--color-page-card)'

  return (
    <li className="flex items-start gap-1 border-b border-(--color-page-border) last:border-b-0">
      {item.link ? (
        <Link
          to={item.link}
          onClick={() => {
            markRead(item)
            onNavigate?.()
          }}
          className={rowClass}
        >
          {body}
        </Link>
      ) : (
        <button type="button" onClick={() => markRead(item)} className={`${rowClass} cursor-pointer`}>
          {body}
        </button>
      )}
      {canDelete && item.source === 'notification' && (
        <button
          type="button"
          onClick={() => removeNotification(item)}
          className="mt-3 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-(color:--color-page-muted) outline-(--color-page-primary) hover:bg-(--color-page-card)"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
          </svg>
          <span className="sr-only">حذف الإشعار: {item.title}</span>
        </button>
      )}
    </li>
  )
}
