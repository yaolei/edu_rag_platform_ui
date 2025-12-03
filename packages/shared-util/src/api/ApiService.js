import { get, post, put, del, patch } from './request'

/**
 * API 服务基类，提供通用 CRUD 操作
 */
export class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  /**
   * 获取列表
   * @param {object} params - 查询参数
   * @returns {Promise}
   */
  list(params = {}) {
    return get(this.baseUrl, { params })
  }

  /**
   * 获取详情
   * @param {string|number} id - 资源 ID
   * @returns {Promise}
   */
  getDetail(id) {
    return get(`${this.baseUrl}/${id}`)
  }

  /**
   * 创建
   * @param {object} data - 创建数据
   * @returns {Promise}
   */
  create(data) {
    return post(this.baseUrl, data)
  }

  /**
   * 更新
   * @param {string|number} id - 资源 ID
   * @param {object} data - 更新数据
   * @returns {Promise}
   */
  update(id, data) {
    return put(`${this.baseUrl}/${id}`, data)
  }

  /**
   * 删除
   * @param {string|number} id - 资源 ID
   * @returns {Promise}
   */
  delete(id) {
    return del(`${this.baseUrl}/${id}`)
  }

  /**
   * 部分更新（PATCH）
   * @param {string|number} id - 资源 ID
   * @param {object} data - 部分更新数据
   * @returns {Promise}
   */
  patchUpdate(id, data) {
    return patch(`${this.baseUrl}/${id}`, data)
  }
}