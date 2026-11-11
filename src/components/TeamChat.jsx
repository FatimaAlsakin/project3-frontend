import React, { useState, useEffect } from 'react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react'
import { postMessage } from '../services/chatService'
import { useLiveCase } from './LiveCase'
import '../styles/TeamChat.css'

function formatTime(dateString) {
  const date = new Date(dateString)
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (date.toDateString() === new Date().toDateString()) return time
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}

function TeamChat({ cId, user }) {
  const [messages, setMessages] = useState([])
  const [sendError, setSendError] = useState(null)

  // the chat part of the shared refresh (see LiveCase.jsx)
  const live = useLiveCase()
  const latest = live?.data?.messages
  const error = sendError || live?.error

  useEffect(() => {
    if (latest) setMessages(latest)
  }, [latest])

  async function handleSend(innerHtml, textContent) {
    const text = textContent.trim()
    if (!text) return
    try {
      await live.track(async () => {
        const newMessage = await postMessage(cId, text)
        setMessages(prev => [...prev, newMessage])
      })
      setSendError(null)
    } catch (err) {
      setSendError(err.response?.data?.message || "Message not sent, try again.")
    }
  }

  if (live?.data && !live.data.inTeam) {
    return (
      <div className='team-chat'>
        <h2>Team Chat</h2>
        <p className='team-chat-note'>Join a team to chat with your teammates about this case.</p>
      </div>
    )
  }

  return (
    <div className='team-chat'>
      <h2>Team Chat</h2>
      {error && <p className='team-chat-note'>{error}</p>}
      <div className='team-chat-box'>
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {messages.map(msg => {
                const isMine = msg.sender?._id === user._id
                return (
                  <Message
                    key={msg._id}
                    model={{
                      message: msg.text,
                      sender: msg.sender?.username,
                      direction: isMine ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  >
                    {!isMine && <Message.Header sender={msg.sender?.username} />}
                    <Message.Footer sentTime={formatTime(msg.createdAt)} />
                  </Message>
                )
              })}
            </MessageList>
            <MessageInput placeholder="Message your team..." attachButton={false} onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default TeamChat
