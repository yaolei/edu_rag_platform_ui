const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return 'http://106.12.58.7:8000/edu_rag/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
};

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

export async function askRobotStream(question, onChunk, onComplete) {
  const baseURL = getBaseURL();
  const url = `${baseURL}/chat_with_knowledge_stream`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: question })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    await processStreamResponse(reader, onChunk, onComplete, false);
  } catch (error) {
    console.error('askRobotStream error:', error);
    throw error;
  }
}

export async function askOCRStream(question, files = [], onChunk, onComplete) {
  const baseURL = getBaseURL();
  const url = `${baseURL}/chat_by_files_stream`;
  
  try {
    const formData = new FormData();
    formData.append('questions', question);
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
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