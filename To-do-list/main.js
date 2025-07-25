// Enhanced To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeElements() {
        // Form elements
        this.addBtn = document.getElementById("addToDo-btn");
        this.input = document.getElementById("input");
        this.prioritySelect = document.getElementById("priority");
        this.dueDateInput = document.getElementById("due-date");
        this.categoryInput = document.getElementById("category");
        
        // Filter elements
        this.searchInput = document.getElementById("search");
        this.filterPriority = document.getElementById("filter-priority");
        this.filterStatus = document.getElementById("filter-status");
        this.clearCompletedBtn = document.getElementById("clear-completed-btn");
        
        // Display elements
        this.listContainer = document.getElementById("list-container");
        this.totalTasksSpan = document.getElementById("total-tasks");
        this.completedTasksSpan = document.getElementById("completed-tasks");
        this.pendingTasksSpan = document.getElementById("pending-tasks");
    }

    bindEvents() {
        // Add task
        this.addBtn.addEventListener("click", () => this.addTask());
        this.input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.addTask();
        });
        
        // Search and filter
        this.searchInput.addEventListener("input", () => this.renderTasks());
        this.filterPriority.addEventListener("change", () => this.renderTasks());
        this.filterStatus.addEventListener("change", () => this.renderTasks());
        
        // Clear completed tasks
        this.clearCompletedBtn.addEventListener("click", () => this.clearCompletedTasks());
    }

    addTask() {
        const text = this.input.value.trim();
        if (!text) return;

        const task = {
            id: this.taskIdCounter++,
            text: text,
            priority: this.prioritySelect.value,
            dueDate: this.dueDateInput.value,
            category: this.categoryInput.value.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.clearForm();
        this.renderTasks();
        this.updateStats();
    }

    clearForm() {
        this.input.value = "";
        this.dueDateInput.value = "";
        this.categoryInput.value = "";
        this.prioritySelect.value = "medium";
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    clearCompletedTasks() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        // Search filter
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.text.toLowerCase().includes(searchTerm) ||
                (task.category && task.category.toLowerCase().includes(searchTerm))
            );
        }

        // Priority filter
        const priorityFilter = this.filterPriority.value;
        if (priorityFilter !== "all") {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }

        // Status filter
        const statusFilter = this.filterStatus.value;
        if (statusFilter === "completed") {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (statusFilter === "pending") {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }

        // Sort by priority (high -> medium -> low) and then by creation date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed; // Completed tasks go to bottom
            }
            if (a.priority !== b.priority) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        return filteredTasks;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.listContainer.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <p style="font-size: 18px; margin: 0;">No tasks found</p>
                    <p style="font-size: 14px; margin: 10px 0 0 0;">Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        this.listContainer.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join("");
        
        // Bind events to task buttons
        filteredTasks.forEach(task => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            const completeBtn = taskElement.querySelector(".complete-btn");
            const deleteBtn = taskElement.querySelector(".delete-btn");
            
            completeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggleTask(task.id);
            });
            
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.deleteTask(task.id);
            });
            
            // Click on task to toggle completion
            taskElement.addEventListener("click", () => this.toggleTask(task.id));
        });
    }

    createTaskHTML(task) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const dueDateText = task.dueDate ? this.formatDate(task.dueDate) : "";
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority" data-task-id="${task.id}">
                <div class="task-header">
                    <p class="task-text">${this.escapeHtml(task.text)}</p>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
                
                <div class="task-details">
                    <div>
                        ${task.category ? `<span class="task-category">${this.escapeHtml(task.category)}</span>` : ''}
                    </div>
                    <div>
                        ${dueDateText ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">${dueDateText}</span>` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="task-btn complete-btn">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="task-btn delete-btn">Delete</button>
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        this.totalTasksSpan.textContent = `Total: ${totalTasks}`;
        this.completedTasksSpan.textContent = `Completed: ${completedTasks}`;
        this.pendingTasksSpan.textContent = `Pending: ${pendingTasks}`;
    }

    // Local Storage Methods
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
    }

    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }

    getNextTaskId() {
        const saved = localStorage.getItem('taskIdCounter');
        return saved ? parseInt(saved) : 1;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
