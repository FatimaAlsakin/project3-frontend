import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from "react-router"
import { getCase , delCase } from '../../services/caseService'
import Draggable from 'react-draggable'
import { DraggableCore } from 'react-draggable';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MainContainer, MessageList, Message, MessageInput, MessageSeparator, TypingIndicator } from '@chatscope/chat-ui-kit-react';

function DraggableCard({ children, handle }) {
  const cardRef = useRef(null)
  return (
    <Draggable nodeRef={cardRef} handle={handle}>
      <div className='suspect-card' ref={cardRef}>
        {children}
      </div>
    </Draggable>
  )
}

function FlipCard({ front, back }) {
  const cardRef = useRef(null)
  const [flipped, setFlipped] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })

  return (
    <Draggable
      nodeRef={cardRef}
      onStart={(e, data) => { startPos.current = { x: data.x, y: data.y } }}
      onStop={(e, data) => {
        const moved = Math.abs(data.x - startPos.current.x) + Math.abs(data.y - startPos.current.y)
        if (moved < 5) setFlipped(f => !f)   // barely moved = it was a click
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

function SuspectChat({ suspect }) {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const questions = [
    { key: "relation", question: "How are you connected to this case?", answer: suspect.relation, tell: suspect.relationTell },
    { key: "alibi", question: "Where were you when it happened?", answer: suspect.alibi, tell: suspect.alibiTell },
    { key: "motive", question: "Why would someone think you did this?", answer: suspect.motive, tell: suspect.motiveTell },
  ]

  // questions that haven't been asked yet
  const remainingQuestions = questions.filter(q => !messages.some(m => m.key === q.key))

  function handleSend(question) {
    // 1. show the detective's question right away
    setMessages(prev => [...prev, { key: question.key, text: question.question, sender: "user" }])
    setIsTyping(true)

    // 2. after a short pause, the suspect answers (+ body language, if there is any)
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
      {/* header = the part you grab to drag the card */}
      <div className='suspect-header'>
        {suspect.imageUrl && <img src={suspect.imageUrl} alt={suspect.name} draggable={false} />}
        <h3>{suspect.name}</h3>
      </div>

      <div className='suspect-chat'>
        <MainContainer>
          <ChatContainer>
            <MessageList typingIndicator={isTyping ? <TypingIndicator content={`${suspect.name} is typing`} /> : null}>
              {messages.map((message, index) => message.sender === "tell" ? (
                // body language: centred italic line, not a chat bubble
                <MessageSeparator key={index} className='tell'>
                  <em>{suspect.name} {message.text.charAt(0).toLowerCase() + message.text.slice(1)}</em>
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
        <Draggable nodeRef={nodeRef}>
          <div className='case-card' ref={nodeRef} >
            <h1>{Case.title}</h1>
            <h3>{Case.description}</h3>
            <p><b>Location:</b> {Case.location}</p>
            <p><b>Date:</b> {Case.incidentDate}</p> 
            
          </div>
        </Draggable>

            {/* <h3>Suspects:</h3> */}
            {suspects.map((suspect) => (
              <DraggableCard key={suspect._id} handle='.suspect-header'>
                <SuspectChat suspect={suspect} />
              </DraggableCard>
            ))}
            {/* <h3>Evidence:</h3> */}
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