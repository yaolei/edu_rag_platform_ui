import React, { useState, useRef, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import {useDispatch, useSelector} from 'react-redux'
import { hasHistroy } from '../utils/stateSlice/chatHistorySlice';
import { ChatMessageList } from '../components/ChatMessageList'
import { UploadPreview } from '../components/UploadPreview'
import { ChatInputBar } from '../components/ChatInputBar'
import { askRobot, askOCR } from '../services/robotApi'

const DEFAULT_MESSAGE = {
  type: 'ai',
  content: 'Hello! 👋 I\'m an AI Robot here to help you. Feel free to ask me any questions!',
  timestamp: new Date().toISOString()
}

// 统一的图片压缩函数 - 现在也用于上传到服务器
  const compressImageFile = async (file, options = {}) => {
    const {
      maxWidth = 1024,
      maxHeight = 768,
      quality = 0.7,
      type = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 创建临时URL
      const tempUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // 立即清理临时URL
        URL.revokeObjectURL(tempUrl);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: type,
              lastModified: Date.now()
            });
            
            console.log(`图片压缩: ${file.name}`, {
              原始大小: `${(file.size / 1024).toFixed(1)}KB`,
              压缩大小: `${(blob.size / 1024).toFixed(1)}KB`,
              压缩比例: `${(blob.size / file.size * 100).toFixed(1)}%`
            });
            
            resolve(compressedFile);
          },
          type,
          quality
        );
      };
      
      img.onerror = () => {
        // 清理临时URL
        URL.revokeObjectURL(tempUrl);
        reject(new Error('图片加载失败'));
      };
      
      img.src = tempUrl;
    });
  };

// 创建可存储的数据（使用压缩后的图片）
const fileToStorable = async (file) => {
  if (file.type.startsWith('image/')) {
    // 为图片文件生成缩略图（进一步压缩用于存储）
    const thumbnailData = await createOptimizedImageData(file);
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      data: thumbnailData, // 保存高度压缩的缩略图
      isLargeFile: file.size > 1024 * 1024,
      lastModified: file.lastModified,
      _isMobileOptimized: true,
      _isCompressed: true
    };
  }
  
  // 非图片文件保持原有逻辑
  if (file.size > 1024 * 1024) {
    return {
      name: file.name,
      type: file.type,
      size: file.size,
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

  const createOptimizedImageData = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 创建临时URL
      const tempUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // 立即清理临时URL
        URL.revokeObjectURL(tempUrl);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        // 清理临时URL
        URL.revokeObjectURL(tempUrl);
        reject(new Error('图片加载失败'));
      };
      
      img.src = tempUrl;
    });
  };

