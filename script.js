// Get elements
const taskTitle = document.getElementById("taskTitle");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

const remainingText = document.getElementById("remainingText");
const languageBtn = document.getElementById("languageBtn");

const filterButtons = document.querySelectorAll(".filter-btn");

// Load saved data
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let language = localStorage.getItem("language") || "en";
let currentFilter = "all";
let editingTaskId = null;


// Translation data
const translations = {
  en: {
    title: "TaskFlow",
    subtitle: "Organize your day, one task at a time.",
    taskTitle: "Task Title",
    titlePlaceholder: "Enter your task...",
    priority: "Priority",
    dueDate: "Due Date",
    addTask: "+ Add Task",
    updateTask: "Update Task",
    search: "Search tasks...",
    all: "All",
    active: "Active",
    completed: "Completed",
    clearCompleted: "Clear completed",
    noTasks: "No tasks found",
    emptyMessage: "Add a task to get started.",
    noSearchResults: "No matching tasks found.",
    high: "High",
    medium: "Medium",
    low: "Low",
    edit: "Edit",
    delete: "Delete",
    tasksRemaining: "tasks remaining",
    taskRemaining: "task remaining",
    confirmDelete: "Delete this task?"
  },

  bn: {
    title: "টাস্কফ্লো",
    subtitle: "একটি একটি করে আপনার দিনের কাজগুলো গুছিয়ে নিন।",
    taskTitle: "কাজের নাম",
    titlePlaceholder: "আপনার কাজ লিখুন...",
    priority: "অগ্রাধিকার",
    dueDate: "শেষ তারিখ",
    addTask: "+ কাজ যোগ করুন",
    updateTask: "কাজ আপডেট করুন",
    search: "কাজ খুঁজুন...",
    all: "সব",
    active: "চলমান",
    completed: "সম্পন্ন",
    clearCompleted: "সম্পন্ন কাজ মুছুন",
    noTasks: "কোনো কাজ পাওয়া যায়নি",
    emptyMessage: "শুরু করার জন্য একটি কাজ যোগ করুন।",
    noSearchResults: "কোনো মিল পাওয়া যায়নি।",
    high: "উচ্চ",
    medium: "মাঝারি",
    low: "কম",
    edit: "এডিট",
    delete: "মুছুন",
    tasksRemaining: "টি কাজ বাকি",
    taskRemaining: "টি কাজ বাকি",
    confirmDelete: "এই কাজটি মুছে ফেলবেন?"
  }
};


// Apply language
function updateLanguage() {
  const t = translations[language];

  document.documentElement.lang = language === "bn" ? "bn" : "en";

  document.getElementById("appTitle").textContent = t.title;
  document.getElementById("appSubtitle").textContent = t.subtitle;

  document.getElementById("titleLabel").textContent = t.taskTitle;
  taskTitle.placeholder = t.titlePlaceholder;

  document.getElementById("priorityLabel").textContent = t.priority;
  document.getElementById("dueDateLabel").textContent = t.dueDate;

  document.getElementById("searchInput").placeholder = t.search;

  document.getElementById("allBtn").textContent = t.all;
  document.getElementById("activeBtn").textContent = t.active;
  document.getElementById("completedBtn").textContent = t.completed;

  clearCompletedBtn.textContent = t.clearCompleted;

  languageBtn.textContent = language === "en" ? "বাংলা" : "English";

  taskPriority.options[0].textContent = t.high;
  taskPriority.options[1].textContent = t.medium;
  taskPriority.options[2].textContent = t.low;

  addTaskBtn.textContent = editingTaskId
    ? t.updateTask
    : t.addTask;

  renderTasks();
}


// Save tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Create unique ID
function createId() {
  return Date.now().toString();
}


// Add or update task
function saveTask() {

  const title = taskTitle.value.trim();

  if (!title) {
    taskTitle.focus();
    return;
  }

  if (editingTaskId) {

    const task = tasks.find(item => item.id === editingTaskId);

    if (task) {
      task.title = title;
      task.priority = taskPriority.value;
      task.dueDate = taskDate.value;
    }

    editingTaskId = null;

  } else {

    const newTask = {
      id: createId(),
      title: title,
      priority: taskPriority.value,
      dueDate: taskDate.value,
      completed: false
    };

    tasks.unshift(newTask);
  }

  saveTasks();
  clearForm();
  updateLanguage();
}


// Clear form
function clearForm() {
  taskTitle.value = "";
  taskPriority.value = "Medium";
  taskDate.value = "";
}


// Delete task
function deleteTask(id) {

  const t = translations[language];

  if (!confirm(t.confirmDelete)) {
    return;
  }

  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  renderTasks();
}


