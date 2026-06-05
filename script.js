const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const taskText = document.getElementById("taskText");
const medicineList = document.getElementById("medicineList");
const medicineForm = document.getElementById("medicineForm");
const medicineText = document.getElementById("medicineText");
const todayDate = document.getElementById("todayDate");
const contrastToggle = document.getElementById("contrastToggle");
const serviceMessage = document.getElementById("serviceMessage");
const serviceButtons = document.querySelectorAll(".service-button");

const STORAGE_KEY = "hverdagsHjelpen";

const defaultState = {
  highContrast: false,
  tasks: [
    { id: crypto.randomUUID(), text: "Ta morgenmedisin kl. 09:00", done: false },
    { id: crypto.randomUUID(), text: "Legetime kl. 12:30", done: false },
    { id: crypto.randomUUID(), text: "Ring en pårørende i ettermiddag", done: false },
  ],
  medicines: [
    { id: crypto.randomUUID(), text: "Blodtrykksmedisin - morgen" },
    { id: crypto.randomUUID(), text: "Vitamin D - kveld" },
  ],
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.tasks) && Array.isArray(saved.medicines)) {
      return {
        highContrast: Boolean(saved.highContrast),
        tasks: saved.tasks,
        medicines: saved.medicines,
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return defaultState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setDate() {
  const now = new Date();
  todayDate.textContent = now.toLocaleDateString("no-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function applyContrast() {
  document.body.classList.toggle("high-contrast", state.highContrast);
  contrastToggle.setAttribute("aria-pressed", String(state.highContrast));
  contrastToggle.textContent = state.highContrast ? "Vanlig kontrast" : "Stor kontrast";
}

function createDeleteButton(label, id, type) {
  const button = document.createElement("button");
  button.className = "item-button";
  button.type = "button";
  button.textContent = "Fjern";
  button.setAttribute("aria-label", `${label}: fjern`);
  button.addEventListener("click", () => {
    state[type] = state[type].filter((item) => item.id !== id);
    saveState();
    render();
  });
  return button;
}

function renderTasks() {
  taskList.innerHTML = "";

  if (state.tasks.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Ingen punkter lagt inn ennå.";
    taskList.append(empty);
    return;
  }

  state.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = task.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.id = `task-${task.id}`;
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveState();
      renderTasks();
    });

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    item.append(checkbox, label, createDeleteButton(task.text, task.id, "tasks"));
    taskList.append(item);
  });
}

function renderMedicines() {
  medicineList.innerHTML = "";

  if (state.medicines.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Ingen medisiner lagt inn ennå.";
    medicineList.append(empty);
    return;
  }

  state.medicines.forEach((medicine) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = medicine.text;
    item.append(text, createDeleteButton(medicine.text, medicine.id, "medicines"));
    medicineList.append(item);
  });
}

function render() {
  renderTasks();
  renderMedicines();
  applyContrast();
}

function addItem(event, input, type) {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  state[type].push(
    type === "tasks"
      ? { id: crypto.randomUUID(), text, done: false }
      : { id: crypto.randomUUID(), text }
  );
  input.value = "";
  saveState();
  render();
}

taskForm.addEventListener("submit", (event) => addItem(event, taskText, "tasks"));
medicineForm.addEventListener("submit", (event) => addItem(event, medicineText, "medicines"));

contrastToggle.addEventListener("click", () => {
  state.highContrast = !state.highContrast;
  saveState();
  applyContrast();
});

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    serviceMessage.textContent = button.dataset.message;
  });
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("sw.js?v=1").catch(() => {});
}

setDate();
render();
