/**
 * B-612 STARLIT CAFÉ PLANNER ENGINE
 */

// 1. LANDING PAGE DATA (10 Dynamic Nature BGs & Quotes)
const LANDING_DATA = {
  bgImages: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511497584788-8767611136f0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1200&q=80'
  ],
  quotes: [
    { text: "It is the time you have wasted for your rose that makes your rose so important.", author: "The Little Prince" },
    { text: "One sees clearly only with the heart. What is essential is invisible to the eye.", author: "The Little Prince" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "Focus is a matter of deciding what things you're NOT going to do.", author: "John Carmack" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Well done is better than well said.", author: "Benjamin Franklin" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" }
  ]
};

// 2. APP STATE MANAGEMENT
let appState = {
  dailyFocus: localStorage.getItem('b612_dailyFocus') || '',
  stamps: JSON.parse(localStorage.getItem('b612_stamps')) || [false, false, false, false, false, false, false],
  deadlines: JSON.parse(localStorage.getItem('b612_deadlines')) || [],
  timeBlocks: JSON.parse(localStorage.getItem('b612_timeBlocks')) || {},
  goals: JSON.parse(localStorage.getItem('b612_goals')) || [],
  selectedPlannerDate: new Date().toISOString().split('T')[0],
  timer: {
    isRunning: false,
    startTime: null,
    targetDuration: 1500, // 25 mins default
    elapsedBeforePause: 0,
    intervalId: null
  }
};

// 3. INITIALIZATION & ROUTING
document.addEventListener('DOMContentLoaded', () => {
  initLanding();
  setupEventListeners();
  initPlannerDatePicker();
  renderAllViews();
});

function initLanding() {
  const randomImg = LANDING_DATA.bgImages[Math.floor(Math.random() * LANDING_DATA.bgImages.length)];
  const randomQuote = LANDING_DATA.quotes[Math.floor(Math.random() * LANDING_DATA.quotes.length)];

  document.getElementById('landing-bg').style.backgroundImage = `url('${randomImg}')`;
  document.getElementById('quote-text').textContent = `"${randomQuote.text}"`;
  document.getElementById('quote-author').textContent = `- ${randomQuote.author}`;
}

function setupEventListeners() {
  // Start Button Click (Landing -> App Shell)
  document.getElementById('start-btn').addEventListener('click', () => {
    const landing = document.getElementById('landing-page');
    landing.style.opacity = '0';
    setTimeout(() => {
      landing.classList.add('hidden');
      document.getElementById('app-shell').classList.remove('hidden');
    }, 400);
  });

  // Navigation Links
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active-view'));

      item.classList.add('active');
      const target = item.getAttribute('data-target');
      document.getElementById(target).classList.add('active-view');
    });
  });

  // Daily Focus Set
  document.getElementById('save-focus-btn').addEventListener('click', saveDailyFocus);

  // Add Deadline Form
  document.getElementById('add-deadline-form').addEventListener('submit', handleAddDeadline);

  // Add Goal Form
  document.getElementById('add-goal-form').addEventListener('submit', handleAddGoal);

  // Timer Modal Controls
  document.getElementById('quick-timer-btn').addEventListener('click', () => {
    document.getElementById('timer-modal').classList.remove('hidden');
  });
  document.getElementById('close-timer').addEventListener('click', () => {
    document.getElementById('timer-modal').classList.add('hidden');
  });
  document.getElementById('timer-start-btn').addEventListener('click', toggleTimer);
  document.getElementById('timer-reset-btn').addEventListener('click', resetTimer);

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const time = parseInt(e.target.getAttribute('data-time'), 10);
      setTimerPreset(time);
    });
  });
}

function initPlannerDatePicker() {
  const picker = document.getElementById('planner-date-picker');
  picker.value = appState.selectedPlannerDate;
  picker.addEventListener('change', (e) => {
    appState.selectedPlannerDate = e.target.value;
    renderTimeBlockGrid();
  });
}

function renderAllViews() {
  renderLobby();
  renderHabitStamps();
  renderDeadlinesAndBeacons();
  renderTimeBlockGrid();
  renderGoals();
}

// 4. LOBBY LOGIC
function saveDailyFocus() {
  const val = document.getElementById('daily-focus-input').value.trim();
  if (!val) return;
  appState.dailyFocus = val;
  localStorage.setItem('b612_dailyFocus', val);
  renderLobby();
}

