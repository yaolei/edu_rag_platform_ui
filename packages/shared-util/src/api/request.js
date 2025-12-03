import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 0 || res.code === 200) {
      switch (res,code){
        case 401:
          localStorage.removeItem('token')
          break;
        case 403:
          // handle forbidden
          console.error("n prmis to access this resource")
          break;
        case 404:
          // handle not found
          console.error("not page found")
          break;
        case 500:
          // handle server error
          console.error("internal server error")
          break;
        default:
          return console.error(res.message, "unknown error")
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data != undefined ? res.data : res
  }, (error) => {
    if (error.response) {
      const {status} = error.response
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          // window.location.href = '/login'
          break
        case 403:
          console.error('No permission to access this resource')
          break
        case 404:
          console.error('Not found')
          break
        case 500:
          console.error('Internal server error')
          break
        default:
          console.error(error.response.data?.message || 'Network error')
      }
    } else if (error.request) {
      console.error('No response received from server')
    } else {
      console.error('Request error:', error.message)
    }
    return Promise.reject(error)
  }
)

export function get(url, params = {}, config = {}) {
  return service.get(url, { params, ...config })
}

export function post(url, data = {}, config = {}) {
  return service.post(url, data, config)
}

export function put(url, data = {}, config = {}) {
  return service.put(url, data, config)
}

export function del(url, params = {}, config = {}) {
  return service.delete(url, { params, ...config })
}

export function uploadFile(url, formData, onUploadProgress) {
  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress:onUploadProgress? (ProgressEvent) => {
      const percentCompleted = Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total)
      onUploadProgress(ProgressEvent)
    }: undefined
  })  
}

export function downloadFile(url, params = {}, fileName, onUploadProgress) {
  return service.get(url, {
    params,
    responseType: 'blob',
    ...config
  })
}