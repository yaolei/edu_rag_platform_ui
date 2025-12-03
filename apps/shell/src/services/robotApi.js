// 预留 API 接口，后续连接真实后端
import {get, post} from '@workspace/shared-util'


/**
 * 向 AI Robot 发送问题并获取回答
 * @param {string} question - 用户提问
 * @returns {Promise<{response: string, timestamp: string}>}
 */
export async function askRobot(question) {
  try {
      const res = await post('/chat', {
        "questions": question
      });
      const {content } = res.content;
      if (res.status !== 200) throw new Error(`HTTP ${status}`);
      return {
        response: content,
        timestamp: new Date().toISOString()
      };
      return{}
  } catch (error) {
      console.error('askRobot error:', error)
    throw error
  }
}

/**
 * 获取对话历史记录
 * @returns {Promise<Array>}
 */
export async function getChatHistory() {
  try {
    const res = await fetch('/robot/history', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('getChatHistory error:', error)
    return []
  }
}

/**
 * 清空对话历史
 * @returns {Promise<void>}
 */
export async function clearChatHistory() {
  try {
    await fetch('/robot/history', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
  } catch (error) {
    console.error('clearChatHistory error:', error)
  }
}