function renderLobby() {
  const display = document.getElementById('saved-focus-text');
  if (appState.dailyFocus) {
    display.textContent = `🎯 ${appState.dailyFocus}`;
    display.classList.remove('hidden');
  } else {
    display.classList.add('hidden');
  }

  // Active Beacons in Lobby
  const list = document.getElementById('lobby-beacon-list');
  list.innerHTML = '';
  
  const todayStr = new Date().toISOString().split('T')[0];
  let activeCount = 0;

  appState.deadlines.forEach(dl => {
    dl.beacons.forEach(b => {
      if (b.targetDate === todayStr && !b.completed) {
        activeCount++;
        const li = document.createElement('li');
        li.className = `beacon-item ${b.stage}`;
        li.innerHTML = `<span class="beacon-title">${b.title}</span><span class="beacon-date">Due Today</span>`;
        list.appendChild(li);
      }
    });
  });

  if (activeCount === 0) {
    list.innerHTML = `<li style="font-size: 0.85rem; color: var(--text-muted);">No navigation beacons active for today. You're on smooth skies! ☕</li>`;
  }
}

function renderHabitStamps() {
  const grid = document.getElementById('stamp-grid');
  grid.innerHTML = '';
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  days.forEach((day, idx) => {
    const box = document.createElement('div');
    const isStamped = appState.stamps[idx];
    box.className = `stamp-box ${isStamped ? 'stamped' : ''}`;
    box.innerHTML = `<span class="star">${isStamped ? '✦' : '✧'}</span><span>${day}</span>`;
    box.addEventListener('click', () => {
      appState.stamps[idx] = !appState.stamps[idx];
      localStorage.setItem('b612_stamps', JSON.stringify(appState.stamps));
      renderHabitStamps();
    });
    grid.appendChild(box);
  });
}

// 5. BACKWARDS-PLANNING ENGINE & DEADLINES
function handleAddDeadline(e) {
  e.preventDefault();
  const title = document.getElementById('dl-title').value.trim();
  const dueDateStr = document.getElementById('dl-date').value;
  const weight = document.getElementById('dl-weight').value;

  if (!title || !dueDateStr) return;

  const newDeadline = createAssessmentWithBeacons(title, dueDateStr, weight);
  appState.deadlines.push(newDeadline);
  localStorage.setItem('b612_deadlines', JSON.stringify(appState.deadlines));

  e.target.reset();
  renderDeadlinesAndBeacons();
  renderLobby();
}

function createAssessmentWithBeacons(title, dueDateStr, weight) {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  const deadlineId = 'dl_' + Date.now();
  const beacons = [];

  const getOffsetDate = (offset) => {
    const d = new Date(dueDate);
    d.setDate(d.getDate() - offset);
    return d.toISOString().split('T')[0];
  };

  // Scout Beacon (T-7 Days)
  if (diffDays >= 7) {
    beacons.push({
      id: `b_scout_${deadlineId}`,
      title: `🔭 Scout Beacon: Outline & Scope [${title}]`,
      targetDate: getOffsetDate(7),
      stage: 'scout',
      completed: false
    });
  }

  // Fueling Beacon (T-3 Days)
  if (diffDays >= 4) {
    beacons.push({
      id: `b_fuel_${deadlineId}`,
      title: `☕ Fueling Beacon: Deep Work Draft on [${title}]`,
      targetDate: getOffsetDate(3),
      stage: 'fueling',
      completed: false
    });
  }

  // Landing Beacon (T-24 Hours)
  if (diffDays >= 1) {
    beacons.push({
      id: `b_land_${deadlineId}`,
      title: `🛬 Landing Beacon: Final Polish for [${title}]`,
      targetDate: getOffsetDate(1),
      stage: 'landing',
      completed: false
    });
  }

  return { id: deadlineId, title, dueDate: dueDateStr, weight, beacons };
}

function renderDeadlinesAndBeacons() {
  const feedList = document.getElementById('beacon-feed-list');
  feedList.innerHTML = '';

  const dateWorkload = {};

  appState.deadlines.forEach(dl => {
    const w = dl.weight === 'high' ? 5 : (dl.weight === 'medium' ? 3 : 1);
    dateWorkload[dl.dueDate] = (dateWorkload[dl.dueDate] || 0) + w;

    dl.beacons.forEach(b => {
      dateWorkload[b.targetDate] = (dateWorkload[b.targetDate] || 0) + 1;

      const li = document.createElement('li');
      li.className = `beacon-item ${b.stage}`;
      li.innerHTML = `
        <span class="beacon-title">${b.title}</span>
        <span class="beacon-date">Scheduled: ${b.targetDate}</span>
      `;
      feedList.appendChild(li);
    });
  });

  // Check Overload Warning
  const isOverloaded = Object.values(dateWorkload).some(score => score >= 6);
  const warningBanner = document.getElementById('overload-warning');
  if (isOverloaded) {
    warningBanner.classList.remove('hidden');
  } else {
    warningBanner.classList.add('hidden');
  }
}

