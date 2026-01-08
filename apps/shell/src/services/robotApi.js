const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return 'http://106.12.58.7:8000/edu_rag/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
};

// 会话管理
export function getOrCreateConversationId(channelId = 'default') {
  let conversationId = sessionStorage.getItem(`conversation_id_${channelId}`);
  if (!conversationId) {
    conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(`conversation_id_${channelId}`, conversationId);
  }
  return conversationId;
}

export function clearConversationId(channelId = 'default') {
  sessionStorage.removeItem(`conversation_id_${channelId}`);
}

// 将消息历史转换为messages数组格式（前端限制为最近5轮对话）
function convertMessagesToMessagesArray(messages) {
  // 只保留最近的5轮对话（10条消息）
  const collectedMessages = [];
  
  // 从后往前遍历，保持对话的完整性
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    
    // 跳过正在加载的消息
    if (msg.isLoading) {
      continue;
    }
    
    if (msg.isSystemGenerated === true || msg.isWelcome === true) {
      console.log('🔍 过滤掉系统生成的消息');
      continue;
    }

    if (msg.type === 'user' || msg.type === 'ai') {
      const role = msg.type === 'user' ? "user" : "assistant";
      
      // 添加到数组开头，保持时间顺序
      collectedMessages.unshift({
        role: role,
        content: msg.content || ""
      });
      
      // 如果收集到10条消息（5轮对话），停止收集
      if (collectedMessages.length >= 10) {
        break;
      }
    }
  }
  
  console.log(`📦 前端限制：发送最近${collectedMessages.length}条消息`);
  return collectedMessages;
}

// 统一的流处理函数
async function processStreamResponse(reader, onChunk, onComplete, isOCR = false) {
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.(text);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        
        // 检查是否为SSE格式
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          
          // 处理结束标记
          if (dataStr === '[DONE]') {
            onComplete?.(text);
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            let content = null;
            
            if (isOCR) {
              // OCR模式：尝试多个字段
              content = data.choices?.[0]?.delta?.content || 
                       data.content || 
                       data.response ||
                       data.answer;
            } else {
              // 普通模式：只取特定字段
              content = data.choices?.[0]?.delta?.content;
            }
            
            if (content) {
              text += content;
              onChunk?.(content, text);
            }
          } catch (e) {
            // 忽略解析错误，保持与原有行为一致
            if (isOCR) {
              console.warn('解析JSON失败:', e);
            }
          }
        } else if (isOCR) {
          // OCR模式：也尝试直接解析JSON行
          try {
            const data = JSON.parse(line.trim());
            const content = data.choices?.[0]?.delta?.content || 
                          data.content || 
                          data.response ||
                          data.answer;
            if (content) {
              text += content;
              onChunk?.(content, text);
            }
          } catch (e) {
            // 如果不是JSON，忽略
          }
        }
      }
    }
  } finally {
    reader?.releaseLock();
  }
}

// 文本对话API - 修正的消息传递逻辑
export async function askRobotStream(messages = [], channelId = 'default', onChunk, onComplete) {
  const baseURL = getBaseURL();
  const conversationId = getOrCreateConversationId(channelId);
  const url = `${baseURL}/chat_with_knowledge_stream`;
  
  console.log(`🤖 发送对话历史 (channel: ${channelId}, conversation_id: ${conversationId})`);
  
  try {
    // 构建FormData
    const formData = new FormData();
    
    formData.append('conversation_id', conversationId || '');
    
    const messagesArray = convertMessagesToMessagesArray(messages);
    const messagesJson = JSON.stringify(messagesArray);
    
    console.log('📜 发送messages数组:', messagesArray);
    console.log('📜 消息数量:', messagesArray.length);
    
    formData.append('messages_json', messagesJson);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('服务器错误响应:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    await processStreamResponse(reader, onChunk, onComplete, false);
  } catch (error) {
    console.error('askRobotStream error:', error);
    throw error;
  }
}

// OCR对话API - 暂时保持原有格式
export async function askOCRStream(question, files = [], channelId = 'default', onChunk, onComplete) {
  const baseURL = getBaseURL();
  const conversationId = getOrCreateConversationId(channelId);
  const url = `${baseURL}/chat_by_files_stream`;
  
  console.log(`📷 OCR处理 (channel: ${channelId}, conversation_id: ${conversationId}):`, question, files.map(f => f.name));
  
  try {
    const formData = new FormData();

    if (question && question.trim()) {
      formData.append('questions', question.trim());
    } else {
      formData.append('questions', '');
    }
    formData.append('conversation_id', conversationId);

    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('服务器错误响应:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new Error('响应体不支持流式读取');
    }

    const reader = response.body.getReader();
    await processStreamResponse(reader, onChunk, onComplete, true);
  } catch (error) {
    console.error('askOCRStream error:', error);
    throw error;
  }
}

// 清理对话
export async function cleanupConversations(maxAgeHours = 24) {
  const baseURL = getBaseURL();
  const url = `${baseURL}/cleanup_conversations?max_age_hours=${maxAgeHours}`;
  
  try {
    const response = await fetch(url, { method: 'POST' });
    if (response.ok) {
      const result = await response.json();
      console.log('🧹 清理过期对话:', result);
      return result;
    }
  } catch (error) {
    console.error('清理对话错误:', error);
  }
}