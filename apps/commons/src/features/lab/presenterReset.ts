import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const DOCK_FLAG = 'pdf-lab.dock-seen'

export function clearDemoStorage() {
  try {
    sessionStorage.removeItem(DOCK_FLAG)
  } catch { /* Optional browser storage. */ }
  try {
    const key = 'commons.drafts.v1'
    const raw = localStorage.getItem(key)
    if (!raw) return
    const drafts: unknown = JSON.parse(raw)
    if (!Array.isArray(drafts)) return
    localStorage.setItem(key, JSON.stringify(drafts.filter((draft) =>
      draft?.problemId !== 'usb-c-no-data',
    )))
  } catch { /* Preserve unreadable drafts; never clear unrelated storage. */ }
}

export function usePresenterReset() {
  const navigate = useNavigate()
  return useCallback(() => {
    clearDemoStorage()
    return navigate({ to: '/lab', search: {}, state: { demoReset: true }, replace: true })
  }, [navigate])
}
