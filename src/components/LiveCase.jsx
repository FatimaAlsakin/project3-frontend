import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getLive } from '../services/liveService'
import { socket } from '../socket/socket'

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

    refresh() // load once when the page opens; live changes come from the socket below

    // refresh every few seconds — turned off for now to test the socket on its own
    // const timer = setInterval(refresh, REFRESH_EVERY)
    // return () => { cancelled = true; clearInterval(timer) }
    return () => { cancelled = true }
  }, [cId])

  // teammates' notes arrive instantly over the socket (the refresh above stays as a backup)
  useEffect(() => {
    // the server only accepts sockets that send the login token
    socket.auth = { token: localStorage.getItem('token') }
    if (!socket.connected) socket.connect()

    const join = () => socket.emit('joinCase', { caseId: cId })
    join()
    socket.on('connect', join) // join again after a reconnect

    // change the notes list, keeping the rest of data as it is
    const changeNotes = (change) =>
      setData(prev => prev ? { ...prev, notes: change(prev.notes || []) } : prev)

    const onCreated = (note) =>
      changeNotes(notes => notes.some(n => n._id === note._id) ? notes : [...notes, note])
    const onUpdated = (note) =>
      changeNotes(notes => notes.map(n => n._id === note._id ? note : n))
    const onDeleted = ({ _id }) =>
      changeNotes(notes => notes.filter(n => n._id !== _id))

    // team chat
    const onMessage = (message) =>
      setData(prev => {
        if (!prev) return prev
        const messages = prev.messages || []
        if (messages.some(m => m._id === message._id)) return prev
        return { ...prev, messages: [...messages, message] }
      })

    // the board: where things sit and the strings between them
    const changeBoard = (change) =>
      setData(prev => prev ? { ...prev, board: change(prev.board || { positions: {}, strings: [] }) } : prev)
    // a string from a to b is the same string as one from b to a
    const sameString = (s, { a, b }) => (s.a === a && s.b === b) || (s.a === b && s.b === a)

    const onPosition = ({ itemId, x, y }) =>
      changeBoard(board => ({ ...board, positions: { ...board.positions, [itemId]: { x, y } } }))
    const onStringAdded = (string) =>
      changeBoard(board => board.strings.some(s => sameString(s, string))
        ? board
        : { ...board, strings: [...board.strings, string] })
    const onStringRemoved = (string) =>
      changeBoard(board => ({ ...board, strings: board.strings.filter(s => !sameString(s, string)) }))
    const onStringsCleared = () =>
      changeBoard(board => ({ ...board, strings: [] }))

    const listeners = {
      'note:created': onCreated,
      'note:updated': onUpdated,
      'note:deleted': onDeleted,
      'chat:message': onMessage,
      'board:position': onPosition,
      'board:stringAdded': onStringAdded,
      'board:stringRemoved': onStringRemoved,
      'board:stringsCleared': onStringsCleared,
    }
    for (const [event, listener] of Object.entries(listeners)) socket.on(event, listener)

    return () => {
      socket.emit('leaveCase', { caseId: cId })
      socket.off('connect', join)
      for (const [event, listener] of Object.entries(listeners)) socket.off(event, listener)
    }
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
