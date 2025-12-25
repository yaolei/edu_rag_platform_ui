// 预留 API 接口，后续连接真实后端
import {uploadFile, post} from '@workspace/shared-util'


export async function askOCR(question, files = []) {
  try {
    const formData = new FormData();
    formData.append('questions', question);
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await uploadFile('/chat_by_files', formData);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return {
      response: res.content,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('ask ORC Robot error:', error);
    if (error.response) {
          console.error("错误响应数据:", error.response.data);
    }
    throw error;
  }
}



/**
 * 向 AI Robot 发送问题并获取回答
 * @param {string} question - 用户提问
 * @returns {Promise<{response: string, timestamp: string}>}
 */
export async function askRobot(question) {
  try {
      // /chat
      const res = await post('/chat_with_knowledge', {
        "questions": question
      });
      const {content } = res.content;
      if (res.status !== 200) throw new Error(`HTTP ${status}`);
      return {
        response: content,
        timestamp: new Date().toISOString()
      };
  } catch (error) {
      console.error('askRobot error:', error)
    throw error
  }
}
