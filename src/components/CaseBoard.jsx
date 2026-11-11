import { useState, useEffect, useRef, createContext, useContext } from 'react'
import Draggable from 'react-draggable'
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MainContainer, MessageList, Message, MessageSeparator, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { useBoardNotes, StickyNote } from './BoardNotes'
import { useSharedBoard } from './useSharedBoard'
import '../styles/Board.css'

let topZ = 1
function bringToFront(ref) {
  topZ += 1
  if (ref.current) ref.current.style.zIndex = topZ
}

const BoardContext = createContext(null)

const cardDomId = (id) => `card-${id}`

const START = { x: 0, y: 0 }

function useBoardCard(id) {
  const board = useContext(BoardContext)
  const updateStrings = useXarrow()
  return {
    domId: cardDomId(id),
    onDrag: updateStrings,
    interactive: board.interactive,
    handleClick: () => board.cardClick(id),
    stringClass: board.stringMode ? `string-mode ${board.pending === id ? 'string-pending' : ''}` : '',
    position: board.positions[id] || START,
    onMoved: (pos) => board.moveItem(id, pos),
  }
}

function useClickNotDrag(cardRef, onClick, onMoved) {
  const startPos = useRef({ x: 0, y: 0 })
  return {
    onStart: (e, data) => { startPos.current = { x: data.x, y: data.y }; bringToFront(cardRef) },
    onStop: (e, data) => {
      const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
      if (moved < 5) onClick()
      else onMoved({ x: data.x, y: data.y })
    },
  }
}

const MODAL_WIDTHS = { normal: 520, wide: 680 }

function useOpenCard(cardRef, size = 'normal') {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState({ dx: 0, dy: 0, scale: 1 })

  function openCard() {
    const rect = cardRef.current.getBoundingClientRect()
    const modalWidth = Math.min(MODAL_WIDTHS[size], window.innerWidth * 0.92)
    setFrom({
      dx: rect.left + rect.width / 2 - window.innerWidth / 2,
      dy: rect.top + rect.height / 2 - window.innerHeight / 2,
      scale: rect.width / modalWidth,
    })
    setOpen(true)
  }

  return { open, from, openCard, close: () => setOpen(false) }
}

