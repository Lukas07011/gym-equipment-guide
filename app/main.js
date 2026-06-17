const form = document.querySelector("#profileForm");
const generateButton = document.querySelector("#generateButton");
const completeButton = document.querySelector("#completeButton");
const resetButton = document.querySelector("#resetButton");
const tabs = document.querySelectorAll(".tab");

const state = {
  plan: [],
  completed: JSON.parse(localStorage.getItem("fitstart_completed") || "[]"),
  profile: JSON.parse(localStorage.getItem("fitstart_profile") || "null"),
};

const goalCopy = {
  fatLoss: "减脂入门",
  shape: "塑形紧致",
  energy: "改善体能",
};

const conditionTips = {
  normal: "保持可说话的训练强度，动作稳定优先。",
  knee: "减少跳跃和深蹲幅度，优先选择低冲击动作。",
  back: "避免卷腹和快速扭转，核心动作保持慢速。",
  neck: "训练前加入肩颈放松，推举类动作降低强度。",
};

const templates = {
  none: [
    ["动态热身", "开合步、肩绕环、髋部活动", "4 分钟"],
    ["下肢激活", "椅子深蹲 3 组 x 10 次", "低冲击"],
    ["核心稳定", "平板支撑 3 组 x 20 秒", "慢呼吸"],
    ["全身循环", "登山者慢速 3 组 x 30 秒", "可降速"],
  ],
  band: [
    ["动态热身", "肩绕环、弹力带拉伸", "4 分钟"],
    ["背部激活", "弹力带划船 3 组 x 12 次", "肩胛发力"],
    ["臀腿训练", "弹力带臀桥 3 组 x 12 次", "顶峰停顿"],
    ["核心稳定", "死虫式 3 组 x 10 次", "慢速"],
  ],
  dumbbell: [
    ["动态热身", "髋部活动、徒手深蹲", "4 分钟"],
    ["力量基础", "哑铃杯式深蹲 3 组 x 10 次", "轻重量"],
    ["上肢训练", "哑铃划船 3 组 x 12 次", "左右各做"],
    ["核心稳定", "农夫行走 4 组 x 30 秒", "躯干直立"],
  ],
};

function getProfile() {
  return Object.fromEntries(new FormData(form).entries());
}

function buildPlan(profile) {
  const frequency = Number(profile.frequency);
  const trainingDays = new Set([1, 3, 5, 6, 2].slice(0, frequency));
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const baseMoves = templates[profile.equipment];

  return days.map((day, index) => {
    const dayNumber = index + 1;
    const isTraining = trainingDays.has(dayNumber);
    const isMobility = !isTraining && (dayNumber === 4 || dayNumber === 7);

    if (!isTraining) {
      return {
        day,
        title: isMobility ? "恢复拉伸" : "轻活动日",
        type: isMobility ? "恢复" : "轻活动",
        minutes: isMobility ? 12 : 20,
        moves: isMobility
          ? [["肩颈放松", "2 轮 x 45 秒", "慢呼吸"], ["髋屈肌拉伸", "左右各 45 秒", "不憋气"]]
          : [["饭后散步", "20 分钟", "轻松"], ["靠墙站立", "2 组 x 60 秒", "调整体态"]],
      };
    }

    const scale = Number(profile.duration) <= 15 ? 3 : Number(profile.duration) >= 35 ? 5 : 4;
    return {
      day,
      title: `${goalCopy[profile.goal]}训练`,
      type: "训练",
      minutes: Number(profile.duration),
      moves: baseMoves.slice(0, scale).map((move) => [move[0], move[1], move[2]]),
    };
  });
}

function todayIndex() {
  if (!state.plan.length) return -1;
  return state.plan.findIndex((item) => item.type === "训练" && !state.completed.includes(item.day));
}

function renderStats() {
  const done = state.completed.length;
  const rate = state.plan.length ? Math.round((done / state.plan.filter((d) => d.type === "训练").length) * 100) : 0;
  document.querySelector("#doneCount").textContent = done;
  document.querySelector("#streakCount").textContent = done;
  document.querySelector("#weekRate").textContent = `${Math.min(rate, 100)}%`;
}

