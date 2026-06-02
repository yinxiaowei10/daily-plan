/**
 * DailyPlan - Planner Module
 * 周计划与复盘核心逻辑
 */

const Planner = {
  currentWeekOffset: 0,
  
  init() {
    this.render();
    this.bindEvents();
  },
  
  getToday() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  getWeekKey(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset * 7);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-W${this.getWeekNumber(d)}`;
  },
  
  getCurrentWeekKey() {
    return this.getWeekKey(this.currentWeekOffset);
  },
  
  getWeekNumber(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  },
  
  getWeekDays(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset * 7);
    const day = d.getDay() || 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + 1);
    
    const days = [];
    for(let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,
        dayName: ['周一','周二','周三','周四','周五','周六','周日'][i],
        index: i
      });
    }
    return days;
  },
  
  getWeekPlans(weekKey) {
    return Storage.get('weekPlans_' + weekKey) || {};
  },
  
  saveWeekPlans(weekKey, plans) {
    Storage.set('weekPlans_' + weekKey, plans);
  },
  
  getDayTodos(dayIndex) {
    const weekKey = this.getCurrentWeekKey();
    const plans = this.getWeekPlans(weekKey);
    return plans[dayIndex] || [];
  },
  
  saveDayTodos(dayIndex, todos) {
    const weekKey = this.getCurrentWeekKey();
    const plans = this.getWeekPlans(weekKey);
    plans[dayIndex] = todos;
    this.saveWeekPlans(weekKey, plans);
  },
  
  getReview(weekKey) {
    return Storage.get('review_' + weekKey) || {};
  },
  
  saveReview(weekKey, review) {
    Storage.set('review_' + weekKey, review);
  },
  
  render() {
    const app = document.getElementById('app');
    if(!app) return;
    
    const weekKey = this.getCurrentWeekKey();
    const days = this.getWeekDays(this.currentWeekOffset);
    const weekLabel = this.currentWeekOffset === 0 ? '本周' : 
                      this.currentWeekOffset === -1 ? '上周' : 
                      this.currentWeekOffset === 1 ? '下周' : weekKey;
    
    app.innerHTML = `
      <header class="header">
        <div class="brand">
          <div class="brand-icon">📋</div>
          <div class="brand-text">
            <h1>DailyPlan</h1>
            <p>周计划与复盘</p>
          </div>
        </div>
        <div class="datetime">
          <div class="time" id="clock">${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</div>
          <div class="date">${weekLabel} · ${days[0].date} - ${days[6].date}</div>
        </div>
      </header>
      
      <div class="container">
        <div class="toolbar">
          <button onclick="Planner.prevWeek()">◀ 上周</button>
          <button onclick="Planner.thisWeek()">本周</button>
          <button onclick="Planner.nextWeek()">下周 ▶</button>
          <div class="spacer"></div>
          <button onclick="Export.exportMarkdown()">📄 导出 Markdown</button>
          <button onclick="Export.exportJSON()">💾 备份 JSON</button>
          <button onclick="Sync.syncToFeishu()">☁️ 同步飞书</button>
        </div>
        
        <div class="row">
          <div class="card">
            <div class="card-title">
              <span class="icon" style="background:#E85D04">⏱️</span>
              番茄钟
            </div>
            <div class="pomodoro">
              <div class="pomodoro-timer" id="pomodoro-display">25:00</div>
              <div class="pomodoro-status" id="pomodoro-status">准备开始</div>
              <div class="pomodoro-task" id="pomodoro-task" contenteditable placeholder="输入当前任务..."></div>
              <div class="pomodoro-btns">
                <button class="primary" onclick="Pomodoro.start(document.getElementById('pomodoro-task').textContent)">开始专注</button>
                <button onclick="Pomodoro.pause()">暂停</button>
                <button class="rest-btn" onclick="Pomodoro.startRest()">休息</button>
                <button onclick="Pomodoro.reset()">重置</button>
              </div>
              <div class="pomodoro-progress"><div class="pomodoro-progress-bar" id="pomodoro-progress" style="width:0%"></div></div>
              <div class="pomodoro-stats">
                <span id="pomodoro-count">今日完成: 0 个番茄</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-title">
              <span class="icon" style="background:#4A7C59">📊</span>
              今日状态
            </div>
            <div id="today-status">
              <div class="status-item">
                <span class="status-label">待办任务</span>
                <span class="status-value" id="today-todos">0</span>
              </div>
              <div class="status-item">
                <span class="status-label">已完成</span>
                <span class="status-value" id="today-done">0</span>
              </div>
              <div class="status-item">
                <span class="status-label">完成率</span>
                <span class="status-value" id="today-rate">0%</span>
              </div>
              <div class="status-item">
                <span class="status-label">专注时长</span>
                <span class="status-value" id="today-focus">0 分钟</span>
              </div>
            </div>
            <div class="quote-box" id="quote-box">专注当下，成就未来</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">
            <span class="icon" style="background:#5A78B4">📅</span>
            本周计划
          </div>
          <div class="week-grid">
            ${days.map(d => `
              <div class="day-column" data-day="${d.index}">
                <div class="day-header">
                  <span class="day-name">${d.dayName}</span>
                  <span class="day-date">${d.date}</span>
                </div>
                <div class="day-todos" id="day-todos-${d.index}"></div>
                <div class="day-add">
                  <input type="text" placeholder="+ 添加任务" 
                         onkeydown="if(event.key==='Enter')Planner.addTodo(${d.index},this.value);this.value=''">
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">
            <span class="icon" style="background:#C85A8E">📝</span>
            周复盘
          </div>
          <div class="review-grid">
            <div class="review-item">
              <label>本周成就</label>
              <textarea id="review-achievements" placeholder="记录本周的重要成果..."
                        onchange="Planner.saveReview()"></textarea>
            </div>
            <div class="review-item">
              <label>遇到的问题</label>
              <textarea id="review-problems" placeholder="记录遇到的困难和挑战..."
                        onchange="Planner.saveReview()"></textarea>
            </div>
            <div class="review-item">
              <label>下周改进</label>
              <textarea id="review-improvements" placeholder="计划下周如何改进..."
                        onchange="Planner.saveReview()"></textarea>
            </div>
            <div class="review-item">
              <label>心情评分 (1-10)</label>
              <input type="range" id="review-mood" min="1" max="10" value="5"
                     onchange="Planner.saveReview()">
              <span id="mood-value">5</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.renderTodos();
    this.loadReview();
    this.updateTodayStatus();
    Pomodoro.init();
  },
  
  renderTodos() {
    const weekKey = this.getCurrentWeekKey();
    const plans = this.getWeekPlans(weekKey);
    
    for(let i = 0; i < 7; i++) {
      const container = document.getElementById(`day-todos-${i}`);
      if(!container) continue;
      
      const todos = plans[i] || [];
      container.innerHTML = todos.map((t, idx) => `
        <div class="todo-item ${t.done ? 'done' : ''}">
          <input type="checkbox" ${t.done ? 'checked' : ''} 
                 onchange="Planner.toggleTodo(${i}, ${idx})">
          <span contenteditable onblur="Planner.editTodo(${i}, ${idx}, this.textContent)">${t.text}</span>
          <button class="todo-delete" onclick="Planner.deleteTodo(${i}, ${idx})">×</button>
        </div>
      `).join('');
    }
  },
  
  addTodo(dayIndex, text) {
    if(!text.trim()) return;
    const todos = this.getDayTodos(dayIndex);
    todos.push({ text: text.trim(), done: false });
    this.saveDayTodos(dayIndex, todos);
    this.renderTodos();
    this.updateTodayStatus();
  },
  
  toggleTodo(dayIndex, todoIndex) {
    const todos = this.getDayTodos(dayIndex);
    if(todos[todoIndex]) {
      todos[todoIndex].done = !todos[todoIndex].done;
      this.saveDayTodos(dayIndex, todos);
      this.renderTodos();
      this.updateTodayStatus();
    }
  },
  
  editTodo(dayIndex, todoIndex, text) {
    const todos = this.getDayTodos(dayIndex);
    if(todos[todoIndex]) {
      todos[todoIndex].text = text;
      this.saveDayTodos(dayIndex, todos);
    }
  },
  
  deleteTodo(dayIndex, todoIndex) {
    const todos = this.getDayTodos(dayIndex);
    todos.splice(todoIndex, 1);
    this.saveDayTodos(dayIndex, todos);
    this.renderTodos();
    this.updateTodayStatus();
  },
  
  loadReview() {
    const weekKey = this.getCurrentWeekKey();
    const review = this.getReview(weekKey);
    
    const achievements = document.getElementById('review-achievements');
    const problems = document.getElementById('review-problems');
    const improvements = document.getElementById('review-improvements');
    const mood = document.getElementById('review-mood');
    const moodValue = document.getElementById('mood-value');
    
    if(achievements) achievements.value = review.achievements || '';
    if(problems) problems.value = review.problems || '';
    if(improvements) improvements.value = review.improvements || '';
    if(mood) {
      mood.value = review.mood || 5;
      if(moodValue) moodValue.textContent = mood.value;
    }
  },
  
  saveReview() {
    const weekKey = this.getCurrentWeekKey();
    const review = {
      achievements: document.getElementById('review-achievements')?.value || '',
      problems: document.getElementById('review-problems')?.value || '',
      improvements: document.getElementById('review-improvements')?.value || '',
      mood: document.getElementById('review-mood')?.value || 5
    };
    this.saveReview(weekKey, review);
  },
  
  updateTodayStatus() {
    const today = new Date().getDay() || 7;
    const dayIndex = today - 1;
    const todos = this.getDayTodos(dayIndex);
    
    const total = todos.length;
    const done = todos.filter(t => t.done).length;
    const rate = total > 0 ? Math.round(done / total * 100) : 0;
    
    const pomo = Storage.get('pomodoro') || {};
    const focus = (pomo.completed || 0) * 25;
    
    const elTotal = document.getElementById('today-todos');
    const elDone = document.getElementById('today-done');
    const elRate = document.getElementById('today-rate');
    const elFocus = document.getElementById('today-focus');
    
    if(elTotal) elTotal.textContent = total;
    if(elDone) elDone.textContent = done;
    if(elRate) elRate.textContent = rate + '%';
    if(elFocus) elFocus.textContent = focus + ' 分钟';
  },
  
  prevWeek() {
    this.currentWeekOffset--;
    this.render();
  },
  
  nextWeek() {
    this.currentWeekOffset++;
    this.render();
  },
  
  thisWeek() {
    this.currentWeekOffset = 0;
    this.render();
  },
  
  bindEvents() {
    // 时钟更新
    setInterval(() => {
      const clock = document.getElementById('clock');
      if(clock) {
        clock.textContent = new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit', minute: '2-digit'
        });
      }
    }, 1000);
    
    // 心情滑块
    document.addEventListener('input', (e) => {
      if(e.target.id === 'review-mood') {
        const value = document.getElementById('mood-value');
        if(value) value.textContent = e.target.value;
      }
    });
  }
};
