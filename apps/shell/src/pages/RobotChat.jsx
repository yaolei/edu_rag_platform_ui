import React, { useState, useRef, useEffect } from 'react'
import { Box, Typography, Divider, Alert } from '@mui/material'
import { ChatMessageList } from '../components/ChatMessageList'
import { UploadPreview } from '../components/UploadPreview'
import { ChatInputBar } from '../components/ChatInputBar'
import { askRobot, getChatHistory } from '../services/robotApi'


const DEFAULT_MESSAGE = {
  type: 'ai',
  content: 'Hello! 👋 I\'m an AI Robot here to help you. Feel free to ask me any questions!',
  timestamp: new Date().toISOString()
}

export function RobotChat() {
  const [messages, setMessages] = useState([DEFAULT_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const responsesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory()
        if (Array.isArray(history) && history.length > 0) {
          setMessages(history)
        }
      } catch (err) {
        console.error('Failed to load history:', err)
      }
    }
  }, [])

  useEffect(() => {
    responsesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendQuestion = async () => {
    if (!input.trim() && !uploadedFile && !uploadedImage) return

    const userMsg = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      file: uploadedFile,
      image: uploadedImage
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setUploadedFile(null)
    setUploadedImage(null)
    setError(null)

    try {
      setLoading(true)
      const { response, timestamp } = await askRobot(input.trim())
      setMessages((prev) => [...prev, { type: 'ai', content: response, timestamp }])
    } catch (err) {
      setError(err.message || 'Failed to get response from robot')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendQuestion()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile({ name: file.name, size: file.size, type: file.type })
    }
    e.target.value = ''
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage({ name: file.name, src: event.target?.result, type: file.type })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chat with AI Robot
        </Typography>
      </Box>

      <Divider />

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <ChatMessageList messages={messages} loading={loading} responsesEndRef={responsesEndRef} />

      <UploadPreview
        uploadedImage={uploadedImage}
        uploadedFile={uploadedFile}
        onRemoveImage={() => setUploadedImage(null)}
        onRemoveFile={() => setUploadedFile(null)}
      />

      <ChatInputBar
        input={input}
        onInputChange={setInput}
        onKeyDown={handleKeyDown}
        onSend={handleSendQuestion}
        onFileUpload={handleFileUpload}
        onImageUpload={handleImageUpload}
        loading={loading}
        uploadedFile={uploadedFile}
        uploadedImage={uploadedImage}
        fileInputRef={fileInputRef}
        imageInputRef={imageInputRef}
      />
    </Box>
  )
}