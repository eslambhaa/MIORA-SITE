import { Link } from 'react-router'

export default function ChatButton() {
  return (
    <Link
      to="/assistant"
      className="fixed bottom-6 left-6 z-40 inline-flex min-h-[52px] min-w-[52px] items-center justify-center gap-[9px] rounded-full bg-(--color-page-button) px-[17px] text-base leading-7 font-bold text-white shadow-(--shadow-home-chat) outline-(--color-page-primary) transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none"
    >
      <img src="/icons/home/chat.svg" alt="" width="24" height="24" />
      <span className="max-sm:sr-only">تحدّث معنا</span>
    </Link>
  )
}
