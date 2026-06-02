/**
 * DailyPlan - Storage Module
 * 本地数据存储管理
 */

const Storage = {
  prefix: 'dailyplan_',
  
  get(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch(e) {
      console.error('Storage get error:', e);
      return null;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch(e) {
      console.error('Storage set error:', e);
      return false;
    }
  },
  
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },
  
  exportAll() {
    const data = {};
    for(let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if(key && key.startsWith(this.prefix)) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  },
  
  importAll(data) {
    Object.entries(data).forEach(([key, value]) => {
      if(key.startsWith(this.prefix)) {
        localStorage.setItem(key, value);
      }
    });
  },
  
  clear() {
    const keys = [];
    for(let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if(key && key.startsWith(this.prefix)) keys.push(key);
    }
    keys.forEach(k => localStorage.removeItem(k));
  }
};
