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

// 移动设备优化：使用 Blob 存储代替 base64
const fileToStorable = async (file) => {
  // 移动设备优化：如果文件太大，只存储元数据
  if (file.size > 1024 * 1024) { // 大于 1MB
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      // 不存储大文件数据
      data: null,
      isLargeFile: true,
      lastModified: file.lastModified,
      _isMobileOptimized: true
    };
  }
  
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    data: await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }),
    isLargeFile: false,
    lastModified: file.lastModified,
    _isMobileOptimized: false
  };
};

// 优化的 dataURL 转 Blob
const dataURItoBlob = (dataURI) => {
  try {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error('Failed to convert dataURI to Blob:', e);
    return null;
  }
};

// 移动设备优化的存储
const MOBILE_STORAGE_KEY = 'robot_chat_mobile_data';

export function RobotChat({ channelId = 'default' }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`chat_history_${channelId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // 检查是否是有效的消息数组
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`[RobotChat ${channelId}] 加载了 ${parsed.length} 条消息`);
          
          // 移动设备：延迟处理图片，避免同时创建多个 Blob URL
          const processedMessages = parsed.map((msg, index) => {
            if (msg.type === 'user' && msg.image) {
              // 检查是否有大文件标记
              if (msg.image._storable?.isLargeFile) {
                // 大文件在移动设备上不尝试恢复
                return {
                  ...msg,
                  image: {
                    ...msg.image,
                    src: null,
                    isLargeFile: true
                  }
                };
              }
              
              // 延迟创建 Blob URL
              setTimeout(() => {
                if (msg.image._storable?.data) {
                  const blob = dataURItoBlob(msg.image._storable.data);
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    
                    setMessages(prev => {
                      const newMessages = [...prev];
                      if (newMessages[index]) {
                        newMessages[index] = {
                          ...newMessages[index],
                          image: {
                            ...newMessages[index].image,
                            src: url
                          }
                        };
                      }
                      return newMessages;
                    });
                  }
                }
              }, 100 + index * 50); // 延迟加载，避免卡顿
              
              return {
                ...msg,
                image: {
                  ...msg.image,
                  src: null // 先设置为 null
                }
              };
            }
            return msg;
          });
          
          return processedMessages;
        }
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return [DEFAULT_MESSAGE];
  });

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const responsesEndRef = useRef(null)
  const blobUrlRegistry = useRef(new Map()); // 使用 Map 更好地管理 URL

  // 清理函数
  useEffect(() => {
    return () => {
      // 清理当前组件创建的 Blob URL
      blobUrlRegistry.current.forEach((url, id) => {
        URL.revokeObjectURL(url);
        console.debug(`[RobotChat ${channelId}] 清理 Blob URL: ${id}`);
      });
      blobUrlRegistry.current.clear();
    };
  }, [channelId]);

  // 自动保存到 sessionStorage
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    
    // 准备要保存的消息（移除 Blob URL）
    const messagesToSave = messages.map(msg => {
      if (msg.type === 'user' && msg.image) {
        const { src, ...restImage } = msg.image;
        return { ...msg, image: restImage };
      }
      return msg;
    });
    
    try {
      // 移动设备优化：分批次保存大消息
      const messageString = JSON.stringify(messagesToSave);
      if (messageString.length > 2 * 1024 * 1024) { // 大于 2MB
        console.warn('消息过大，尝试压缩保存');
        
        // 尝试移除一些大图片的历史数据
        const compressedMessages = messagesToSave.map(msg => {
          if (msg.type === 'user' && msg.image?._storable?.data?.length > 100000) {
            // 移除大图片数据，只保留元数据
            return {
              ...msg,
              image: {
                ...msg.image,
                _storable: {
                  ...msg.image._storable,
                  data: null,
                  isLargeFile: true
                }
              }
            };
          }
          return msg;
        });
        
        sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(compressedMessages));
      } else {
        sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(messagesToSave));
      }
      
      console.debug(`[RobotChat ${channelId}] 保存了 ${messages.length} 条消息`);
    } catch (e) {
      console.error('保存历史记录失败:', e);
      
      // 如果还是失败，尝试只保存最后 20 条消息
      if (e.name === 'QuotaExceededError') {
        try {
          const recentMessages = messagesToSave.slice(-20);
          sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(recentMessages));
          console.warn('存储空间不足，只保存最近 20 条消息');
        } catch (e2) {
          console.error('保存最近消息也失败:', e2);
        }
      }
    }
  }, [messages, channelId]);

  // 滚动到底部
  useEffect(() => {
    responsesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };

    // 处理图片
    const firstImageFile = files.find(f => f.type.startsWith('image/'));
    const firstNonImageFile = files.find(f => !f.type.startsWith('image/'));

    if (firstImageFile) {
      try {
        // 创建 Blob URL
        const blobUrl = URL.createObjectURL(firstImageFile);
        const urlId = `img-${Date.now()}`;
        blobUrlRegistry.current.set(urlId, blobUrl);

        // 转换为可存储格式
        const storable = await fileToStorable(firstImageFile);

        userMsg.image = {
          src: blobUrl,
          _storable: storable,
          name: firstImageFile.name,
          size: firstImageFile.size,
          type: firstImageFile.type,
          id: urlId,
        };
      } catch (e) {
        console.error('创建图片预览失败:', e);
        // 即使失败也继续发送文本
      }
    }

    // 处理非图片文件
    if (firstNonImageFile && !firstImageFile) {
      userMsg.file = {
        name: firstNonImageFile.name,
        size: firstNonImageFile.size,
        type: firstNonImageFile.type,
      };
    }

    // 添加用户消息
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setUploadedFile(null);
    setUploadedImages([]);
    setError(null);

    // 发送到服务器
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
      setError(err.message || '获取响应失败');
      console.error('发送消息失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = useCallback(() => {
    if (window.confirm('确定要清空当前对话的历史记录吗？')) {
      // 清理 Blob URL
      blobUrlRegistry.current.forEach((url, id) => {
        URL.revokeObjectURL(url);
      });
      blobUrlRegistry.current.clear();

      // 重置消息
      setMessages([DEFAULT_MESSAGE]);
      
      // 只清理当前 channel 的历史
      sessionStorage.removeItem(`chat_history_${channelId}`);
      
      console.log(`[RobotChat ${channelId}] 已清空历史记录`);
    }
  }, [channelId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSendQuestion();
    }
  }, [input, uploadedFile, uploadedImages, loading]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 移动设备限制：文件大小检查
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('文件大小不能超过 10MB');
      e.target.value = '';
      return;
    }

    setUploadedFile({ 
      name: file.name, 
      size: file.size, 
      type: file.type,
      file: file,
      id: `file-${Date.now()}`
    });
    e.target.value = '';
  }, []);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    // 移动设备限制
    if (uploadedImages.length + imageFiles.length > 3) {
      setError('移动设备建议最多上传 3 张图片');
      e.target.value = '';
      return;
    }
    
    // 检查文件大小
    const largeFile = imageFiles.find(f => f.size > 5 * 1024 * 1024); // 5MB
    if (largeFile) {
      setError(`图片 ${largeFile.name} 大小超过 5MB，请压缩后上传`);
      e.target.value = '';
      return;
    }

    const newImages = imageFiles.map(file => ({
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    }));
    
    setUploadedImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  }, [uploadedImages.length]);

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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      gap: 2,
      overflow: 'hidden'
    }}>
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 1 }}
        >
          {error}
        </Alert>
      )}
      
      <ChatMessageList 
        messages={messages} 
        loading={loading} 
        responsesEndRef={responsesEndRef} 
      />

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
  );
}