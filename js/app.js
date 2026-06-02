/**
 * DailyPlan - Main App
 * 应用入口
 */

document.addEventListener('DOMContentLoaded', () => {
  // 请求通知权限
  if('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // 初始化
  Planner.init();
  
  // 金句轮播
  const quotes = [
    '专注当下，成就未来',
    '不积跬步，无以至千里',
    '行动是治愈恐惧的良药',
    '今天的努力，是明天的实力',
    '保持专注，静待花开',
    '每一次番茄钟，都是向目标迈进的一步',
    '效率不是做更多，而是做更重要的事',
    '休息是为了走更长远的路',
    '计划是行动的蓝图，复盘是进步的阶梯',
    '最好的投资，就是投资自己'
  ];
  let quoteIndex = 0;
  setInterval(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    const el = document.getElementById('quote-box');
    if(el) el.textContent = quotes[quoteIndex];
  }, 30000);
  
  console.log('DailyPlan v2.0 loaded');
});
