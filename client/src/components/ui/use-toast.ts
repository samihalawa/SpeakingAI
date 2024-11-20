import { useState, useCallback } from 'react'
interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastState) => {
    setToast({ message, type, duration })
    setTimeout(() => setToast(null), duration)
  }, [])
  return {
    toast,
    showToast
  }
}
