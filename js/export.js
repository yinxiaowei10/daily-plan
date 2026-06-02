/**
 * DailyPlan - Export Module
 * 数据导出功能：Markdown / JSON / 图片
 */

const Export = {
  /**
   * 导出为 Markdown 格式
   */
  toMarkdown() {
    const weekKey = Planner.getCurrentWeekKey();
    const plans = Storage.get('weekPlans_' + weekKey) || {};
    const review = Storage.get('review_' + weekKey) || {};
    const pomo = Storage.get('pomodoro') || {};
    
    let md = `# 周计划与复盘\n\n`;
    md += `**周期**: ${weekKey}\n`;
    md += `**导出时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    // 番茄钟统计
    md += `## 番茄钟统计\n\n`;
    md += `- 本周完成: ${pomo.completed || 0} 个番茄\n`;
    md += `- 专注时长: ${Math.round((pomo.completed || 0) * 25 / 60 * 10) / 10} 小时\n\n`;
    
    // 每日计划
    md += `## 每日计划\n\n`;
    const days = ['周一','周二','周三','周四','周五','周六','周日'];
    days.forEach((day, i) => {
      const dayPlans = plans[i] || [];
      md += `### ${day}\n\n`;
      if(dayPlans.length === 0) {
        md += '- 暂无计划\n';
      } else {
        dayPlans.forEach(p => {
          const status = p.done ? '✅' : '⬜';
          md += `- ${status} ${p.text}\n`;
        });
      }
      md += '\n';
    });
    
    // 周复盘
    md += `## 周复盘\n\n`;
    md += `### 本周成就\n${review.achievements || '暂无'}\n\n`;
    md += `### 遇到的问题\n${review.problems || '暂无'}\n\n`;
    md += `### 下周改进\n${review.improvements || '暂无'}\n\n`;
    md += `### 心情评分\n${review.mood || '暂无'}\n\n`;
    
    return md;
  },
  
  /**
   * 导出为 JSON 格式
   */
  toJSON() {
    return JSON.stringify(Storage.exportAll(), null, 2);
  },
  
  /**
   * 下载文件
   */
  download(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  /**
   * 导出 Markdown 文件
   */
  exportMarkdown() {
    const md = this.toMarkdown();
    const weekKey = Planner.getCurrentWeekKey();
    this.download(md, `周计划_${weekKey}.md`, 'text/markdown');
  },
  
  /**
   * 导出 JSON 备份
   */
  exportJSON() {
    const json = this.toJSON();
    const date = new Date().toISOString().split('T')[0];
    this.download(json, `dailyplan_backup_${date}.json`, 'application/json');
  },
  
  /**
   * 导入 JSON 备份
   */
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          Storage.importAll(data);
          resolve(true);
        } catch(err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },
  
  /**
   * 生成分享图片（使用 html2canvas 或原生 Canvas）
   */
  async generateImage(elementId) {
    const el = document.getElementById(elementId);
    if(!el) return null;
    
    // 简单实现：使用 Canvas 绘制
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rect = el.getBoundingClientRect();
    
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // 背景
    ctx.fillStyle = '#FAF7F2';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // 标题
    ctx.fillStyle = '#2C2416';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('DailyPlan 周计划', 20, 40);
    
    // 内容摘要
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#6B5E4E';
    const weekKey = Planner.getCurrentWeekKey();
    ctx.fillText(`周期: ${weekKey}`, 20, 70);
    
    // 下载
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `周计划_${weekKey}.png`;
    a.click();
    
    return canvas;
  }
};
