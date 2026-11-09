import { useState, useEffect, useRef, createContext, useContext } from 'react'
import Draggable from 'react-draggable'
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MainContainer, MessageList, Message, MessageSeparator, TypingIndicator } from '@chatscope/chat-ui-kit-react';

let topZ = 1
function bringToFront(ref) {
  topZ += 1
  if (ref.current) ref.current.style.zIndex = topZ
}

// interactive = solve page: cards flip/open and the player can connect strings
// not interactive = details page: cards only move, only the default strings show
const BoardContext = createContext(null)

const cardDomId = (id) => `card-${id}`

function useBoardCard(id) {
  const board = useContext(BoardContext)
  const updateStrings = useXarrow()
  return {
    domId: cardDomId(id),
    onDrag: updateStrings,
    interactive: board.interactive,
    // returns true when the click was used for connecting a string
    handleClick: () => board.cardClick(id),
    stringClass: board.stringMode ? `string-mode ${board.pending === id ? 'string-pending' : ''}` : '',
  }
}

// call onClick only when the card was clicked, not dragged
function useClickNotDrag(cardRef, onClick) {
  const startPos = useRef({ x: 0, y: 0 })
  return {
    onStart: (e, data) => { startPos.current = { x: data.x, y: data.y }; bringToFront(cardRef) },
    onStop: (e, data) => {
      const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
      if (moved < 5) onClick()
    },
  }
}

function CaseCard({ Case }) {
  const cardRef = useRef(null)
  const { domId, onDrag, handleClick, stringClass } = useBoardCard('case')
  const dragProps = useClickNotDrag(cardRef, handleClick)

  return (
    <Draggable nodeRef={cardRef} onDrag={onDrag} {...dragProps}>
      <div id={domId} className={`case-card ${stringClass}`} ref={cardRef}>
        <h1>{Case.title}</h1>
        <h3>{Case.description}</h3>
        <p><b>Location:</b> {Case.location}</p>
        <p><b>Date:</b> {Case.incidentDate}</p>
      </div>
    </Draggable>
  )
}

function FlipCard({ id, front, back }) {
  const cardRef = useRef(null)
  const [flipped, setFlipped] = useState(false)
  const { domId, onDrag, interactive, handleClick, stringClass } = useBoardCard(id)
  const dragProps = useClickNotDrag(cardRef, () => {
    if (!handleClick() && interactive) setFlipped(f => !f)
  })

  return (
    <Draggable nodeRef={cardRef} onDrag={onDrag} {...dragProps}>
      <div id={domId} ref={cardRef} className={`flip-card ${flipped ? 'flipped' : ''} ${stringClass}`}>
        <div className='flip-card-inner'>
          <div className='flip-card-front'>{front}</div>
          <div className='flip-card-back'>{back}</div>
        </div>
      </div>
    </Draggable>
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
            </MessageList>
          </ChatContainer>
        </MainContainer>
      </div>

      <div className='chat-options'>
        {remainingQuestions.map((question) => (
          <button key={question.key} disabled={isTyping} onClick={() => handleSend(question)}>
            {question.question}
          </button>
        ))}
      </div>
    </>
  )
}

const MODAL_WIDTH = 380

