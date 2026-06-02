/**
 * DailyPlan - Sync Module
 * 飞书多维表格同步功能
 */

const Sync = {
  config: {
    appId: localStorage.getItem('feishu_app_id') || '',
    appSecret: localStorage.getItem('feishu_app_secret') || '',
    appToken: localStorage.getItem('feishu_app_token') || '',
    tableId: localStorage.getItem('feishu_table_id') || ''
  },
  
  /**
   * 保存配置
   */
  saveConfig(config) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('feishu_app_id', this.config.appId);
    localStorage.setItem('feishu_app_secret', this.config.appSecret);
    localStorage.setItem('feishu_app_token', this.config.appToken);
    localStorage.setItem('feishu_table_id', this.config.tableId);
  },
  
  /**
   * 获取 tenant_access_token
   */
  async getToken() {
    const resp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.config.appId,
        app_secret: this.config.appSecret
      })
    });
    const data = await resp.json();
    if(data.code !== 0) throw new Error(data.msg);
    return data.tenant_access_token;
  },
  
  /**
   * 列出表格记录
   */
  async listRecords() {
    const token = await this.getToken();
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`;
    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    if(data.code !== 0) throw new Error(data.msg);
    return data.data?.items || [];
  },
  
  /**
   * 创建记录
   */
  async createRecord(fields) {
    const token = await this.getToken();
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });
    const data = await resp.json();
    if(data.code !== 0) throw new Error(data.msg);
    return data.data;
  },
  
  /**
   * 更新记录
   */
  async updateRecord(recordId, fields) {
    const token = await this.getToken();
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.config.appToken}/tables/${this.config.tableId}/records/${recordId}`;
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });
    const data = await resp.json();
    if(data.code !== 0) throw new Error(data.msg);
    return data.data;
  },
  
  /**
   * 同步本周数据到飞书
   */
  async syncToFeishu() {
    const weekKey = Planner.getCurrentWeekKey();
    const plans = Storage.get('weekPlans_' + weekKey) || {};
    const review = Storage.get('review_' + weekKey) || {};
    const pomo = Storage.get('pomodoro') || {};
    
    // 构建字段数据（根据你的多维表格字段调整）
    const fields = {
      '周期': weekKey,
      '番茄钟完成数': pomo.completed || 0,
      '周总结': review.achievements || '',
      '问题': review.problems || '',
      '改进': review.improvements || '',
      '心情': review.mood || '',
      '同步时间': new Date().toLocaleString('zh-CN')
    };
    
    try {
      const records = await this.listRecords();
      const existing = records.find(r => r.fields['周期'] === weekKey);
      
      if(existing) {
        await this.updateRecord(existing.record_id, fields);
        return { success: true, action: 'update' };
      } else {
        await this.createRecord(fields);
        return { success: true, action: 'create' };
      }
    } catch(err) {
      return { success: false, error: err.message };
    }
  },
  
  /**
   * 从飞书同步数据
   */
  async syncFromFeishu() {
    try {
      const records = await this.listRecords();
      // 这里可以实现从飞书读取并合并到本地的逻辑
      return { success: true, records: records.length };
    } catch(err) {
      return { success: false, error: err.message };
    }
  },
  
  /**
   * 检查配置是否完整
   */
  isConfigured() {
    return this.config.appId && this.config.appSecret && 
           this.config.appToken && this.config.tableId;
  }
};
