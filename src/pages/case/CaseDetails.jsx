import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import { createNotes } from "../../services/noteService"
import { getAllNotes } from "../../services/noteService"
import {deleteNoteById} from "../../services/noteService"
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

const cardDomId = (id) => `card-${id}`

function useBoardCard(id) {
  const updateStrings = useXarrow()
  return {
    domId: cardDomId(id),
    onDrag: updateStrings,
  }
}

function CaseCard({ Case }) {
  const cardRef = useRef(null)
  const { domId, onDrag } = useBoardCard('case')

  return (
    <Draggable
      nodeRef={cardRef}
      onStart={() => bringToFront(cardRef)}
      onDrag={onDrag}
    >
      <div id={domId} className="case-card" ref={cardRef}>
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
  const { domId, onDrag } = useBoardCard(id)

  return (
    <Draggable
      nodeRef={cardRef}
      onStart={(e, data) => { startPos.current = { x: data.x, y: data.y }; bringToFront(cardRef) }}
      onDrag={onDrag}
      onStop={(e, data) => {
        const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
        if (moved < 5) setFlipped(f => !f)
      }}
    >
      <div id={domId} ref={cardRef} className={`flip-card ${flipped ? 'flipped' : ''}`}>
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
  const startPos = useRef({ x: 0, y: 0 })
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState({ dx: 0, dy: 0, scale: 1 })
  const [messages, setMessages] = useState([])
  const { domId, onDrag } = useBoardCard(suspect._id)

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
          if (moved < 5) openCard()
        }}
      >
        <div id={domId} ref={cardRef} className={`suspect-thumb ${open ? 'is-open' : ''}`}>
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

function CaseDetails({user}) {

  const [ Case, setCase ] = useState(null)
  const [ suspects, setSuspects ] = useState([])
  const [ evidance, setEvidence ] = useState([])
  const [formData, setFormData] = useState({
  content:""
  }); 
   const [ Notes, setNotes ] = useState([])

    function handleChange(event){
    setFormData({...formData, [event.target.name]:event.target.value})
  }


  
      const { cId } = useParams()
     const { nID } = useParams()
      
     async function handleSubmit(event){
        event.preventDefault()
        const createNote = await createNotes(cId, formData)
        loadNotes()
       
    
      }
        async function loadNotes(){
       const response = await getAllNotes(cId)
       console.log(response)
       setNotes(response)
     }

         async function deleteNote(nID){
         const deletedNote = await deleteNoteById(nID)
        loadNotes()
       }

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

    useEffect(()=>{
      loadNotes()
    },[])

  // only the default strings: each suspect is tied to their own evidence
  const strings = evidance
    .map(e => ({ a: suspectIdOf(e), b: e._id }))
    .filter(s => s.a && suspects.some(suspect => suspect._id === s.a))

  return (
    <>
      {Case ? (
        <>
        <Xwrapper>
        <div className='board'>

          {strings.map(({ a, b }) => (
            <Xarrow
              key={`${a}-${b}`}
              start={cardDomId(a)}
              end={cardDomId(b)}
              path='straight'
              color='#c0392b'
              strokeWidth={3}
              showHead={true} headShape='circle' headSize={3}   
              showTail={true} tailShape='circle' tailSize={3}
              zIndex={99999}                                    
              passProps={{ className: 'string auto-string', pointerEvents: 'none' }}
            />
          ))}

          <div className='board-column'>
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect._id}
                suspect={suspect}
                evidence={evidance.filter(e => suspectIdOf(e) === suspect._id)}
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

            {user?.teamId ? 
            <button> Start Solving</button> 
            :null}

        </>
      ) : null}
    </>
  )
}

export default CaseDetails
