const state = {
  shell: "cmd",
  device: "WORKSTATION-01",
  selectedScript: null,
  queue: [],
};

const processes = [
  { name: "chrome.exe", cpu: "12%", ram: "1.4 GB" },
  { name: "code.exe", cpu: "8%", ram: "980 MB" },
  { name: "ForgeAgent.exe", cpu: "1%", ram: "84 MB" },
  { name: "discord.exe", cpu: "3%", ram: "420 MB" },
  { name: "steam.exe", cpu: "2%", ram: "310 MB" },
];

const software = [
  { id: "node", name: "Node.js 22 LTS", desc: "Runtime · winget" },
  { id: "git", name: "Git for Windows", desc: "VCS · silent" },
  { id: "vscode", name: "VS Code", desc: "IDE · enterprise" },
  { id: "docker", name: "Docker Desktop", desc: "Containers" },
  { id: "python", name: "Python 3.12", desc: "Dev toolkit" },
  { id: "7zip", name: "7-Zip", desc: "Archives" },
  { id: "chrome", name: "Google Chrome", desc: "Browser" },
  { id: "ffmpeg", name: "FFmpeg", desc: "Media CLI" },
  { id: "obs", name: "OBS Studio", desc: "Streaming" },
];

const files = [
  { icon: "📁", name: "Desktop", size: "—", date: "10.11.2026" },
  { icon: "📁", name: "Documents", size: "—", date: "08.11.2026" },
  { icon: "📁", name: "Projects", size: "—", date: "10.11.2026" },
  { icon: "📄", name: "notes.txt", size: "12 KB", date: "09.11.2026" },
  { icon: "📄", name: "deploy.ps1", size: "4 KB", date: "07.11.2026" },
  { icon: "📦", name: "backup.zip", size: "248 MB", date: "05.11.2026" },
];

const scripts = [
  { id: "cleanup", title: "Temp cleanup", desc: "Очистка %TEMP% и корзины" },
  { id: "devstack", title: "Install Dev Stack", desc: "Git + Node + VS Code + Docker" },
  { id: "harden", title: "Harden workstation", desc: "Firewall rules + updates check" },
  { id: "report", title: "Health report", desc: "CPU/RAM/Disk snapshot → JSON" },
];

const replies = {
  cmd: {
    help: "Доступные команды: dir, systeminfo, ipconfig, tasklist, netstat, whoami, hostname, cls",
    dir: " Directory of C:\\Users\\admin\n\n10.11.2026  14:02    <DIR>          Desktop\n10.11.2026  12:40    <DIR>          Documents\n10.11.2026  09:11    <DIR>          Projects\n09.11.2026  21:18            12,480 notes.txt",
    systeminfo: "Host Name: WORKSTATION-01\nOS Name: Microsoft Windows 11 Pro\nSystem Type: x64-based PC\nTotal Physical Memory: 32,678 MB",
    "ipconfig /all": "Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . . : 192.168.1.42\n   Subnet Mask . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . : 192.168.1.1",
    tasklist: "Image Name                     PID\nchrome.exe                    4820\ncode.exe                      2194\nForgeAgent.exe                1102",
    "netstat -ano": "Proto  Local Address          State\nTCP    192.168.1.42:443       ESTABLISHED\nTCP    127.0.0.1:8188         LISTENING",
    whoami: "workstation-01\\admin",
    hostname: "WORKSTATION-01",
  },
};

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.hidden = true), 2200);
}

function appendConsole(text, cls = "") {
  const out = document.getElementById("consoleOut");
  const line = document.createElement("div");
  if (cls) line.className = cls;
  line.textContent = text;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function setPrompt() {
  const map = {
    cmd: "C:\\Users\\admin>",
    ps: "PS C:\\Users\\admin>",
    bash: "admin@workstation:~$",
  };
  document.getElementById("prompt").textContent = map[state.shell];
}

function runCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) return;
  appendConsole(`${document.getElementById("prompt").textContent} ${cmd}`);
  if (cmd === "cls" || cmd === "clear") {
    document.getElementById("consoleOut").innerHTML = "";
    return;
  }
  const table = replies.cmd;
  const key = Object.keys(table).find((k) => k.toLowerCase() === cmd.toLowerCase());
  if (key) appendConsole(table[key], "ok");
  else appendConsole(`[Forge] Simulated output for: ${cmd}\nCommand accepted by agent.`, "warn");
}

function renderProcesses() {
  const tbody = document.querySelector("#procTable tbody");
  tbody.innerHTML = processes
    .map(
      (p, i) => `<tr>
      <td>${p.name}</td><td>${p.cpu}</td><td>${p.ram}</td>
      <td><button data-kill="${i}">Kill</button></td>
    </tr>`
    )
    .join("");
  tbody.querySelectorAll("[data-kill]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.kill);
      toast(`Процесс ${processes[i].name} остановлен (demo)`);
      processes.splice(i, 1);
      renderProcesses();
    });
  });
}

