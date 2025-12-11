import axios from 'axios'

// 获取基础 URL（从环境变量或默认值）

const API_BASE_URL = import.meta.env.VITE_API_URL ||
                     (import.meta.env.PROD
                       ? 'http://106.12.58.7:8000/api'
                       : 'http://localhost:8000/api')


// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token 并添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 返回响应数据（约定后端返回 { code, data, message }）
    const { code, data, message } = response.data
    
    if (code === 0 || code === 200) {
      return data
    }
    
    // 非 200/0 状态码视为错误
    const error = new Error(message || 'Unknown error')
    error.code = code
    return Promise.reject(error)
  },
  (error) => {
    // 处理特定 HTTP 状态码
    if (error.response?.status === 401) {
      // token 过期或无效，清除并跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    const message = error.response?.data?.message || error.message || 'Network error'
    console.error('Response error:', message)
    return Promise.reject(new Error(message))
  }
)

export default axiosInstance