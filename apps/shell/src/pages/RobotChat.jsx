import React, { useState, useRef, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { ChatMessageList } from '../components/ChatMessageList'
import { UploadPreview } from '../components/UploadPreview'
import { ChatInputBar } from '../components/ChatInputBar'
import { askRobot, askOCR } from '../services/robotApi'

const DEFAULT_MESSAGE = {
  type: 'ai',
  content: 'Hello! 👋 I\'m an AI Robot here to help you. Feel free to ask me any questions!',
  timestamp: new Date().toISOString()
}


const fileToStorable = async (file) => {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    // 将文件内容转为 base64，以便存入 sessionStorage
    data: await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // 结果是 data:image/png;base64,...
      reader.readAsDataURL(file);
    })
  };
};

const storableToBlobUrl = (storable) => {
  if (!storable?.data) return null;
  // 注意：这里直接从 base64 data URL 创建 blob URL，可能不需要额外转换
  // 但为了统一管理，我们仍创建一个新的 blob URL 并登记
  const blob = dataURItoBlob(storable.data);
  const url = URL.createObjectURL(blob);
  return url;
};


// 将 data URL 转换为 Blob 对象（如果需要）
const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

export function RobotChat({ channelId = 'default' }) {
 const blobUrlRegistry = useRef(new Set());

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`chat_history_${channelId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 关键：加载历史时，为每条带图片的消息重新创建 blob URL 并登记
        if (parsed.length > 0) {
          parsed.forEach(msg => {
            if (msg.type === 'user' && msg.image && msg.image._storable) {
              const url = storableToBlobUrl(msg.image._storable);
              if (url) {
                msg.image.src = url; // 重新赋值 src
                blobUrlRegistry.current.add(url); // 登记到注册表
              }
            }
          });
          return parsed;
        }
        return [DEFAULT_MESSAGE];
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
    return () => {
      blobUrlRegistry.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlRegistry.current.clear();
      console.debug(`[RobotChat ${channelId}] 组件卸载，清理所有 Blob URL`);
    };
  }, [channelId]);


  useEffect(() => {
      // 保存时，需要先将 blob URL 替换为可存储的数据
      const messagesToSave = messages.map(msg => {
        if (msg.type === 'user' && msg.image && msg.image.src) {
          // 如果已经有 _storable 数据（从历史加载的），就直接用它
          // 如果是新消息，我们需要在创建时就保存 _storable（见下面修改的 handleSendQuestion）
          const { src, _storable, ...restImage } = msg.image;
          return { ...msg, image: { ...restImage, _storable: msg.image._storable } };
        }
        return msg;
      });

      if (messagesToSave.length > 1 || (messagesToSave.length === 1 && messagesToSave[0] !== DEFAULT_MESSAGE)) {
        try {
          sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(messagesToSave));
        } catch (e) {
          console.error('Failed to save chat history to sessionStorage', e);
        }
      }
    }, [messages, channelId]);

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
    if (!input.trim() && !uploadedFile && uploadedImages.length === 0) return;

    const files = [
      ...(uploadedFile ? [uploadedFile.file] : []),
      ...uploadedImages.map(img => img.file),
    ];

    const userMsg = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      image: null,
      file: null,
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };

    const firstImageFile = files.find(f => f.type.startsWith('image/'));
    const firstNonImageFile = files.find(f => !f.type.startsWith('image/'));

    if (firstImageFile) {
      // 创建 blob URL 并登记
      const blobUrl = URL.createObjectURL(firstImageFile);
      blobUrlRegistry.current.add(blobUrl);

      // 转换为可存储的格式（异步）
      const storable = await fileToStorable(firstImageFile);

      userMsg.image = {
        src: blobUrl, // 用于当前显示
        _storable: storable, // 用于持久化保存
        name: firstImageFile.name,
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      };
    }

    // ... handleSendQuestion 其余部分保持不变，直到 setMessages
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setUploadedFile(null);
    setUploadedImages([]);
    setError(null);

    try {
      setLoading(true);
      let res;
      if (files.length !== 0) {
        res = await askOCR(input.trim(), files);
      } else {
        res = await askRobot(input.trim());
      }
      const { response, timestamp } = res;
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          content: response,
          timestamp,
          id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to get response from robot');
    } finally {
      setLoading(false);
    }
  };

 const handleClearHistory = useCallback(() => {
    if (window.confirm('确定要清空当前对话的历史记录吗？')) {
      // 收集所有要清理的 blob URL
      const urlsToCleanup = [];
      messages.forEach(msg => {
        if (msg.type === 'user' && msg.image && msg.image.src) {
          urlsToCleanup.push(msg.image.src);
        }
      });

      // 从注册表中移除并清理
      urlsToCleanup.forEach(url => {
        URL.revokeObjectURL(url);
        blobUrlRegistry.current.delete(url);
      });

      setMessages([DEFAULT_MESSAGE]);
      sessionStorage.removeItem(`chat_history_${channelId}`);
      console.debug(`[RobotChat ${channelId}] 清空历史，清理 ${urlsToCleanup.length} 个 Blob URL`);
    }
  }, [messages, channelId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendQuestion()
    }
  }, [input, uploadedFile, uploadedImages]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile({ 
        name: file.name, 
        size: file.size, 
        type: file.type,
        file: file,  // 保留原始文件对象
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })
    }
    e.target.value = ''
  }, [])

const handleImageUpload = useCallback((e) => {
  const files = Array.from(e.target.files || [])
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  
  if (uploadedImages.length + imageFiles.length > 5) {
    setError('最多只能上传 5 张图片 或 一个附件')
    return
  }
  
  // 创建预览对象，包含原始文件对象和预览URL
  const newImages = imageFiles.map(file => ({
    file: file, // 只保存原始文件对象
    name: file.name,
    size: file.size,
    type: file.type,
    id: `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }))
  
  setUploadedImages(prev => [...prev, ...newImages])
  e.target.value = ''
}, [uploadedImages.length])

  const handleRemoveImage = useCallback((idx) => {
    const imageToRemove = uploadedImages[idx];
    if (imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
  }, [uploadedImages]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const handleInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      <ChatMessageList messages={messages} loading={loading} responsesEndRef={responsesEndRef} />

      <UploadPreview
        uploadedImages={uploadedImages}
        uploadedFile={uploadedFile}
        onRemoveImage={handleRemoveImage}
        onRemoveFile={handleRemoveFile}
      />

      <ChatInputBar
        input={input}
        onInputChange={handleInputChange}
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