// Edit task
function editTask(id) {

  const task = tasks.find(item => item.id === id);

  if (!task) return;

  taskTitle.value = task.title;
  taskPriority.value = task.priority;
  taskDate.value = task.dueDate;

  editingTaskId = id;

  const t = translations[language];

  addTaskBtn.textContent = t.updateTask;

  taskTitle.focus();
}


// Toggle task completion
function toggleTask(id) {

  const task = tasks.find(item => item.id === id);

  if (!task) return;

  task.completed = !task.completed;

  saveTasks();
  renderTasks();
}


// Format date
function formatDate(date) {

  if (!date) return "";

  const parts = date.split("-");

  if (language === "bn") {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}


// Get filtered tasks
function getFilteredTasks() {

  let filtered = [...tasks];

  // Apply status filter
  if (currentFilter === "active") {
    filtered = filtered.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    filtered = filtered.filter(task => task.completed);
  }

  // Apply search
  const search = searchInput.value.trim().toLowerCase();

  if (search) {
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(search)
    );
  }

  return filtered;
}


// Render task list
function renderTasks() {

  const t = translations[language];

  const filteredTasks = getFilteredTasks();

  taskList.innerHTML = "";

  // Show empty state
  if (filteredTasks.length === 0) {

    emptyState.style.display = "block";

    document.getElementById("emptyTitle").textContent = t.noTasks;

    document.getElementById("emptyMessage").textContent =
      searchInput.value.trim()
        ? t.noSearchResults
        : t.emptyMessage;

  } else {

    emptyState.style.display = "none";
  }


  filteredTasks.forEach(task => {

    const taskElement = document.createElement("div");

    taskElement.className =
      `task ${task.completed ? "completed" : ""}`;

    const priorityClass =
      task.priority.toLowerCase() === "high"
        ? "priority-high"
        : task.priority.toLowerCase() === "medium"
          ? "priority-medium"
          : "priority-low";


    const priorityText =
      task.priority === "High"
        ? t.high
        : task.priority === "Medium"
          ? t.medium
          : t.low;


    taskElement.innerHTML = `
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? "checked" : ""}
        aria-label="${task.title}"
      >

      <div class="task-content">

        <div class="task-title">
          ${escapeHtml(task.title)}
        </div>

        <div class="task-info">

          <span class="badge ${priorityClass}">
            ${priorityText}
          </span>

          ${
            task.dueDate
              ? `<span class="badge date-badge">
                  📅 ${formatDate(task.dueDate)}
                </span>`
              : ""
          }

        </div>

      </div>

      <div class="task-actions">

        <button
          class="action-btn edit-btn"
          title="${t.edit}"
        >
          ✎
        </button>

        <button
          class="action-btn delete-btn"
          title="${t.delete}"
        >
          🗑
        </button>

      </div>
    `;


    // Checkbox event
    taskElement
      .querySelector(".task-checkbox")
      .addEventListener("change", () => {
        toggleTask(task.id);
      });


    // Edit event
    taskElement
      .querySelector(".edit-btn")
      .addEventListener("click", () => {
        editTask(task.id);
      });


    // Delete event
    taskElement
      .querySelector(".delete-btn")
      .addEventListener("click", () => {
        deleteTask(task.id);
      });


    taskList.appendChild(taskElement);
  });


  updateRemainingCounter();
}


// Remaining task counter
function updateRemainingCounter() {

  const t = translations[language];

  const remaining = tasks.filter(task => !task.completed).length;

  remainingText.textContent =
    `${remaining} ${
      remaining === 1
        ? t.taskRemaining
        : t.tasksRemaining
    }`;
}


// Clear completed tasks
function clearCompleted() {

  tasks = tasks.filter(task => !task.completed);

  saveTasks();
  renderTasks();
}


// Escape HTML for task titles
function escapeHtml(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// Filter buttons
filterButtons.forEach(button => {

  button.addEventListener("click", () => {

    filterButtons.forEach(btn =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    currentFilter = button.dataset.filter;

    renderTasks();
  });
});


// Search
searchInput.addEventListener("input", renderTasks);


// Add / update button
addTaskBtn.addEventListener("click", saveTask);


// Press Enter to add task
taskTitle.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    saveTask();
  }
});


// Clear completed
clearCompletedBtn.addEventListener("click", clearCompleted);


// Language switch
languageBtn.addEventListener("click", () => {

  language = language === "en" ? "bn" : "en";

  localStorage.setItem("language", language);

  updateLanguage();
});


// Initial load
updateLanguage();