/**
 * B-612 Starlit Observatory Application Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // State Storage
  let state = JSON.parse(localStorage.getItem("b612_state")) || {
    roseTarget: "",
    stamps: [false, false, false, false, false, false, false],
    spaceDust: ["Review Chapter 3 math notes", "Draft introductory paragraph"],
    beacons: [],
    timeBlocks: {},
    constellations: []
  };

  function saveState() {
    localStorage.setItem("b612_state", JSON.stringify(state));
  }

  // Quotes Database
  const quotes = [
    { text: "The stars are beautiful, because of a flower that cannot be seen...", author: "Antoine de Saint-Exupéry" },
    { text: "Straight ahead of him, nobody can go very far.", author: "The Little Prince" },
    { text: "It is far more difficult to judge oneself than to judge others.", author: "The King" },
    { text: "For some, who are travelers, the stars are guides.", author: "Antoine de Saint-Exupéry" }
  ];

  // Initialize Landing Page Sky Phase
  const hour = new Date().getHours();
  const portal = document.getElementById("landing-portal");
  const phaseTag = document.getElementById("sky-phase-tag");
  
  if (hour >= 5 && hour < 9) {
    portal.classList.add("sky-dawn");
    phaseTag.innerText = "Dawn Horizon";
  } else if (hour >= 9 && hour < 17) {
    portal.classList.add("sky-zenith");
    phaseTag.innerText = "Stellar Zenith";
  } else if (hour >= 17 && hour < 21) {
    portal.classList.add("sky-twilight");
    phaseTag.innerText = "Twilight Crimson";
  } else {
    portal.classList.add("sky-midnight");
    phaseTag.innerText = "Deep Cosmic Midnight";
  }

  // Set Random Quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("portal-quote").innerText = `"${randomQuote.text}"`;

  // Enter App Transition
  document.getElementById("btn-enter").addEventListener("click", () => {
    portal.style.transform = "scale(1.1)";
    portal.style.opacity = "0";
    setTimeout(() => {
      portal.classList.add("hidden");
      document.getElementById("app-shell").classList.remove("hidden");
    }, 800);
  });

  // Sidebar View Switcher
  const navItems = document.querySelectorAll(".nav-item");
  const viewPanels = document.querySelectorAll(".view-panel");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetView = item.dataset.view;
      navItems.forEach(n => n.classList.remove("active"));
      viewPanels.forEach(p => p.classList.remove("active"));
      
      item.classList.add("active");
      document.getElementById(targetView).classList.add("active");
    });
  });

  // --- LOBBY VIEW LOGIC ---
  const roseInput = document.getElementById("input-rose-target");
  const rosePetals = document.getElementById("rose-petals");
  const starlightGlow = document.getElementById("starlight-glow");

  if (state.roseTarget) {
    roseInput.value = state.roseTarget;
    rosePetals.style.filter = "drop-shadow(0 0 12px #e06c75)";
  }

  document.getElementById("btn-save-rose").addEventListener("click", () => {
    state.roseTarget = roseInput.value;
    saveState();
    rosePetals.style.transform = "rotate(0deg) scale(1.1)";
    setTimeout(() => rosePetals.style.transform = "rotate(-45deg) scale(1)", 300);
  });

  // Render Loyalty Stamps
  const stampsGrid = document.getElementById("stamps-grid");
  function renderStamps() {
    stampsGrid.innerHTML = "";
    let count = 0;
    state.stamps.forEach((stamped, index) => {
      if (stamped) count++;
      const box = document.createElement("div");
      box.className = `stamp-box ${stamped ? 'stamped' : ''}`;
      box.innerText = stamped ? "✦" : "";
      box.addEventListener("click", () => {
        state.stamps[index] = !state.stamps[index];
        saveState();
        renderStamps();
      });
      stampsGrid.appendChild(box);
    });
    document.getElementById("stamp-counter").innerText = `${count} / 5 Stamps for Recharge`;
  }
  renderStamps();

  // Space Dust Collector Logic
  const dustInput = document.getElementById("input-dust-task");
  const dustList = document.getElementById("dust-list");

  function renderDust() {
    dustList.innerHTML = "";
    state.spaceDust.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = "dust-item";
      li.innerHTML = `<span>🌫️ ${task}</span><span class="btn-remove">&times;</span>`;
      li.querySelector(".btn-remove").addEventListener("click", () => {
        state.spaceDust.splice(index, 1);
        saveState();
        renderDust();
      });
      dustList.appendChild(li);
    });
  }
  renderDust();

  document.getElementById("btn-add-dust").addEventListener("click", () => {
    if (dustInput.value.trim()) {
      state.spaceDust.push(dustInput.value.trim());
      dustInput.value = "";
      saveState();
      renderDust();
    }
  });

  // --- PLANNER VIEW LOGIC ---
  const beaconsList = document.getElementById("beacons-list");
  document.getElementById("form-beacon").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("beacon-title").value;
    const date = document.getElementById("beacon-date").value;
    
    state.beacons.push({ id: Date.now(), title, date });
    saveState();
    renderBeacons();
    e.target.reset();
  });

  function renderBeacons() {
    beaconsList.innerHTML = "";
    state.beacons.forEach(b => {
      const div = document.createElement("div");
      div.className = "beacon-card";
      div.innerHTML = `
        <h4>${b.title} (${b.date})</h4>
        <span class="beacon-step step-scout">🔭 Scout (T-7): Scope Guidelines</span>
        <span class="beacon-step step-fueling">🚀 Fueling (T-3): Heavy Focus Blocks</span>
        <span class="beacon-step step-landing">🛬 Landing (T-1): Final Polish</span>
      `;
      beaconsList.appendChild(div);
    });
  }
  renderBeacons();

  // Orbital Flight Timeline (48 Slots)
  const timelineScroll = document.getElementById("timeline-scroll");
  const currentHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 2; j++) {
      const timeStr = `${String(i).padStart(2, '0')}:${j === 0 ? '00' : '30'}`;
      const slot = document.createElement("div");
      slot.className = `time-slot ${i === currentHour && j === 0 ? 'current' : ''}`;
      
      slot.innerHTML = `
        <span class="time-label">${timeStr}</span>
        <select class="slot-select">
          <option value="">-- Open Orbit --</option>
          <option value="king">B-325 King (Admin)</option>
          <option value="geographer">B-328 Geographer (Study)</option>
          <option value="lamplighter">B-329 Lamplighter (Sprint)</option>
          <option value="oasis">Earth Oasis (Rest)</option>
        </select>
        ${i === currentHour && j === 0 ? '<span class="prince-icon">👑 (Prince)</span>' : ''}
      `;
      timelineScroll.appendChild(slot);
    }
  }

  // --- GOAL STUDIO LOGIC ---
  const svgCanvas = document.getElementById("constellation-svg");
  const constellationList = document.getElementById("constellations-list");
  let activeConstellation = null;

  document.getElementById("form-constellation").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("constellation-title").value;
    const milestone = document.getElementById("constellation-milestone").value;

    const newConstellation = {
      id: Date.now(),
      title,
      milestone,
      completed: false
    };

    state.constellations.push(newConstellation);
    saveState();
    renderConstellations();
    e.target.reset();
  });

  function renderConstellations() {
    constellationList.innerHTML = "";
    state.constellations.forEach(c => {
      const div = document.createElement("div");
      div.className = "beacon-card";
      div.style.cursor = "pointer";
      div.innerHTML = `<h4>✨ ${c.title}</h4><p class="card-desc">${c.milestone}</p>`;
      div.addEventListener("click", () => drawConstellation(c));
      constellationList.appendChild(div);
    });
  }

  function drawConstellation(c) {
    activeConstellation = c;
    document.getElementById("active-constellation-title").innerText = c.title;
    document.getElementById("btn-complete-constellation").classList.remove("hidden");

    svgCanvas.innerHTML = `
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <!-- Core Star -->
      <circle cx="300" cy="100" r="8" fill="#f4c430" filter="url(#glow)" />
      <!-- Nodes -->
      <circle cx="180" cy="220" r="6" fill="#61afef" />
      <circle cx="420" cy="220" r="6" fill="#e5c07b" />
      <circle cx="300" cy="320" r="6" fill="#a9a1e1" />
      <!-- Lines -->
      <line x1="300" y1="100" x2="180" y2="220" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="300" y1="100" x2="420" y2="220" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="180" y1="220" x2="300" y2="320" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="420" y1="220" x2="300" y2="320" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
    `;
  }

  document.getElementById("btn-complete-constellation").addEventListener("click", () => {
    if (!activeConstellation) return;
    svgCanvas.querySelectorAll("line").forEach(line => {
      line.setAttribute("stroke", "#f4c430");
      line.setAttribute("filter", "url(#glow)");
    });
    alert("✨ Constellation fully illuminated! The Little Prince sits at the edge of B-612 to admire your sky.");
  });

  renderConstellations();

  // --- VOLCANO TIMER LOGIC ---
  const volcanoModal = document.getElementById("volcano-modal");
  const timerDisplay = document.getElementById("timer-display");
  const btnToggle = document.getElementById("btn-timer-toggle");
  
  let timerInterval = null;
  let timeRemaining = 25 * 60;
  let isRunning = false;

  document.getElementById("btn-open-volcano").addEventListener("click", () => volcanoModal.classList.remove("hidden"));
  document.getElementById("btn-close-volcano").addEventListener("click", () => volcanoModal.classList.add("hidden"));

  document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      timeRemaining = parseInt(btn.dataset.minutes) * 60;
      updateTimerDisplay();
      if (isRunning) toggleTimer();
    });
  });

  function updateTimerDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function toggleTimer() {
    if (isRunning) {
      clearInterval(timerInterval);
      btnToggle.innerText = "Start Session";
      isRunning = false;
    } else {
      const startTime = Date.now();
      const initialRemaining = timeRemaining;

      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeRemaining = initialRemaining - elapsed;

        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          timeRemaining = 0;
          isRunning = false;
          btnToggle.innerText = "Start Session";
          alert("🌋 Focus session complete! Volcano thermal energy replenished.");
        }
        updateTimerDisplay();
      }, 500);

      btnToggle.innerText = "Pause Session";
      isRunning = true;
    }
  }

  btnToggle.addEventListener("click", toggleTimer);
  document.getElementById("btn-timer-reset").addEventListener("click", () => {
    if (isRunning) toggleTimer();
    timeRemaining = 25 * 60;
    updateTimerDisplay();
  });
});
