import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Draggable from 'react-draggable'
import TextareaAutosize from 'react-textarea-autosize'
import { createNotes, updateNoteById, deleteNoteById } from '../services/noteService'
import { useLiveCase } from './LiveCase'

const COLORS = ['#fff475', '#ffb3c1', '#a7f3d0', '#bae6fd', '#fdba74', '#d8b4fe']

function colorFor(userId = '') {
  let hash = 0
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) % 1000
  return COLORS[hash % COLORS.length]
}

const isDraft = (note) => note._id.startsWith('draft-')

// each new note is shifted a little so several new notes don't hide each other
let newNoteCount = 0
const STAGGER = 24

// offset that moves a note from its place in the notes row to the middle of
// the part of the board that is visible on screen (kept inside the board)
function centerOffset(noteEl) {
  const board = noteEl.closest('.board')
  if (!board) return { x: 0, y: 0 }
  const note = noteEl.getBoundingClientRect()
  const area = board.getBoundingClientRect()

  // visible part of the board; if the board is scrolled out of view use the whole board
  const top = Math.max(area.top, 0)
  const bottom = Math.min(area.bottom, window.innerHeight)
  const left = Math.max(area.left, 0)
  const right = Math.min(area.right, window.innerWidth)
  const visible = bottom > top && right > left
  const centerX = visible ? (left + right) / 2 : (area.left + area.right) / 2
  const centerY = visible ? (top + bottom) / 2 : (area.top + area.bottom) / 2

  const shift = (newNoteCount++ % 5) * STAGGER
  const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))
  const targetLeft = clamp(centerX - note.width / 2 + shift, area.left, area.right - note.width)
  const targetTop = clamp(centerY - note.height / 2 + shift, area.top, area.bottom - note.height)

  return { x: Math.round(targetLeft - note.left), y: Math.round(targetTop - note.top) }
}

export function useBoardNotes(caseId, user, board) {
  const [notes, setNotes] = useState([])

  // the notes part of the shared refresh (see LiveCase.jsx)
  const live = useLiveCase()
  const latest = user ? live?.data?.notes : null
  const track = live ? live.track : (save) => save()

  useEffect(() => {
    if (!latest) return
    // keep notes this user is still writing (not saved yet)
    setNotes(prev => [...latest, ...prev.filter(isDraft)])
  }, [latest])

  function addNote() {
    const draft = { _id: `draft-${Date.now()}`, content: '', userId: { _id: user._id, username: user.username } }
    setNotes(prev => [...prev, draft])
  }

  function saveNote(note, content) {
    return track(async () => {
      if (isDraft(note)) {
        const created = await createNotes(caseId, { content })
        created.userId = { _id: user._id, username: user.username }
        setNotes(prev => prev.map(n => n._id === note._id ? created : n))
        board.renameItem(note._id, created._id)
      } else {
        await updateNoteById(note._id, { content })
        setNotes(prev => prev.map(n => n._id === note._id ? { ...n, content } : n))
      }
    })
  }

  function removeNote(note) {
    return track(async () => {
      if (!isDraft(note)) await deleteNoteById(note._id)
      setNotes(prev => prev.filter(n => n._id !== note._id))
      board.forgetItem(note._id)
    })
  }

  return { notes, addNote, saveNote, removeNote }
}

export function StickyNote({ note, user, position, onSave, onRemove, onMove, onFront, connect = {} }) {
  const noteRef = useRef(null)
  const textRef = useRef(null)
  const [pos, setPos] = useState(position || { x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const justDragged = useRef(false)
  const [text, setText] = useState(note.content)
  const isMine = note.userId?._id === user._id
  const connectMode = Boolean(connect.stringMode) && !isDraft(note)

  useEffect(() => {
    if (position) setPos(position)
  }, [position?.x, position?.y])

  useEffect(() => {
    if (document.activeElement !== textRef.current) setText(note.content)
  }, [note.content])

  // a new note opens in the middle of what you can see on the board, ready to type
  useLayoutEffect(() => {
    if (!isDraft(note) || position) return
    const start = centerOffset(noteRef.current)
    setPos(start)
    onMove(note._id, start)
    onFront(noteRef)
    textRef.current?.focus({ preventScroll: true })
  }, [])

  function handleDrag(e, data) {
    setPos({ x: data.x, y: data.y })
    connect.onDrag?.()
  }

  function handleStart(e, data) {
    startPos.current = { x: data.x, y: data.y }
    onFront(noteRef)
  }

  function handleStop(e, data) {
    const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
    justDragged.current = moved >= 5
    setPos({ x: data.x, y: data.y })
    onMove(note._id, { x: data.x, y: data.y })
  }

  // in connect mode a click on the note starts or ends a string (but not right after a drag)
  function handleClick(e) {
    if (justDragged.current) { justDragged.current = false; return }
    if (!connectMode || e.target.closest('.sticky-note-delete')) return
    connect.onClick()
  }

  function handleBlur() {
    const trimmed = text.trim()
    if (!trimmed) {
      if (isDraft(note)) onRemove(note)
      else setText(note.content)
      return
    }
    if (trimmed !== note.content) onSave(note, trimmed)
  }

  return (
    <Draggable
      nodeRef={noteRef}
      handle='.sticky-note-header'
      bounds='.board'
      position={pos}
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div
        ref={noteRef}
        id={isDraft(note) ? undefined : connect.domId}
        className={`sticky-note ${connectMode ? connect.stringClass : ''}`}
        style={{ '--note-color': colorFor(note.userId?._id) }}
        onClick={handleClick}
      >
        <div className='sticky-note-header'>
          <span className='sticky-note-author'>{isMine ? 'You' : note.userId?.username}</span>
          {isMine && (
            <button className='sticky-note-delete' onClick={() => onRemove(note)} aria-label='Delete note'>✕</button>
          )}
        </div>
        <TextareaAutosize
          className='sticky-note-text'
          value={text}
          readOnly={!isMine || connectMode}
          ref={textRef}
          placeholder={isMine ? 'Write a note...' : ''}
          minRows={3}
          onChange={(e) => setText(e.target.value)}
          onBlur={isMine ? handleBlur : undefined}
        />
      </div>
    </Draggable>
  )
}
