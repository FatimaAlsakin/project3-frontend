import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getLive } from '../services/liveService'

// how often to check for teammates' changes (chat, board and notes) in ms
const REFRESH_EVERY = 3000

const LiveCaseContext = createContext(null)

// { data, error, track } from the nearest <LiveCaseProvider>, or null if there is none
export function useLiveCase() {
  return useContext(LiveCaseContext)
}

// Asks the server for the chat, board and notes of this case in ONE request,
// every few seconds, and shares the answer with everything inside it.
export function LiveCaseProvider({ cId, children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // goes up when a save starts and when it finishes, so a refresh that
  // started before the save can't put the old data back on screen
  const editCount = useRef(0)

  useEffect(() => {
    let cancelled = false
    setData(null)

    async function refresh() {
      const startedAt = editCount.current
      try {
        const latest = await getLive(cId)
        if (cancelled || startedAt !== editCount.current) return
        setData(latest)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Couldn't load the latest changes.")
      }
    }

    refresh()
    const timer = setInterval(refresh, REFRESH_EVERY)
    return () => { cancelled = true; clearInterval(timer) }
  }, [cId])

  // wrap every save in this: track(() => saveSomething())
  async function track(save) {
    editCount.current++
    try {
      return await save()
    } finally {
      editCount.current++
    }
  }

  return (
    <LiveCaseContext.Provider value={{ data, error, track }}>
      {children}
    </LiveCaseContext.Provider>
  )
}
