import React, { useState, useEffect } from 'react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react'
import { getMessages, postMessage } from '../services/chatService'
import '../styles/TeamChat.css'

const REFRESH_EVERY = 3000

function formatTime(dateString) {
  const date = new Date(dateString)
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (date.toDateString() === new Date().toDateString()) return time
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}

function TeamChat({ cId, user }) {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)

  async function loadMessages() {
    try {
      const data = await getMessages(cId)
      setMessages(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load the team chat.")
    }
  }

  useEffect(() => {
    loadMessages()
    const timer = setInterval(loadMessages, REFRESH_EVERY)
    return () => clearInterval(timer)
  }, [cId])

  async function handleSend(innerHtml, textContent) {
    const text = textContent.trim()
    if (!text) return
    try {
      const newMessage = await postMessage(cId, text)
      setMessages(prev => [...prev, newMessage])
    } catch (err) {
      setError(err.response?.data?.message || "Message not sent, try again.")
    }
  }

  if (error === "Must be in a team") {
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