function renderSoftware(filter = "") {
  const grid = document.getElementById("softGrid");
  const items = software.filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()));
  grid.innerHTML = items
    .map(
      (s) => `<article class="soft-card" data-id="${s.id}">
        <strong>${s.name}</strong>
        <span>${s.desc}</span>
        <button>Установить</button>
      </article>`
    )
    .join("");
  grid.querySelectorAll(".soft-card button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".soft-card");
      const name = card.querySelector("strong").textContent;
      deploy(name);
      card.classList.add("installing");
      btn.textContent = "В очереди…";
    });
  });
}

function deploy(name) {
  const id = Date.now();
  state.queue.unshift({ id, name, progress: 0 });
  renderQueue();
  toast(`Установка: ${name}`);
  const tick = setInterval(() => {
    const item = state.queue.find((q) => q.id === id);
    if (!item) return clearInterval(tick);
    item.progress += 8 + Math.random() * 12;
    if (item.progress >= 100) {
      item.progress = 100;
      clearInterval(tick);
      setTimeout(() => {
        state.queue = state.queue.filter((q) => q.id !== id);
        renderQueue();
        toast(`${name} установлен`);
      }, 600);
    }
    renderQueue();
  }, 350);
}

function renderQueue() {
  const root = document.getElementById("deployQueue");
  if (!state.queue.length) {
    root.innerHTML = `<div class="muted">Очередь пуста — выберите пакет выше</div>`;
    return;
  }
  root.innerHTML = state.queue
    .map(
      (q) => `<div class="queue-item">
        <div>
          <strong>${q.name}</strong>
          <div class="bar"><i style="width:${Math.min(100, q.progress)}%"></i></div>
        </div>
        <span>${Math.min(100, Math.floor(q.progress))}%</span>
      </div>`
    )
    .join("");
}

function renderFiles() {
  document.getElementById("fileList").innerHTML = files
    .map(
      (f) => `<div class="file-row">
        <span>${f.icon}</span><strong>${f.name}</strong><span>${f.size}</span><span>${f.date}</span>
      </div>`
    )
    .join("");
}

function renderScripts() {
  const root = document.getElementById("scriptList");
  root.innerHTML = scripts
    .map(
      (s) => `<label class="script ${state.selectedScript === s.id ? "selected" : ""}">
        <input type="radio" name="script" value="${s.id}" ${state.selectedScript === s.id ? "checked" : ""} />
        <div><strong>${s.title}</strong><small>${s.desc}</small></div>
        <span class="muted">.ps1</span>
      </label>`
    )
    .join("");
  root.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      state.selectedScript = input.value;
      renderScripts();
    });
  });
}

const titles = {
  overview: "Обзор системы",
  console: "Удалённая консоль",
  software: "Установка ПО",
  files: "Файлы",
  scripts: "Скрипты и playbooks",
  security: "Безопасность",
};

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const panel = btn.dataset.panel;
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    document.getElementById(`panel-${panel}`).classList.add("active");
    document.getElementById("panelTitle").textContent = titles[panel];
  });
});

document.querySelectorAll(".device").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".device").forEach((d) => d.classList.remove("active"));
    btn.classList.add("active");
    state.device = btn.querySelector("strong").textContent;
    document.getElementById("devicePath").textContent = `Fleet / ${state.device}`;
    toast(`Сессия: ${state.device}`);
  });
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.shell = btn.dataset.shell;
    setPrompt();
  });
});

document.getElementById("consoleForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("consoleCmd");
  runCommand(input.value);
  input.value = "";
});

document.querySelectorAll(".shortcuts [data-cmd]").forEach((btn) => {
  btn.addEventListener("click", () => runCommand(btn.dataset.cmd));
});

document.querySelectorAll("[data-action]").forEach((btn) => {
  btn.addEventListener("click", () => toast(`Действие «${btn.textContent.trim()}» отправлено агенту`));
});

document.getElementById("softSearch").addEventListener("input", (e) => renderSoftware(e.target.value));
document.getElementById("runScript").addEventListener("click", () => {
  if (!state.selectedScript) return toast("Выберите скрипт");
  const s = scripts.find((x) => x.id === state.selectedScript);
  toast(`Запущен: ${s.title}`);
  appendConsole(`\n[playbook] ${s.title}… done`, "ok");
});
document.getElementById("btnRefresh").addEventListener("click", () => {
  const cpu = 20 + Math.floor(Math.random() * 45);
  document.getElementById("cpuVal").textContent = `${cpu}%`;
  document.querySelector(".metric .meter i").style.width = `${cpu}%`;
  toast("Метрики обновлены");
});
document.getElementById("btnConnect").addEventListener("click", () => toast("Канал mTLS активен"));

appendConsole("RemoteForge agent connected.", "ok");
appendConsole("Session encrypted · WORKSTATION-01", "ok");
appendConsole('Type "help" or use shortcuts below.\n');
setPrompt();
renderProcesses();
renderSoftware();
renderQueue();
renderFiles();
renderScripts();
