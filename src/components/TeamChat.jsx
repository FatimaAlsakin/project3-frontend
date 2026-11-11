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

// the slim tab shown while the chat is closed, with a count of teammates' new messages
export function ChatTab({ user, onOpen }) {
  const live = useLiveCase()
  const fromTeammates = (live?.data?.messages || []).filter(msg => msg.sender?._id !== user._id)
  // how many teammate messages there were when the chat was closed
  const [seen, setSeen] = useState(null)

  useEffect(() => {
    if (seen === null && live?.data) setSeen(fromTeammates.length)
  }, [live?.data])

  const unread = seen === null ? 0 : Math.max(0, fromTeammates.length - seen)

  return (
    <button type='button' className='chat-tab' onClick={onOpen} aria-label='Open team chat'>
      <span className='chat-tab-icon'>💬</span>
      <span className='chat-tab-text'>Chat</span>
      {unread > 0 && <span className='chat-tab-badge'>{unread}</span>}
    </button>
  )
}

function TeamChat({ cId, user, onClose }) {
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
        <ChatHeader onClose={onClose} />
        <p className='team-chat-note'>Join a team to chat with your teammates about this case.</p>
      </div>
    )
  }

  return (
    <div className='team-chat'>
      <ChatHeader onClose={onClose} />
      {error &&<p className='team-chat-note'>{error}</p>}
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

function ChatHeader({ onClose }) {
  return (
    <div className='team-chat-header'>
      <h2>Team Chat</h2>
      {onClose && (
        <button type='button' className='team-chat-close' onClick={onClose} aria-label='Close team chat'>«</button>
      )}
    </div>
  )
}

export default TeamChat
