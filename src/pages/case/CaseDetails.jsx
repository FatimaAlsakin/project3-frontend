import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import Draggable from 'react-draggable'
import { DraggableCore } from 'react-draggable';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MainContainer, MessageList, Message, MessageInput, MessageSeparator, TypingIndicator } from '@chatscope/chat-ui-kit-react';

let topZ = 1
function bringToFront(ref) {
  topZ += 1
  if (ref.current) ref.current.style.zIndex = topZ
}

function FlipCard({ front, back }) {
  const cardRef = useRef(null)
  const [flipped, setFlipped] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })

  return (
    <Draggable
      nodeRef={cardRef}
      onStart={(e, data) => { startPos.current = { x: data.x, y: data.y }; bringToFront(cardRef) }}
      onStop={(e, data) => {
        const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
        if (moved < 5) setFlipped(f => !f)   
      }}
    >
      <div ref={cardRef} className={`flip-card ${flipped ? 'flipped' : ''}`}>
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
                // body language: centred italic line, not a chat bubble
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
        onStop={(e, data) => {
          const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
          if (moved < 5) openCard()
        }}
      >
        <div ref={cardRef} className={`suspect-thumb ${open ? 'is-open' : ''}`}>
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
            onClick={(e) => e.stopPropagation()}   // clicks inside the card don't close it
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

function CaseDetails({user}) {

    const nodeRef = useRef(null);


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

  return (
    <>
      {Case ? (
        <>
        <div className='board'>

          <div className='board-column'>
            {suspects.map((suspect) => (
              <SuspectCard key={suspect._id} suspect={suspect} />
            ))}
          </div>

          <div className='board-column board-center'>
            <Draggable nodeRef={nodeRef} onStart={() => bringToFront(nodeRef)}>
              <div className='case-card' ref={nodeRef} >
                <h1>{Case.title}</h1>
                <h3>{Case.description}</h3>
                <p><b>Location:</b> {Case.location}</p>
                <p><b>Date:</b> {Case.incidentDate}</p>
              </div>
            </Draggable>
          </div>

          <div className='board-column'>
            {evidance.map((evidence) => (
              <FlipCard
                key={evidence._id}
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

            {user?.isAdmin ? (
              <>
                <button><Link to={`/case/${cId}/edit`}>Edit Case</Link></button>
                <button><Link onClick={() => deleteCase(cId)}>Delete Case</Link></button>
              </>
            ) : null}
        </>
      ) : null}
    </>
  )
}

export default CaseDetails