function renderToday() {
  const index = todayIndex();
  const item = index >= 0 ? state.plan[index] : state.plan.find((day) => day.type === "训练");
  const movesList = document.querySelector("#movesList");
  movesList.innerHTML = "";

  if (!item) {
    document.querySelector("#todayTitle").textContent = "生成你的第一周训练";
    document.querySelector("#todayMeta").textContent = "3 分钟完成设置";
    document.querySelector("#workoutType").textContent = "等待生成";
    document.querySelector("#workoutName").textContent = "你的低门槛训练会出现在这里";
    document.querySelector("#workoutHint").textContent = "选择画像后生成计划";
    completeButton.disabled = true;
    return;
  }

  document.querySelector("#todayTitle").textContent = item.title;
  document.querySelector("#todayMeta").textContent = `${item.day} · ${item.minutes} 分钟`;
  document.querySelector("#workoutType").textContent = `${item.type} · ${item.day}`;
  document.querySelector("#workoutName").textContent = item.title;
  document.querySelector("#workoutHint").textContent = conditionTips[state.profile.condition];
  completeButton.disabled = state.completed.includes(item.day);

  item.moves.forEach(([name, meta, badge]) => {
    const li = document.createElement("li");
    li.innerHTML = `<div><div class="moveName">${name}</div><div class="moveMeta">${meta}</div></div><span class="moveBadge">${badge}</span>`;
    movesList.appendChild(li);
  });
}

function renderWeek() {
  const weekList = document.querySelector("#weekList");
  weekList.innerHTML = "";
  state.plan.forEach((item) => {
    const done = state.completed.includes(item.day);
    const row = document.createElement("article");
    row.className = `weekItem ${done ? "dayDone" : ""}`;
    row.innerHTML = `<div><div class="dayTitle">${item.day} · ${item.title}</div><div class="dayMeta">${item.minutes} 分钟 · ${item.moves.length} 个动作</div></div><span class="dayBadge">${done ? "已完成" : item.type}</span>`;
    weekList.appendChild(row);
  });
}

function renderInsight() {
  const done = state.completed.length;
  const title = document.querySelector("#insightTitle");
  const text = document.querySelector("#insightText");

  if (!state.plan.length) return;
  if (done === 0) {
    title.textContent = "计划已生成，先完成第一练";
    text.textContent = "你现在最重要的不是追求强度，而是降低启动成本。完成一次训练后，系统会根据进度给出下一步建议。";
  } else if (done < 3) {
    title.textContent = "你已经开始建立训练惯性";
    text.textContent = "保持当前频次即可。若训练后明显酸痛，下一次优先完成热身和恢复日，不急着加量。";
  } else {
    title.textContent = "本周表现稳定，可以小幅升级";
    text.textContent = "下周可以把单次训练增加 5 分钟，或在动作末尾增加 1 组，但仍以动作质量为第一优先级。";
  }
}

function render() {
  renderStats();
  renderToday();
  renderWeek();
  renderInsight();
}

function save() {
  localStorage.setItem("fitstart_completed", JSON.stringify(state.completed));
  localStorage.setItem("fitstart_profile", JSON.stringify(state.profile));
}

generateButton.addEventListener("click", () => {
  state.profile = getProfile();
  state.plan = buildPlan(state.profile);
  state.completed = [];
  save();
  localStorage.setItem("fitstart_plan", JSON.stringify(state.plan));
  render();
});

completeButton.addEventListener("click", () => {
  const index = todayIndex();
  const item = state.plan[index >= 0 ? index : 0];
  if (!item || state.completed.includes(item.day)) return;
  state.completed.push(item.day);
  save();
  render();
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem("fitstart_completed");
  localStorage.removeItem("fitstart_profile");
  localStorage.removeItem("fitstart_plan");
  state.plan = [];
  state.completed = [];
  state.profile = null;
  render();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.view}View`).classList.add("active");
  });
});

const savedPlan = JSON.parse(localStorage.getItem("fitstart_plan") || "[]");
if (state.profile) {
  Object.entries(state.profile).forEach(([key, value]) => {
    const input = form.elements[key];
    if (input) input.value = value;
  });
  state.plan = savedPlan.length ? savedPlan : buildPlan(state.profile);
}

render();
