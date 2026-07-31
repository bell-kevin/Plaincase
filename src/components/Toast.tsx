import { Check, X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3600)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  return (
    <div className="toast" role="status">
      <span>
        <Check size={15} />
      </span>
      <p>{message}</p>
      <button onClick={onClose}>
        <X size={16} />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  )
}