function SuspectCard({ suspect, evidence }) {
  const cardRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState({ dx: 0, dy: 0, scale: 1 })
  const [messages, setMessages] = useState([])
  const { domId, onDrag, interactive, handleClick, stringClass } = useBoardCard(suspect._id)
  const dragProps = useClickNotDrag(cardRef, () => {
    if (!handleClick() && interactive) openCard()
  })

  function openCard() {
    const rect = cardRef.current.getBoundingClientRect()
    const modalWidth = Math.min(MODAL_WIDTH, window.innerWidth * 0.9)
    setFrom({
      dx: rect.left + rect.width / 2 - window.innerWidth / 2,
      dy: rect.top + rect.height / 2 - window.innerHeight / 2,
      scale: rect.width / modalWidth,
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <Draggable nodeRef={cardRef} onDrag={onDrag} {...dragProps}>
        <div id={domId} ref={cardRef} className={`suspect-thumb ${open ? 'is-open' : ''} ${stringClass}`}>
          {suspect.imageUrl
            ? <img src={suspect.imageUrl} alt='Suspect' draggable={false} />
            : <span className='suspect-thumb-empty'>?</span>}
        </div>
      </Draggable>

      {open && (
        <div className='suspect-overlay' onClick={() => setOpen(false)}>
          <div
            className='suspect-modal'
            style={{ '--dx': `${from.dx}px`, '--dy': `${from.dy}px`, '--s': from.scale }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='suspect-modal-inner'>
              <div className='suspect-modal-front'>
                {suspect.imageUrl && <img src={suspect.imageUrl} alt='Suspect' draggable={false} />}
              </div>
              <div className='suspect-modal-back'>
                <SuspectChat
                  suspect={suspect}
                  evidence={evidence}
                  messages={messages}
                  setMessages={setMessages}
                  onClose={() => setOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const suspectIdOf = (evidence) =>
  typeof evidence.suspectId === 'object' ? evidence.suspectId?._id : evidence.suspectId

const samePair = (s, a, b) => (s.a === a && s.b === b) || (s.a === b && s.b === a)

function CaseBoard({ Case, suspects, evidence, interactive = false }) {
  const storageKey = `case-strings-${Case._id}`

  const [stringMode, setStringMode] = useState(false)
  const [pending, setPending] = useState(null)
  // the player's own strings, saved per case in this browser (solve page only)
  const [strings, setStrings] = useState(() => {
    if (!interactive) return []
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || []
      return saved.map(s => ({ a: s.a ?? s.source, b: s.b ?? s.target }))
    } catch { return [] }
  })

  useEffect(() => {
    if (!interactive) return
    try { localStorage.setItem(storageKey, JSON.stringify(strings)) } catch {}
  }, [strings, interactive, storageKey])

  // default strings: each suspect is tied to their own evidence
  const autoStrings = evidence
    .map(e => ({ a: suspectIdOf(e), b: e._id, auto: true }))
    .filter(s => s.a && suspects.some(suspect => suspect._id === s.a))

  const allStrings = [
    ...autoStrings,
    ...strings.filter(s => !autoStrings.some(auto => samePair(auto, s.a, s.b))),
  ]

  function cardClick(id) {
    if (!stringMode) return false
    if (!pending) {
      setPending(id)
    } else if (pending === id) {
      setPending(null)
    } else {
      const exists = allStrings.some(s => samePair(s, pending, id))
      if (!exists) setStrings([...strings, { a: pending, b: id }])
      setPending(null)
    }
    return true
  }

  function removeString(a, b) {
    setStrings(strings.filter(s => !(s.a === a && s.b === b)))
  }

  function toggleStringMode() {
    setStringMode(!stringMode)
    setPending(null)
  }

  const board = { interactive, cardClick, stringMode, pending }

  return (
    <BoardContext.Provider value={board}>
      {interactive && (
        <div className='board-toolbar'>
          <button onClick={toggleStringMode} className={stringMode ? 'active' : ''}>
            🧵 {stringMode ? 'Done connecting' : 'Connect cards'}
          </button>
          {strings.length > 0 && (
            <button onClick={() => setStrings([])}>Clear strings</button>
          )}
          {stringMode && (
            <span className='board-hint'>
              {pending ? 'Now click the card to connect it to.' : 'Click a card to start a string. Click a string to remove it.'}
            </span>
          )}
        </div>
      )}

      <Xwrapper>
        <div className={`board ${stringMode ? 'editing' : ''}`}>

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

          <div className='board-column'>
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect._id}
                suspect={suspect}
                evidence={evidence.filter(e => suspectIdOf(e) === suspect._id)}
              />
            ))}
          </div>

          <div className='board-column board-center'>
            <CaseCard Case={Case} />
          </div>

          <div className='board-column'>
            {evidence.map((item) => (
              <FlipCard
                key={item._id}
                id={item._id}
                front={
                  <>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} draggable={false} />}
                  </>
                }
                back={
                  <>
                    <h3><b>Evidence Title:</b> {item.title}</h3>
                    <p> {item.details}</p>
                    <br />
                    <p><b>Found At:</b> {item.foundAt}</p>
                  </>
                }
              />
            ))}
          </div>

        </div>
      </Xwrapper>
    </BoardContext.Provider>
  )
}

export default CaseBoard
