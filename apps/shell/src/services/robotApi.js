const getBaseURL = () => {
  if (import.meta.env.PROD) {
    // 生产环境使用固定的 URL
    return 'http://106.12.58.7:8000/edu_rag/api';
  }
  // 开发环境使用环境变量或默认值
  return import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
};


export async function askRobotStream(question, onChunk, onComplete) {
  const baseURL = getBaseURL();
  const url = `${baseURL}/chat_with_knowledge_stream`;
  
  let reader = null;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions: question })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let buffer = '';

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
        if (!line.startsWith('data: ')) continue;
        
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') {
          onComplete?.(text);
          return;
        }

        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            text += content;
            onChunk?.(content, text);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  } catch (error) {
    console.error('askRobotStream error:', error);
    throw error;
  } finally {
    reader?.releaseLock();
  }
}

export async function askOCRStream(question, files = [], onChunk, onComplete) {
  const baseURL = getBaseURL();
  const url = `${baseURL}/chat_by_files_stream`;
  
  let reader = null;
  
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

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let buffer = '';

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
        
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') {
            onComplete?.(text);
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || 
                          data.content || 
                          data.response ||
                          data.answer;
            if (content) {
              text += content;
              onChunk?.(content, text);
            }
          } catch (e) {
            // 忽略解析错误
            console.warn('解析JSON失败:', e);
          }
        } else {
          try {
            const data = JSON.parse(line);
            const content = data.choices?.[0]?.delta?.content || 
                          data.content || 
                          data.response ||
                          data.answer;
            if (content) {
              text += content;
              onChunk?.(content, text);
            }
          } catch (e) {
            // 如果不是 JSON，忽略
          }
        }
      }
    }
  } catch (error) {
    console.error('askOCRStream error:', error);
    throw error;
  } finally {
    if (reader) {
      reader.releaseLock();
    }
  }
}