// 6. 30-MINUTE TIME BLOCK GRID (48 Slots)
function renderTimeBlockGrid() {
  const grid = document.getElementById('time-block-grid');
  grid.innerHTML = '';

  const targetDate = appState.selectedPlannerDate;
  const dayData = appState.timeBlocks[targetDate] || {};

  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const mins = i % 2 === 0 ? '00' : '30';
    const timeLabel = `${hour}:${mins}`;

    const slot = document.createElement('div');
    slot.className = 'time-slot';

    const label = document.createElement('span');
    label.className = 'time-label';
    label.textContent = timeLabel;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'slot-input';
    input.value = dayData[i] || '';
    input.placeholder = i % 2 === 0 ? '☕ Plan block...' : '';

    input.addEventListener('change', (e) => {
      if (!appState.timeBlocks[targetDate]) appState.timeBlocks[targetDate] = {};
      appState.timeBlocks[targetDate][i] = e.target.value;
      localStorage.setItem('b612_timeBlocks', JSON.stringify(appState.timeBlocks));
    });

    slot.appendChild(label);
    slot.appendChild(input);
    grid.appendChild(slot);
  }
}

// 7. GOAL STUDIO LOGIC
function handleAddGoal(e) {
  e.preventDefault();
  const goalTitle = document.getElementById('goal-title').value.trim();
  const monthlyTarget = document.getElementById('monthly-target').value.trim();
  const dailyAction = document.getElementById('daily-action').value.trim();

  if (!goalTitle || !monthlyTarget || !dailyAction) return;

  const newGoal = { id: 'g_' + Date.now(), goalTitle, monthlyTarget, dailyAction };
  appState.goals.push(newGoal);
  localStorage.setItem('b612_goals', JSON.stringify(appState.goals));

  e.target.reset();
  renderGoals();
}

function renderGoals() {
  const container = document.getElementById('goal-tree-container');
  container.innerHTML = '';

  if (appState.goals.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No constellations mapped yet. Enter your vision above!</p>`;
    return;
  }

  appState.goals.forEach(g => {
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div class="goal-title">🌌 ${g.goalTitle}</div>
      <div class="goal-sub">🎯 Monthly Target: ${g.monthlyTarget}</div>
      <div class="goal-action">⚡ Daily Action: ${g.dailyAction}</div>
    `;
    container.appendChild(card);
  });
}

// 8. SPEED TIMER (TAB-SLEEP PROOF LOGIC)
function toggleTimer() {
  if (appState.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  appState.timer.isRunning = true;
  appState.timer.startTime = Date.now();
  document.getElementById('timer-start-btn').textContent = 'Pause';
  document.getElementById('timer-mascot').textContent = '⚡';

  appState.timer.intervalId = setInterval(updateTimerTick, 200);
}

function pauseTimer() {
  appState.timer.isRunning = false;
  clearInterval(appState.timer.intervalId);
  appState.timer.elapsedBeforePause += Math.floor((Date.now() - appState.timer.startTime) / 1000);
  document.getElementById('timer-start-btn').textContent = 'Resume';
  document.getElementById('timer-mascot').textContent = '☕';
}

function resetTimer() {
  clearInterval(appState.timer.intervalId);
  appState.timer.isRunning = false;
  appState.timer.elapsedBeforePause = 0;
  document.getElementById('timer-start-btn').textContent = 'Start Session';
  document.getElementById('timer-mascot').textContent = '☕';
  renderTimerClock(appState.timer.targetDuration);
}

function setTimerPreset(seconds) {
  resetTimer();
  appState.timer.targetDuration = seconds;
  renderTimerClock(seconds);
}

function updateTimerTick() {
  const now = Date.now();
  const currentSessionElapsed = Math.floor((now - appState.timer.startTime) / 1000);
  const totalElapsed = appState.timer.elapsedBeforePause + currentSessionElapsed;
  const remaining = appState.timer.targetDuration - totalElapsed;

  if (remaining <= 0) {
    clearInterval(appState.timer.intervalId);
    appState.timer.isRunning = false;
    renderTimerClock(0);
    alert('Sprint Complete! Take a steam break ☕');
    resetTimer();
  } else {
    renderTimerClock(remaining);
  }
}

function renderTimerClock(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  document.getElementById('timer-clock').textContent = `${m}:${s}`;
}