function CardModal({ from, front, back, onClose, size = 'normal' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className='card-overlay' onClick={onClose}>
      <div
        className={`card-modal ${size} ${front ? '' : 'no-flip'}`}
        style={{ '--dx': `${from.dx}px`, '--dy': `${from.dy}px`, '--s': from.scale }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='card-modal-inner'>
          {front && <div className='card-modal-front'>{front}</div>}
          <div className='card-modal-back'>{back}</div>
        </div>
      </div>
    </div>
  )
}

function CardModalHeader({ title, onClose }) {
  return (
    <div className='card-modal-header'>
      <h3>{title}</h3>
      <button className='close-btn' onClick={onClose} aria-label='Close'>✕</button>
    </div>
  )
}

function formatIncidentDate(value) {
  const date = new Date(value)
  return isNaN(date) ? value : date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
}

function CaseCard({ Case }) {
  const cardRef = useRef(null)
  const { domId, onDrag, interactive, handleClick, stringClass, position, onMoved } = useBoardCard('case')
  const { open, from, openCard, close } = useOpenCard(cardRef, 'wide')
  const dragProps = useClickNotDrag(cardRef, () => {
    if (!handleClick() && interactive) openCard()
  }, onMoved)

  return (
    <>
      <Draggable nodeRef={cardRef} position={position} onDrag={onDrag} {...dragProps}>
        <div id={domId} className={`case-card ${open ? 'is-open' : ''} ${stringClass}`} ref={cardRef}>
          <div className='case-paper taped'>
            <p className='case-file-label'>📁 Case file</p>
            <p className='case-description'>{Case.description}</p>
            <p className='case-meta'><b>Location:</b> {Case.location}</p>
            <p className='case-meta'><b>Date:</b> {formatIncidentDate(Case.incidentDate)}</p>
            {interactive && <p className='case-open-hint'>Click to open the file</p>}
          </div>
        </div>
      </Draggable>

      {open && (
        <CardModal
          from={from}
          size='wide'
          onClose={close}
          back={
            <>
              <CardModalHeader title={`📁 ${Case.title}`} onClose={close} />
              <div className='card-modal-body'>
                <p className='case-modal-description'>{Case.description}</p>
                <p className='case-meta'><b>Location:</b> {Case.location}</p>
                <p className='case-meta'><b>Date:</b> {formatIncidentDate(Case.incidentDate)}</p>
              </div>
            </>
          }
        />
      )}
    </>
  )
}

function EvidenceCard({ item }) {
  const cardRef = useRef(null)
  const { domId, onDrag, interactive, handleClick, stringClass, position, onMoved } = useBoardCard(item._id)
  const { open, from, openCard, close } = useOpenCard(cardRef)
  const dragProps = useClickNotDrag(cardRef, () => {
    if (!handleClick() && interactive) openCard()
  }, onMoved)

  const photo = item.imageUrl
    ? <img src={item.imageUrl} alt={item.title} draggable={false} />
    : <span className='evidence-empty'>{item.title}</span>

  return (
    <>
      <Draggable nodeRef={cardRef} position={position} onDrag={onDrag} {...dragProps}>
        <div id={domId} ref={cardRef} className={`flip-card taped ${open ? 'is-open' : ''} ${stringClass}`}>
          <div className='flip-card-inner'>
            <div className='flip-card-front'>{photo}</div>
          </div>
        </div>
      </Draggable>

      {open && (
        <CardModal
          from={from}
          onClose={close}
          front={photo}
          back={
            <>
              <CardModalHeader title={item.title} onClose={close} />
              <div className='card-modal-body'>
                {item.imageUrl && <img className='evidence-modal-photo' src={item.imageUrl} alt={item.title} draggable={false} />}
                <p>{item.details}</p>
                <p className='case-meta'><b>Found at:</b> {item.foundAt}</p>
              </div>
            </>
          }
        />
      )}
    </>
  )
}

function SuspectChat({ suspect, evidence = [], messages, setMessages, onClose }) {
  const [isTyping, setIsTyping] = useState(false)

  const questions = [
    { key: "name", question: "What's your name?", answer: `My name is ${suspect.name}.` },
    { key: "relation", question: "How are you connected to this case?", answer: suspect.relation, tell: suspect.relationTell },
    { key: "alibi", question: "Where were you when it happened?", answer: suspect.alibi, tell: suspect.alibiTell },
    { key: "motive", question: "Why would someone think you did this?", answer: suspect.motive, tell: suspect.motiveTell },
    ...evidence.map((item) => ({
      key: `evidence-${item._id}`,
      question: `Can you explain this? ${item.title}`,
      answer: item.suspectResponse || "I don't know anything about that.",
      tell: item.responseTell,
    })),
  ]

  const remainingQuestions = questions.filter(q => !messages.some(m => m.key === q.key))

  const knowsName = messages.some(m => m.key === "name" && m.sender === "suspect")
  const displayName = knowsName ? suspect.name : "The suspect"

  function handleSend(question) {
    setMessages(prev => [...prev, { key: question.key, text: question.question, sender: "user" }])
    setIsTyping(true)

    setTimeout(() => {
      const reply = [{ key: question.key, text: question.answer, sender: "suspect" }]
      if (question.tell) {
        reply.push({ key: question.key, text: question.tell, sender: "tell" })
      }
      setMessages(prev => [...prev, ...reply])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <>
      <div className='suspect-header'>
        {suspect.imageUrl && <img src={suspect.imageUrl} alt={displayName} draggable={false} />}
        <h3>{displayName}</h3>
        <button className='close-btn' onClick={onClose} aria-label='Close'>✕</button>
      </div>

      <div className='suspect-chat'>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={isTyping ? <TypingIndicator content={`${displayName} is typing`} /> : null}>
              {messages.map((message, index) => message.sender === "tell" ? (
                <MessageSeparator key={index} className='tell'>
                  <em>{displayName} {message.text.charAt(0).toLowerCase() + message.text.slice(1)}</em>
                </MessageSeparator>
              ) : (
                <Message
                  key={index}
                  model={{
                    message: message.text,
                    direction: message.sender === "user" ? "outgoing" : "incoming",
                    position: "single",
                  }}
                />
              ))}

              {/* the questions you can still ask, shown inside the chat as suggestions */}
              {!isTyping && remainingQuestions.length > 0 && (
                <Message
                  className='question-suggestions'
                  model={{ type: 'custom', direction: 'incoming', position: 'single' }}
                >
                  <Message.CustomContent>
                    <p className='question-suggestions-title'>{messages.length ? 'Ask next:' : 'Try asking:'}</p>
                    {remainingQuestions.map((question) => (
                      <button
                        key={question.key}
                        type='button'
                        className='question-chip'
                        onClick={() => handleSend(question)}
                      >
                        {question.question}
                      </button>
                    ))}
                  </Message.CustomContent>
                </Message>
              )}

              {!isTyping && remainingQuestions.length === 0 && (
                <MessageSeparator className='tell'>
                  <em>You've asked everything you can.</em>
                </MessageSeparator>
              )}
            </MessageList>
          </ChatContainer>
        </MainContainer>
      </div>
    </>
  )
}

function AccuseBar({ suspectId }) {
  const { onAccuse, progress } = useContext(BoardContext)
  const { solved, failed, attemptsLeft } = progress
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState(null)

  if (!onAccuse) return null

  async function confirmAccuse() {
    setBusy(true)
    setOutcome(await onAccuse(suspectId))
    setBusy(false)
    setConfirming(false)
  }

  return (
    <div className='accuse-bar'>
      {outcome?.isCorrect && <p className='accuse-msg correct'>✅ Case solved! You caught the culprit.</p>}
      {outcome && !outcome.error && !outcome.isCorrect && (
        <p className='accuse-msg wrong'>
          {outcome.attemptsLeft === 0 ? '❌ Wrong suspect. That was your last attempt.' : '❌ Wrong suspect. Keep investigating.'}
        </p>
      )}
      {outcome?.error && <p className='accuse-msg wrong'>{outcome.error}</p>}

      {solved ? (
        !outcome?.isCorrect && <p className='accuse-msg'>Your team already solved this case.</p>
      ) : failed ? (
        !outcome && <p className='accuse-msg'>Your team has no attempts left.</p>
      ) : confirming ? (
        <div className='accuse-confirm'>
          <span>
            Accuse this suspect? This uses 1 of your {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} left.
          </span>
          <button className='accuse-btn' onClick={confirmAccuse} disabled={busy}>Yes, accuse</button>
          <button onClick={() => setConfirming(false)} disabled={busy}>Cancel</button>
        </div>
      ) : (
        <>
          <button className='accuse-btn' onClick={() => { setOutcome(null); setConfirming(true) }}>🔍 Accuse</button>
          {attemptsLeft != null && <span className='attempts-left'> Attempts left: {attemptsLeft}</span>}
        </>
      )}
    </div>
  )
}


function SuspectCard({ suspect, evidence }) {
  const cardRef = useRef(null)
  const [messages, setMessages] = useState([])
  const { domId, onDrag, interactive, handleClick, stringClass, position, onMoved } = useBoardCard(suspect._id)
  const { open, from, openCard, close } = useOpenCard(cardRef)
  const dragProps = useClickNotDrag(cardRef, () => {
    if (!handleClick() && interactive) openCard()
  }, onMoved)

  return (
    <>
      <Draggable nodeRef={cardRef} position={position} onDrag={onDrag} {...dragProps}>
        <div id={domId} ref={cardRef} className={`suspect-thumb ${open ? 'is-open' : ''} ${stringClass}`}>
          <div className='polaroid taped'>
            {suspect.imageUrl
              ? <img src={suspect.imageUrl} alt='Suspect' draggable={false} />
              : <span className='suspect-thumb-empty'>?</span>}
          </div>
        </div>
      </Draggable>

      {open && (
        <CardModal
          from={from}
          onClose={close}
          front={suspect.imageUrl && <img src={suspect.imageUrl} alt='Suspect' draggable={false} />}
          back={
            <>
              <SuspectChat
                suspect={suspect}
                evidence={evidence}
                messages={messages}
                setMessages={setMessages}
                onClose={close}
              />
              <AccuseBar suspectId={suspect._id} />
            </>
          }
        />
      )}
    </>
  )
}

const suspectIdOf = (evidence) =>
  typeof evidence.suspectId === 'object' ? evidence.suspectId?._id : evidence.suspectId

function BoardNote(props) {
  const { domId, onDrag, handleClick, stringClass } = useBoardCard(props.note._id)
  const { stringMode } = useContext(BoardContext)
  return (
    <StickyNote
      {...props}
      connect={{ domId, onDrag, onClick: handleClick, stringClass, stringMode }}
    />
  )
}

const isDraftId = (id) => String(id).startsWith('draft-')

const noteStartSpot = (index) => ({ x: ((index % 5) - 2) * 216, y: Math.floor(index / 5) * 180 })

function useBoardArea(boardRef, notesRef) {
  const [area, setArea] = useState(null)

  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    function measure() {
      const style = getComputedStyle(board)
      setArea({
        width: board.clientWidth,
        height: board.clientHeight,
        notesTop: notesRef.current?.offsetTop ?? 0,
        padX: parseFloat(style.paddingLeft) || 0,
        padTop: parseFloat(style.paddingTop) || 0,
        padBottom: parseFloat(style.paddingBottom) || 0,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(board)
    return () => observer.disconnect()
  }, [boardRef, notesRef])

  return area
}

const samePair = (s, a, b) => (s.a === a && s.b === b) || (s.a === b && s.b === a)

function CaseBoard({ Case, suspects, evidence, interactive = false, user = null, onAccuse = null, progress = {}, children }) {
  const showNotes = Boolean(interactive && user)
  const sharedBoard = useSharedBoard(Case._id, showNotes)
  const { strings } = sharedBoard
  const boardNotes = useBoardNotes(Case._id, showNotes ? user : null, sharedBoard)

  const [stringMode, setStringMode] = useState(false)
  const [pending, setPending] = useState(null)

  const boardRef = useRef(null)
  const notesRef = useRef(null)
  const boardArea = useBoardArea(boardRef, notesRef)

  const autoStrings = evidence
    .map(e => ({ a: suspectIdOf(e), b: e._id, auto: true }))
    .filter(s => s.a && suspects.some(suspect => suspect._id === s.a))

  const onBoard = new Set([
    'case',
    ...suspects.map(s => s._id),
    ...evidence.map(e => e._id),
    ...boardNotes.notes.map(n => n._id),
  ])

  const allStrings = [
    ...autoStrings,
    ...strings.filter(s => !autoStrings.some(auto => samePair(auto, s.a, s.b))),
  ].filter(s => onBoard.has(s.a) && onBoard.has(s.b))

  function cardClick(id) {
    if (!stringMode) return false
    if (!pending) {
      setPending(id)
    } else if (pending === id) {
      setPending(null)
    } else {
      const exists = allStrings.some(s => samePair(s, pending, id))
      if (!exists) sharedBoard.addString(pending, id)
      setPending(null)
    }
    return true
  }

  function removeString(a, b) {
    sharedBoard.removeString(a, b)
  }

  function toggleStringMode() {
    setStringMode(!stringMode)
    setPending(null)
  }

  const board = {
    interactive, cardClick, stringMode, pending, onAccuse: interactive ? onAccuse : null, progress,
    positions: sharedBoard.positions, moveItem: sharedBoard.moveItem,
  }

  return (
    <BoardContext.Provider value={board}>
      <div className='board-frame'>
      <Xwrapper>
        <div ref={boardRef} className={`board ${stringMode ? 'editing' : ''}`}>

          <div className='board-header'>
            <div className='board-toolbar'>
              {interactive && (
                <>
                  <button className={`board-btn ${stringMode ? 'active' : ''}`} onClick={toggleStringMode}>
                    🧵 {stringMode ? 'Done connecting' : 'Connect cards'}
                  </button>
                  {strings.length > 0 && (
                    <button className='board-btn' onClick={sharedBoard.clearStrings}>✂️ Clear strings</button>
                  )}
                  {showNotes && (
                    <button className='board-btn' onClick={boardNotes.addNote}>📝 Add note</button>
                  )}
                  {stringMode && (
                    <p className='board-hint'>
                      {pending ? 'Now click the card or note to connect it to.' : 'Click a card or note to start a string. Click a string to remove it.'}
                    </p>
                  )}
                </>
              )}
            </div>

            <h1 className='paper-label board-title taped'>{Case.title}</h1>

            <div className='board-status'>
              {interactive && (
                progress.solved ? <span className='stamp stamp-solved'>Solved</span>
                : progress.failed ? <span className='stamp stamp-failed'>Case closed</span>
                : progress.attemptsLeft != null && (
                  <span className='paper-label small'>Attempts left: {progress.attemptsLeft} of {progress.maxAttempts}</span>
                )
              )}
            </div>
          </div>

          {allStrings.map(({ a, b, auto }) => (
            <Xarrow
              key={`${auto ? 'auto' : 'own'}-${a}-${b}`}
              start={cardDomId(a)}
              end={cardDomId(b)}
              path='straight'
              color='#c0392b'
              strokeWidth={3}
              showHead={true} headShape='circle' headSize={3}
              showTail={true} tailShape='circle' tailSize={3}
              zIndex={99999}
              passProps={{
                className: auto ? 'string auto-string' : 'string',
                pointerEvents: stringMode && !auto ? 'visibleStroke' : 'none',
                onClick: () => stringMode && !auto && removeString(a, b),
              }}
            />
          ))}

          <div className='board-column board-left'>
            <div className='board-cards'>
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect._id}
                suspect={suspect}
                evidence={evidence.filter(e => suspectIdOf(e) === suspect._id)}
              />
            ))}
            </div>
          </div>

          <div className='board-column board-center'>
            <CaseCard Case={Case} />
          </div>

          <div className='board-column board-right'>
            <div className='board-cards'>
            {evidence.map((item) => (
              <EvidenceCard key={item._id} item={item} />
            ))}
            </div>
          </div>

          {showNotes && (
            <div ref={notesRef} className='board-notes'>
              {boardNotes.notes.map((note, index) => (
                <BoardNote
                  key={note._id}
                  note={note}
                  user={user}
                  position={sharedBoard.positions[note._id] || (isDraftId(note._id) ? undefined : noteStartSpot(index))}
                  onSave={boardNotes.saveNote}
                  onRemove={boardNotes.removeNote}
                  onMove={sharedBoard.moveItem}
                  onFront={bringToFront}
                  area={boardArea}
                />
              ))}
            </div>
          )}

          {children && <div className='board-footer'>{children}</div>}

        </div>
      </Xwrapper>
      </div>
    </BoardContext.Provider>
  )
}

export default CaseBoard
