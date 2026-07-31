import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

interface ModalProps {
  open: boolean
  title: string
  eyebrow?: string
  children: React.ReactNode
  wide?: boolean
  onClose: () => void
}

export function Modal({ open, title, eyebrow, children, wide = false, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('cancel', handleClose)
    return () => dialog.removeEventListener('cancel', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${wide ? 'modal--wide' : ''}`}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="modal__surface">
        <div className="modal__header">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