export function RobotChat({ channelId = 'default' }) {
  const dispatch = useDispatch();
  const reduxHasHistory = useSelector(state => state.chatHistory.hasHistroy);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`chat_history_${channelId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`[RobotChat ${channelId}] 加载了 ${parsed.length} 条消息`);
          const hasUserMessages = parsed.some(msg => msg.type === 'user');
          setTimeout(() => {
            dispatch(hasHistroy(hasUserMessages));
          }, 0);
          
          const processedMessages = parsed.map((msg) => {
            if (msg.type === 'user' && msg.image && msg.image._storable?.data) {
              return {
                ...msg,
                image: {
                  ...msg.image,
                  src: msg.image._storable.data,
                  _fromHistory: true
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
    
    setTimeout(() => {
      dispatch(hasHistroy(false));
    }, 0);
    return [DEFAULT_MESSAGE];
  });


  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const responsesEndRef = useRef(null)
  const blobUrlRegistry = useRef(new Map());

  // 清理函数
    useEffect(() => {
      return () => {
        blobUrlRegistry.current.forEach((url, id) => {
          URL.revokeObjectURL(url);
        });
        blobUrlRegistry.current.clear();
      };
    }, [channelId]);

    // 自动保存到 sessionStorage
    useEffect(() => {
      if (!messages || messages.length === 0) return;
      
      // 准备要保存的消息
      const messagesToSave = messages.map(msg => {
        if (msg.type === 'user' && msg.image) {
          const { src, ...restImage } = msg.image;
          return { ...msg, image: restImage };
        }
        return msg;
      });
    
    try {
      const messageString = JSON.stringify(messagesToSave);
      // 如果超过1.5MB，只保存最近20条
      if (messageString.length > 1.5 * 1024 * 1024) {
        console.warn('消息过大，只保存最近20条');
        const recentMessages = messagesToSave.slice(-20);
        sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(recentMessages));
      } else {
        sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(messagesToSave));
      }
      
      const hasUserMessages = messages.some(msg => msg.type === 'user');
      dispatch(hasHistroy(hasUserMessages));

    } catch (e) {
      console.error('保存历史记录失败:', e);
      if (e.name === 'QuotaExceededError') {
        try {
          const recentMessages = messagesToSave.slice(-10);
          sessionStorage.setItem(`chat_history_${channelId}`, JSON.stringify(recentMessages));
          console.warn('存储空间不足，只保存最近10条消息');
        } catch (e2) {
          console.error('保存最近消息也失败:', e2);
        }
      }
    }
  }, [messages, channelId, dispatch]);

  // 滚动到底部
  useEffect(() => {
      const timer = setTimeout(() => {
      responsesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, loading]);

  useEffect(() => {
    if (reduxHasHistory === false) {
      const hasUserMessages = messages.some(msg => msg.type === 'user');
      console.log('Checking if should clear: hasUserMessages =', hasUserMessages);
      
      if (hasUserMessages) {
        console.log('Performing clear history');
        performClearHistory();
      }
    }
  }, [reduxHasHistory]); 

  const handleSendQuestion = async () => {
    if (!input.trim() && !uploadedFile && uploadedImages.length === 0) return;

    // 收集所有要上传的文件
    const filesToUpload = [
      ...(uploadedFile ? [uploadedFile.file] : []),
      ...uploadedImages.map(img => img.file),
    ];

    // 处理用户消息
    const userMsg = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      image: null,
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };

    // 处理第一个图片文件（用于显示）
    const firstImageFile = filesToUpload.find(f => f.type.startsWith('image/'));
    const firstNonImageFile = filesToUpload.find(f => !f.type.startsWith('image/'));

    if (firstImageFile) {
      try {
        // 创建预览用的 Blob URL
        const blobUrl = URL.createObjectURL(firstImageFile);
        const urlId = `img-${Date.now()}`;
        blobUrlRegistry.current.set(urlId, blobUrl);

        // 转换为可存储格式（压缩缩略图）
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
      const filesForServer = filesToUpload; // 直接使用已压缩的文件
      let res;
      if (filesToUpload.length !== 0) {
        res = await askOCR(input.trim(), filesForServer);
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

  const performClearHistory = useCallback(() => {
    // 清理 Blob URL
    blobUrlRegistry.current.forEach((url, id) => {
      URL.revokeObjectURL(url);
    });
    blobUrlRegistry.current.clear();

    const currentImages = [...uploadedImages]; // 创建副本
    currentImages.forEach(img => {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    // 重置消息
    setMessages([DEFAULT_MESSAGE]);
    
    // 清理上传的文件或图片
    setUploadedFile(null);
    setUploadedImages([]);
    sessionStorage.removeItem(`chat_history_${channelId}`);
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

    console.log(`📤 开始处理单个文件上传: ${file.name}`);
    
    // 文件大小检查
    if (file.size > 10 * 1024 * 1024) { // 10MB限制
      console.error(`❌ ${file.name}: 文件大小超过10MB限制 (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      setError('文件大小不能超过 10MB');
      e.target.value = '';
      return;
    }

    // 如果是图片，根据使用场景智能压缩
    if (file.type.startsWith('image/')) {
      // 根据文件大小决定压缩参数
      const fileSizeMB = file.size / (1024 * 1024);
      let compressOptions = {};
      
      if (fileSizeMB < 1.5) {
        // 小于1.5MB：不压缩
        console.log(`✅ ${file.name}: 小于1.5MB,不压缩`);
        setUploadedFile({ 
          name: file.name, 
          size: file.size, 
          type: file.type,
          file: file,
          id: `file-${Date.now()}`
        });
      } else {
        // 大于等于1.5MB：智能压缩
        console.log(`🔄 ${file.name}: 大于等于1.5MB，开始智能压缩`);
        
        if (fileSizeMB >= 1.5 && fileSizeMB < 5) {
          compressOptions = { maxWidth: 1600, maxHeight: 1200, quality: 0.8 };
        } else if (fileSizeMB >= 5 && fileSizeMB < 10) {
          compressOptions = { maxWidth: 1200, maxHeight: 900, quality: 0.7 };
        } else {
          compressOptions = { maxWidth: 1024, maxHeight: 768, quality: 0.6 };
        }
        
        compressImageFile(file, compressOptions).then(compressedFile => {
          console.log(`✅ ${file.name}: 压缩成功，已添加到上传列表`);
          setUploadedFile({ 
            name: compressedFile.name, 
            size: compressedFile.size, 
            type: compressedFile.type,
            file: compressedFile,
            id: `file-${Date.now()}`
          });
        }).catch(err => {
          console.error(`❌ ${file.name}: 图片压缩失败:`, err);
          // 压缩失败时使用原文件
          console.log(`⚠️ ${file.name}: 压缩失败，使用原始文件`);
          setUploadedFile({ 
            name: file.name, 
            size: file.size, 
            type: file.type,
            file: file,
            id: `file-${Date.now()}`
          });
        });
      }
    } else {
      // 非图片文件
      console.log(`📄 ${file.name}: 非图片文件，直接上传`);
      setUploadedFile({ 
        name: file.name, 
        size: file.size, 
        type: file.type,
        file: file,
        id: `file-${Date.now()}`
      });
    }
    
    e.target.value = '';
  }, []);

  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    console.log(`📤 开始批量图片上传: ${imageFiles.length}张图片`);
    
    // 限制数量
    if (uploadedImages.length + imageFiles.length > 3) {
      console.error(`❌ 图片数量超过限制: 当前${uploadedImages.length}张，新增${imageFiles.length}张，最多3张`);
      setError('最多上传 3 张图片');
      e.target.value = '';
      return;
    }
    
    // 并行处理所有图片
    const processPromises = imageFiles.map(file => {
      const fileSizeMB = file.size / (1024 * 1024);
      
      // 小于1.5MB不压缩
      if (fileSizeMB < 1.5) {
        console.log(`✅ ${file.name}: 小于1.5MB，不压缩`);
        return Promise.resolve({
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          previewUrl: URL.createObjectURL(file)
        });
      }

      // 大于等于1.5MB：智能压缩
      console.log(`🔄 ${file.name}: 大于等于1.5MB,开始压缩`);
      let compressOptions = {};
      if (fileSizeMB >= 1.5 && fileSizeMB < 5) {
        compressOptions = { maxWidth: 1200, maxHeight: 900, quality: 0.9 };
      } else if (fileSizeMB >= 5 ) {
        compressOptions = { maxWidth: 1024, maxHeight: 768, quality: 0.5 };
      }
      
      return compressImageFile(file, compressOptions).then(compressedFile => {
        console.log(`✅ ${file.name}: 压缩成功`);
        return {
          file: compressedFile,
          name: compressedFile.name,
          size: compressedFile.size,
          type: compressedFile.type,
          id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          previewUrl: URL.createObjectURL(compressedFile)
        };
      }).catch(err => {
        console.error(`❌ ${file.name}: 图片处理失败:`, err);
        // 压缩失败时返回原文件
        console.log(`⚠️ ${file.name}: 压缩失败，使用原始文件`);
        return {
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          previewUrl: URL.createObjectURL(file)
        };
      });
    });
    
    Promise.all(processPromises).then(newImages => {
      console.log(`✅ 批量图片处理完成: ${newImages.length}张图片已处理`);
      setUploadedImages(prev => [...prev, ...newImages]);
    }).catch(err => {
      console.error('❌ 图片批量处理失败:', err);
      setError('图片处理失败，请重试');
    });
    
    e.target.value = '';
  }, [uploadedImages.length]);

const handleRemoveImage = useCallback((idx) => {
  const imageToRemove = uploadedImages[idx];
  if (imageToRemove.previewUrl) {
    const urlId = imageToRemove.id || `preview-${idx}`;
    blobUrlRegistry.current.delete(urlId);
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
      />
    </Box>
  );
}