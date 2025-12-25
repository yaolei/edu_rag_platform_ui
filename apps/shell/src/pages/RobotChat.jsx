import React, { useState, useRef, useEffect} from 'react'
import { useDispatch } from 'react-redux';
import { Box, Divider, Alert} from '@mui/material'
import { ChatMessageList } from '../components/ChatMessageList'
import { UploadPreview } from '../components/UploadPreview'
import { ChatInputBar } from '../components/ChatInputBar'
import { askRobot, askOCR } from '../services/robotApi'

const DEFAULT_MESSAGE = {
  type: 'ai',
  content: 'Hello! 👋 I\'m an AI Robot here to help you. Feel free to ask me any questions!',
  timestamp: new Date().toISOString()
}

export function RobotChat({ channelId = 'default' }) {

  const dispatch = useDispatch();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`chat_history_${channelId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : [DEFAULT_MESSAGE];
      }
    } catch (e) {
      console.error('Failed to load chat history from sessionStorage', e);
    }
    return [DEFAULT_MESSAGE];
  });

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const responsesEndRef = useRef(null)

  useEffect(() => {
    const imageUrlsToCleanup = [];
    messages.forEach(msg => {
      if (msg.type === 'user' && msg.image && msg.image.src) {
        imageUrlsToCleanup.push(msg.image.src);
      }
    });

    return () => {
      imageUrlsToCleanup.forEach(url => URL.revokeObjectURL(url));
    };
  }, [messages]);

  useEffect(() => {
    responsesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  useEffect(() => {
    // 只有当有实际对话内容（不止欢迎语）或长度大于1时才保存
    if (messages.length > 1 || (messages.length === 1 && messages[0] !== DEFAULT_MESSAGE)) {
      try {
        sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history to sessionStorage', e);
      }
    }
  }, [messages, channelId]); 
  const handleSendQuestion = async () => {

    if (!input.trim() && !uploadedFile && uploadedImages.length === 0) return
    const files = [
      ...(uploadedFile ? [uploadedFile] : []),
      ...uploadedImages
    ]
    const userMsg = {
        type: 'user',
        content: input.trim(),
        timestamp: new Date().toISOString(),
        image: null,
        file: null
    };

    const firstImageFile = files.find(f => f.type.startsWith('image/'));
    const firstNonImageFile = files.find(f => !f.type.startsWith('image/'));

    if (firstImageFile) {
      userMsg.image = {
        src: URL.createObjectURL(firstImageFile),
        name: firstImageFile.name,
      };
    }

    if (firstNonImageFile) {
      // 构建 file 对象
      userMsg.file = {
        name: firstNonImageFile.name,
        size: firstNonImageFile.size
      };
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setUploadedFile(null)
    setUploadedImages([])
    setError(null)

    try {
      setLoading(true)
      let res
      if (files.length !== 0) {
        res = await askOCR(input.trim(), files)
      } else {
        res = await askRobot(input.trim())
      }
      const { response, timestamp } = res
      setMessages((prev) => [...prev, { type: 'ai', content: response, timestamp }])
    } catch (err) {
      setError(err.message || 'Failed to get response from robot')
    } finally {
      setLoading(false)
    }
  }

    const handleClearHistory = () => {
      if (window.confirm('确定要清空当前对话的历史记录吗？')) {
        // 1. 先收集所有需要清理的图片URL
        const urlsToCleanup = [];
        messages.forEach(msg => {
          if (msg.type === 'user' && msg.image && msg.image.src) {
            urlsToCleanup.push(msg.image.src);
          }
        });

        // 2. 然后更新状态和存储
        setMessages([DEFAULT_MESSAGE]);
        sessionStorage.removeItem(`chat_history_${channelId}`);

        // 3. 最后清理图片URL（放在最后确保不会影响状态更新）
        urlsToCleanup.forEach(url => URL.revokeObjectURL(url));
      }
    };

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
   const files = Array.from(e.target.files || [])

   const imageFiles = files.filter(f => f.type.startsWith('image/'))
    if (uploadedImages.length + imageFiles.length > 5) {
      setError('最多只能上传 5 张图片 或 一个附件')
      return
    }
    setUploadedImages(prev => [...prev, ...imageFiles])
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <Divider />
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      <ChatMessageList messages={messages} loading={loading} responsesEndRef={responsesEndRef} />

      <UploadPreview
        uploadedImages={uploadedImages}
        uploadedFile={uploadedFile}
        onRemoveImage={(idx) => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
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
        uploadedImages={uploadedImages}
        onClearHistory={handleClearHistory}
        showClearButton={messages.length > 1}
      />
    </Box>
  )
}