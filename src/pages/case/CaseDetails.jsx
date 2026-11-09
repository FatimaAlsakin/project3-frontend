import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import Draggable from 'react-draggable'
import { DraggableCore } from 'react-draggable';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MainContainer, MessageList, Message, MessageInput, MessageSeparator, TypingIndicator } from '@chatscope/chat-ui-kit-react';

let topZ = 1
function bringToFront(ref) {
  topZ += 1
  if (ref.current) ref.current.style.zIndex = topZ
}

const BoardContext = createContext(null)

const cardDomId = (id) => `card-${id}`

function useBoardCard(id) {
  const board = useContext(BoardContext)
  const updateStrings = useXarrow()   
  return {
    domId: cardDomId(id),
    onDrag: updateStrings,
    handleClick: () => board.cardClick(id),
    stringClass: board.stringMode ? `string-mode ${board.pending === id ? 'string-pending' : ''}` : '',
  }
}

function CaseCard({ Case }) {
  const cardRef = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })
  const { domId, onDrag, handleClick, stringClass } = useBoardCard('case')

  return (
    <Draggable
      nodeRef={cardRef}
      onStart={(e, data) => { startPos.current = { x: data.x, y: data.y }; bringToFront(cardRef) }}
      onDrag={onDrag}
      onStop={(e, data) => {
        const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
        if (moved < 5) handleClick()
      }}
    >
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
  const startPos = useRef({ x: 0, y: 0 })
  const { domId, onDrag, handleClick, stringClass } = useBoardCard(id)

  return (
    <Draggable
      nodeRef={cardRef}
      onStart={(e, data) => { startPos.current = { x: data.x, y: data.y }; bringToFront(cardRef) }}
      onDrag={onDrag}
      onStop={(e, data) => {
        const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
        if (moved < 5 && !handleClick()) setFlipped(f => !f)
      }}
    >
      <div id={domId} ref={cardRef} className={`flip-card ${flipped ? 'flipped' : ''} ${stringClass}`}>
        <div className='flip-card-inner'>
          <div className='flip-card-front'>{front}</div>
          <div className='flip-card-back'>{back}</div>
        </div>
      </div>
    </Draggable>
  )
}

function SuspectChat({ suspect, messages, setMessages, onClose }) {
  const [isTyping, setIsTyping] = useState(false)

  const questions = [
    { key: "name", question: "What's your name?", answer: `My name is ${suspect.name}.` },
    { key: "relation", question: "How are you connected to this case?", answer: suspect.relation, tell: suspect.relationTell },
    { key: "alibi", question: "Where were you when it happened?", answer: suspect.alibi, tell: suspect.alibiTell },
    { key: "motive", question: "Why would someone think you did this?", answer: suspect.motive, tell: suspect.motiveTell },
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

function SuspectCard({ suspect }) {
  const cardRef = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState({ dx: 0, dy: 0, scale: 1 })
  const [messages, setMessages] = useState([])
  const { domId, onDrag, handleClick, stringClass } = useBoardCard(suspect._id)

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
      <Draggable
        nodeRef={cardRef}
        onStart={(e, data) => { startPos.current = { x: data.x, y: data.y }; bringToFront(cardRef) }}
        onDrag={onDrag}
        onStop={(e, data) => {
          const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
          if (moved < 5 && !handleClick()) openCard()
        }}
      >
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

// the suspect an evidence item belongs to (a plain id, or a full object if the backend populates it)
const suspectIdOf = (evidence) =>
  typeof evidence.suspectId === 'object' ? evidence.suspectId?._id : evidence.suspectId

function CaseDetails({user}) {

  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])

  const { cId } = useParams()
  const navigate = useNavigate()

  async function loadCase(cId) {
    const response = await getCase(cId)
    setCase(response.case)
    setSuspects(response.suspects)
    setEvidence(response.evidence)
  }

  async function deleteCase(cId){
    const response = await delCase(cId)
    navigate("/cases")
  }

  useEffect(()=>{
    loadCase(cId)
  },[cId])

  const storageKey = `case-strings-${cId}`

  const [stringMode, setStringMode] = useState(false)
  const [pending, setPending] = useState(null)   
  const [strings, setStrings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || []
      return saved.map(s => ({ a: s.a ?? s.source, b: s.b ?? s.target }))
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(strings)) } catch {}
  }, [strings])

  // strings that come from the case itself: evidence linked to a suspect
  // (suspectId can be a plain id, or a full suspect object if the backend populates it)
  const autoStrings = evidance
    .map(e => ({ a: suspectIdOf(e), b: e._id, auto: true }))
    .filter(s => s.a && suspects.some(suspect => suspect._id === s.a))

  const samePair = (s, a, b) => (s.a === a && s.b === b) || (s.a === b && s.b === a)

  // everything to draw: automatic strings + the player's own (skipping duplicates)
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

  const board = {
    cardClick,
    stringMode,
    pending,
  }

  return (
    <>
      {Case ? (
        <BoardContext.Provider value={board}>
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
                // automatic strings can't be removed; the player's own can (in connect mode)
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
              />
            ))}
          </div>

          <div className='board-column board-center'>
            <CaseCard Case={Case} />
          </div>

          <div className='board-column'>
            {evidance.map((evidence) => (
              <FlipCard
                key={evidence._id}
                id={evidence._id}
                front={
                  <>
                    {evidence.imageUrl && <img src={evidence.imageUrl} alt={evidence.title} draggable={false} />}
                  </>
                }
                back={
                  <>
                    <h3><b>Evidence Title:</b> {evidence.title}</h3>
                    <p> {evidence.details}</p>
                    <br />
                    <p><b>Found At:</b> {evidence.foundAt}</p>
                  </>
                }
              />
            ))}
          </div>

        </div>
        </Xwrapper>

            {user?.isAdmin ? (
              <>
                <button><Link to={`/case/${cId}/edit`}>Edit Case</Link></button>
                <button><Link onClick={() => deleteCase(cId)}>Delete Case</Link></button>
              </>
            ) : null}
        </BoardContext.Provider>
      ) : null}
    </>
  )
}

export default CaseDetails
