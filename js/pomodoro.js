/**
 * DailyPlan - Pomodoro Module
 * 番茄钟功能
 */

const Pomodoro = {
  workTime: 25 * 60,
  restTime: 5 * 60,
  longRestTime: 15 * 60,
  timer: null,
  timeLeft: 25 * 60,
  isRunning: false,
  isRest: false,
  completedPomos: 0,
  currentTask: '',
  
  init() {
    this.loadData();
    this.render();
  },
  
  loadData() {
    const data = Storage.get('pomodoro') || {};
    this.completedPomos = data.completed || 0;
    this.currentTask = data.task || '';
  },
  
  saveData() {
    Storage.set('pomodoro', {
      completed: this.completedPomos,
      task: this.currentTask,
      lastDate: new Date().toDateString()
    });
  },
  
  start(task) {
    if(task) this.currentTask = task;
    this.isRunning = true;
    this.isRest = false;
    this.timeLeft = this.workTime;
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  },
  
  startRest() {
    this.isRunning = true;
    this.isRest = true;
    this.timeLeft = this.completedPomos % 4 === 0 ? this.longRestTime : this.restTime;
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  },
  
  tick() {
    if(this.timeLeft > 0) {
      this.timeLeft--;
      this.render();
    } else {
      this.finish();
    }
  },
  
  finish() {
    clearInterval(this.timer);
    this.isRunning = false;
    if(!this.isRest) {
      this.completedPomos++;
      this.saveData();
      this.playBeep();
      this.notify('番茄钟完成！休息一下吧');
    } else {
      this.notify('休息结束！准备下一个番茄钟');
    }
    this.render();
  },
  
  pause() {
    clearInterval(this.timer);
    this.isRunning = false;
    this.render();
  },
  
  reset() {
    clearInterval(this.timer);
    this.isRunning = false;
    this.timeLeft = this.workTime;
    this.render();
  },
  
  playBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
  },
  
  notify(msg) {
    if('Notification' in window && Notification.permission === 'granted') {
      new Notification('DailyPlan', { body: msg });
    }
  },
  
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  },
  
  render() {
    const el = document.getElementById('pomodoro-display');
    if(!el) return;
    el.textContent = this.formatTime(this.timeLeft);
    el.className = this.isRest ? 'rest' : '';
    
    const status = document.getElementById('pomodoro-status');
    if(status) {
      status.textContent = this.isRunning 
        ? (this.isRest ? '休息中...' : '专注中...')
        : '准备开始';
    }
    
    const count = document.getElementById('pomodoro-count');
    if(count) count.textContent = `今日完成: ${this.completedPomos} 个番茄`;
    
    const progress = document.getElementById('pomodoro-progress');
    if(progress) {
      const total = this.isRest ? this.restTime : this.workTime;
      progress.style.width = `${((total - this.timeLeft) / total * 100)}%`;
    }
  }
};
