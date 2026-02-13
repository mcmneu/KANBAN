// Apple-Style Kanban Board Application - Enhanced with Categories
// Enhanced with Apple Design Language, Interactions, and Category Management

class AppleKanbanApp {
    constructor() {
        this.tasks = [];
        this.categories = [];
        this.currentTaskId = null;
        this.user = null;
        this.db = null;
        this.auth = null;
        this.unsubscribe = null;
        this.outlookConnected = false;
        this.activeFilter = 'all';
        this.currentView = 'board'; // 'board' or 'timeline'
        this.timelineFilter = 'all'; // 'all', 'today', 'week'
        
        this.initFirebase();
        this.initDefaultCategories();
    }

    initDefaultCategories() {
        const defaultCategories = [
            { name: 'Arbeit', color: 'var(--apple-blue)', id: 'work' },
            { name: 'Persönlich', color: 'var(--apple-green)', id: 'personal' },
            { name: 'Dringend', color: 'var(--apple-red)', id: 'urgent' },
            { name: 'Meeting', color: 'var(--apple-purple)', id: 'meeting' },
            { name: 'Entwicklung', color: 'var(--apple-orange)', id: 'development' },
            { name: 'Design', color: 'var(--apple-pink)', id: 'design' },
            { name: 'Recherche', color: 'var(--apple-teal)', id: 'research' },
            { name: 'Planung', color: 'var(--apple-indigo)', id: 'planning' },
            { name: 'Review', color: 'var(--apple-mint)', id: 'review' },
            { name: 'Testing', color: 'var(--apple-cyan)', id: 'testing' }
        ];

        const savedCategories = localStorage.getItem('kanban-categories');
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        } else {
            this.categories = defaultCategories;
            this.saveCategories();
        }
    }

    async initFirebase() {
        try {
            if (typeof firebase !== 'undefined' && window.kanbanConfig?.mode === 'firebase') {
                this.db = firebase.firestore();
                this.auth = firebase.auth();
                
                // Setup auth state listener
                this.auth.onAuthStateChanged((user) => {
                    if (user) {
                        this.user = user;
                        this.showApp();
                        this.loadTasksFromFirebase();
                        this.loadCategoriesFromFirebase();
                    } else {
                        this.user = null;
                        this.showAppleLogin();
                    }
                });
            } else {
                console.log('Running in local mode');
                this.initLocalStorage();
            }
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            this.initLocalStorage();
        }
    }

    initLocalStorage() {
        this.tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];
        this.showApp();
        this.renderTasks();
        this.updateTaskCounts();
        this.addSampleTasks();
    }

    showAppleLogin() {
        document.body.innerHTML = `
            <div class="login-container">
                <div class="login-form">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: var(--apple-blue); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                            📋
                        </div>
                        <h2 class="sf-display">Kanban Board</h2>
                        <p class="sf-text" style="color: var(--apple-secondary-label); margin-top: 8px;">Organisieren Sie Ihre Aufgaben</p>
                    </div>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <input type="email" id="email" placeholder="E-Mail-Adresse" required class="sf-text">
                        </div>
                        <div class="form-group">
                            <input type="password" id="password" placeholder="Passwort" required class="sf-text">
                        </div>
                        <button type="submit" class="btn btn-primary sf-text">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                <path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Anmelden
                        </button>
                        <button type="button" id="register-btn" class="btn btn-secondary sf-text">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="2"/>
                                <path d="M8 1v6M8 9v6M1 8h6M9 8h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Registrieren
                        </button>
                    </form>
                    
                    <div class="divider">
                        <span>oder</span>
                    </div>
                    
                    <div class="offline-mode">
                        <a href="#" id="offline-mode" class="offline-link sf-text">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="3" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                <rect x="6" y="11" width="4" height="1" fill="currentColor"/>
                                <path d="M4 13h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            Offline-Modus verwenden
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners with Apple-style interactions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            this.login(email, password);
        });

        document.getElementById('register-btn').addEventListener('click', (e) => {
            this.addAppleButtonFeedback(e.target);
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            if (email && password) {
                this.register(email, password);
            } else {
                this.showAppleAlert('Bitte geben Sie E-Mail und Passwort ein.');
            }
        });

        document.getElementById('offline-mode').addEventListener('click', (e) => {
            e.preventDefault();
            this.addAppleButtonFeedback(e.target);
            setTimeout(() => {
                this.initLocalStorage();
            }, 150);
        });
    }

    showApp() {
        document.body.innerHTML = `
            <div class="app-container">
                <header class="app-header">
                    <h1 class="sf-display">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="28" height="28" rx="6" fill="currentColor" fill-opacity="0.1"/>
                            <path d="M7 9h14v2H7V9zm0 4h14v2H7v-2zm0 4h10v2H7v-2z" fill="currentColor"/>
                        </svg>
                        Kanban Board
                    </h1>
                    <div class="nav-tabs">
                        <button class="nav-tab active" data-view="board">
                            <span class="nav-tab-icon">📋</span>
                            Board
                        </button>
                        <button class="nav-tab" data-view="timeline">
                            <span class="nav-tab-icon">📅</span>
                            Timeline
                        </button>
                    </div>
                    <div class="header-controls">
                        ${this.user ? `
                            <div class="user-info sf-text">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M2 14c0-3.5 2.5-6 6-6s6 2.5 6 6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                                ${this.user.email}
                            </div>
                            <button id="logout-btn" class="btn btn-secondary sf-text">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 6l4 2-4 2M14 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Abmelden
                            </button>
                        ` : ''}
                        <button id="sync-outlook" class="btn btn-primary sf-text">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 4l7-2 7 2v8l-7 2-7-2V4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 2v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            Outlook Sync
                        </button>
                        <button id="add-task" class="btn btn-success sf-text">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Neue Aufgabe
                        </button>
                    </div>
                </header>

                <!-- Category Filter Bar -->
                <div class="category-filter-bar">
                    <span class="category-filter-label sf-text">Filter:</span>
                    <div class="category-filter all active" data-category="all">
                        <span>Alle</span>
                    </div>
                    ${this.categories.map(category => `
                        <div class="category-filter" data-category="${category.id}">
                            <div class="category-dot" style="background-color: ${category.color};"></div>
                            <span>${category.name}</span>
                        </div>
                    `).join('')}
                </div>

                <main class="kanban-board">
                    <div class="column" data-status="todo">
                        <div class="column-header">
                            <h2 class="sf-display">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M6 10h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                                Zu erledigen
                            </h2>
                            <span class="task-count sf-text">0</span>
                        </div>
                        <div class="task-list" id="todo-list"></div>
                    </div>

                    <div class="column" data-status="in-progress">
                        <div class="column-header">
                            <h2 class="sf-display">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M10 6v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                    <path d="M6 10h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                                In Bearbeitung
                            </h2>
                            <span class="task-count sf-text">0</span>
                        </div>
                        <div class="task-list" id="in-progress-list"></div>
                    </div>

                    <div class="column" data-status="review">
                        <div class="column-header">
                            <h2 class="sf-display">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                                    <circle cx="10" cy="10" r="3" fill="currentColor"/>
                                </svg>
                                Review
                            </h2>
                            <span class="task-count sf-text">0</span>
                        </div>
                        <div class="task-list" id="review-list"></div>
                    </div>

                    <div class="column" data-status="done">
                        <div class="column-header">
                            <h2 class="sf-display">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M6 10l2 2 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Erledigt
                            </h2>
                            <span class="task-count sf-text">0</span>
                        </div>
                        <div class="task-list" id="done-list"></div>
                    </div>
                </main>

                <!-- Timeline View -->
                <div id="timeline-view" class="timeline-container" style="display: none;">
                    <div class="timeline-header">
                        <h2 class="sf-display">Timeline</h2>
                        <div class="timeline-controls">
                            <div class="timeline-filter-container">
                                <div class="category-filter-bar" id="timeline-category-filter">
                                    <span class="category-filter-label sf-text">Filter:</span>
                                    <div class="category-filter all active" data-category="all">
                                        <span>Alle</span>
                                    </div>
                                    ${this.categories.map(category => `
                                        <div class="category-filter" data-category="${category.id}">
                                            <div class="category-dot" style="background-color: ${category.color};"></div>
                                            <span>${category.name}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="timeline-view-options">
                                <button class="timeline-view-btn active" data-view="all">
                                    <span class="timeline-view-icon">📅</span>
                                    Alle
                                </button>
                                <button class="timeline-view-btn" data-view="today">
                                    <span class="timeline-view-icon">📍</span>
                                    Heute
                                </button>
                                <button class="timeline-view-btn" data-view="week">
                                    <span class="timeline-view-icon">📊</span>
                                    Woche
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="timeline-content">
                        <div class="timeline-scroll-container">
                            <div class="timeline-track" id="timeline-track">
                                <div class="timeline-axis"></div>
                                <!-- Timeline items will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="timeline-empty" id="timeline-empty" style="display: none;">
                        <div class="empty-state">
                            <div class="empty-icon">
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="32" cy="32" r="24" fill="currentColor" fill-opacity="0.1"/>
                                    <path d="M32 20v24l16 8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                    <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </div>
                            <h3 class="sf-display">Keine Termine gefunden</h3>
                            <p class="sf-text">Fügen Sie Aufgaben mit Fälligkeitsdaten hinzu, um sie in der Timeline zu sehen.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Apple-Style Task Modal -->
            <div id="task-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title" class="sf-display">Neue Aufgabe erstellen</h3>
                        <span class="close">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </span>
                    </div>
                    <form id="task-form">
                        <div class="form-group">
                            <label class="sf-text">Titel:</label>
                            <input type="text" id="task-title" required class="sf-text">
                        </div>
                        <div class="form-group">
                            <label class="sf-text">Beschreibung:</label>
                            <textarea id="task-description" rows="3" class="sf-text"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="sf-text">Kategorie:</label>
                            <div class="category-input-group" style="position: relative;">
                                <input type="text" id="task-category" placeholder="Kategorie eingeben oder auswählen" class="sf-text">
                                <div class="category-suggestions" id="category-suggestions"></div>
                            </div>
                            <div class="category-color-picker" id="category-color-picker">
                                <div class="color-option" data-color="var(--apple-blue)" style="background-color: var(--apple-blue);"></div>
                                <div class="color-option" data-color="var(--apple-green)" style="background-color: var(--apple-green);"></div>
                                <div class="color-option" data-color="var(--apple-red)" style="background-color: var(--apple-red);"></div>
                                <div class="color-option" data-color="var(--apple-purple)" style="background-color: var(--apple-purple);"></div>
                                <div class="color-option" data-color="var(--apple-orange)" style="background-color: var(--apple-orange);"></div>
                                <div class="color-option" data-color="var(--apple-pink)" style="background-color: var(--apple-pink);"></div>
                                <div class="color-option" data-color="var(--apple-teal)" style="background-color: var(--apple-teal);"></div>
                                <div class="color-option" data-color="var(--apple-indigo)" style="background-color: var(--apple-indigo);"></div>
                                <div class="color-option" data-color="var(--apple-mint)" style="background-color: var(--apple-mint);"></div>
                                <div class="color-option" data-color="var(--apple-cyan)" style="background-color: var(--apple-cyan);"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="sf-text">Priorität:</label>
                            <select id="task-priority" class="sf-text">
                                <option value="low">Niedrig</option>
                                <option value="medium" selected>Mittel</option>
                                <option value="high">Hoch</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="sf-text">Fälligkeitsdatum:</label>
                            <input type="datetime-local" id="task-due-date" class="sf-text">
                        </div>
                        <div class="form-group">
                            <label class="sf-text">Zugewiesen an:</label>
                            <input type="text" id="task-assignee" placeholder="Name oder E-Mail" class="sf-text">
                        </div>
                        <div class="form-group">
                            <label class="sf-text" style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="sync-to-outlook"> 
                                Mit Outlook-Kalender synchronisieren
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" id="cancel-task" class="btn btn-secondary sf-text">Abbrechen</button>
                            <button type="submit" class="btn btn-primary sf-text">Speichern</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Apple-Style Status Indicators -->
            <div id="outlook-status" class="status-indicator sf-text">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="5" fill="currentColor"/>
                </svg>
                <span>Outlook: Nicht verbunden</span>
            </div>

            ${this.user ? `
                <div id="sync-status" class="status-indicator sf-text">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 6l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Cloud: Verbunden</span>
                </div>
            ` : ''}
        `;

        this.setupEventListeners();
        this.setupCategoryFilters();
        this.setupCategoryInput();
        this.setupTimelineEventListeners();
    }

    setupEventListeners() {
        // Add Apple-style button feedback to all buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addAppleButtonFeedback(e.target);
            });
        });

        // Add task button
        document.getElementById('add-task').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Logout button (if user is logged in)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Modal background click
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'task-modal') {
                this.closeTaskModal();
            }
        });

        // Task form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Cancel button
        document.getElementById('cancel-task').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Outlook sync button
        document.getElementById('sync-outlook').addEventListener('click', () => {
            this.syncWithOutlook();
        });

        // Setup drag and drop
        this.setupDragAndDrop();
    }

    setupTimelineEventListeners() {
        // View switching (Board/Timeline)
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.addAppleButtonFeedback(e.target);
                
                // Update active tab
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const view = tab.dataset.view;
                this.switchView(view);
            });
        });

        // Timeline view options (All/Today/Week)
        document.querySelectorAll('.timeline-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addAppleButtonFeedback(e.target);
                
                // Update active timeline filter
                document.querySelectorAll('.timeline-view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.timelineFilter = btn.dataset.view;
                this.renderTimeline();
            });
        });

        // Timeline category filters
        document.querySelectorAll('#timeline-category-filter .category-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.addAppleButtonFeedback(e.target);
                
                // Update active filter
                document.querySelectorAll('#timeline-category-filter .category-filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                this.activeFilter = filter.dataset.category;
                this.renderTimeline();
            });
        });
    }

    switchView(view) {
        this.currentView = view;
        
        const boardView = document.querySelector('.kanban-board');
        const timelineView = document.getElementById('timeline-view');
        const categoryFilterBar = document.querySelector('.category-filter-bar');
        
        if (view === 'timeline') {
            // Hide board view
            boardView.style.display = 'none';
            categoryFilterBar.style.display = 'none';
            
            // Show timeline view
            timelineView.style.display = 'block';
            
            // Render timeline
            this.renderTimeline();
        } else {
            // Show board view
            boardView.style.display = 'grid';
            categoryFilterBar.style.display = 'flex';
            
            // Hide timeline view
            timelineView.style.display = 'none';
            
            // Render board
            this.renderTasks();
            this.updateTaskCounts();
        }
    }

    setupCategoryFilters() {
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.addAppleButtonFeedback(e.target);
                
                // Update active filter
                document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                this.activeFilter = filter.dataset.category;
                this.renderTasks();
                this.updateTaskCounts();
            });
        });
    }

    setupCategoryInput() {
        const categoryInput = document.getElementById('task-category');
        const suggestions = document.getElementById('category-suggestions');
        const colorPicker = document.getElementById('category-color-picker');
        let selectedColor = 'var(--apple-blue)';

        // Category input autocomplete
        categoryInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            const matchingCategories = this.categories.filter(cat => 
                cat.name.toLowerCase().includes(value)
            );

            if (value && matchingCategories.length > 0) {
                suggestions.innerHTML = matchingCategories.map(cat => `
                    <div class="category-suggestion" data-category="${cat.id}">
                        <div class="category-dot" style="background-color: ${cat.color};"></div>
                        <span>${cat.name}</span>
                    </div>
                `).join('');
                suggestions.style.display = 'block';
            } else {
                suggestions.style.display = 'none';
            }
        });

        // Category suggestion selection
        suggestions.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.category-suggestion');
            if (suggestion) {
                const categoryId = suggestion.dataset.category;
                const category = this.categories.find(cat => cat.id === categoryId);
                if (category) {
                    categoryInput.value = category.name;
                    selectedColor = category.color;
                    this.updateColorPickerSelection(selectedColor);
                }
                suggestions.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.category-input-group')) {
                suggestions.style.display = 'none';
            }
        });

        // Color picker
        colorPicker.addEventListener('click', (e) => {
            const colorOption = e.target.closest('.color-option');
            if (colorOption) {
                selectedColor = colorOption.dataset.color;
                this.updateColorPickerSelection(selectedColor);
                this.addAppleButtonFeedback(colorOption);
            }
        });

        // Store selected color for later use
        categoryInput.addEventListener('blur', () => {
            categoryInput.dataset.selectedColor = selectedColor;
        });
    }

    updateColorPickerSelection(selectedColor) {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-color="${selectedColor}"]`).classList.add('selected');
    }

    addAppleButtonFeedback(button) {
        // Apple-style button press animation
        button.style.transform = 'scale(0.96)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        // Haptic feedback simulation
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    setupDragAndDrop() {
        const columns = document.querySelectorAll('.task-list');
        
        columns.forEach(column => {
            column.addEventListener('dragover', this.handleDragOver.bind(this));
            column.addEventListener('drop', this.handleDrop.bind(this));
            column.addEventListener('dragenter', this.handleDragEnter.bind(this));
            column.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = e.currentTarget.id.replace('-list', '');
        
        this.updateTaskStatus(taskId, newStatus);
    }

    // Category Management
    addOrUpdateCategory(name, color) {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        const existingCategory = this.categories.find(cat => cat.id === id);
        
        if (existingCategory) {
            existingCategory.color = color;
        } else {
            this.categories.push({ name, color, id });
        }
        
        this.saveCategories();
        return id;
    }

    saveCategories() {
        localStorage.setItem('kanban-categories', JSON.stringify(this.categories));
        if (this.db && this.user) {
            this.saveCategoriestoFirebase();
        }
    }

    async saveCategoriestoFirebase() {
        if (!this.user || !this.db) return;

        try {
            await this.db.collection('categories').doc(this.user.uid).set({
                categories: this.categories,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    }

    async loadCategoriesFromFirebase() {
        if (!this.user || !this.db) return;

        try {
            const doc = await this.db.collection('categories').doc(this.user.uid).get();
            if (doc.exists) {
                this.categories = doc.data().categories || this.categories;
                this.saveCategories(); // Sync to localStorage
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Firebase Authentication Methods
    async login(email, password) {
        try {
            await this.auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Login error:', error);
            this.showAppleAlert('Anmeldung fehlgeschlagen: ' + this.getErrorMessage(error));
        }
    }

    async register(email, password) {
        try {
            await this.auth.createUserWithEmailAndPassword(email, password);
            this.showAppleAlert('Registrierung erfolgreich! Sie sind jetzt angemeldet.', 'success');
        } catch (error) {
            console.error('Registration error:', error);
            this.showAppleAlert('Registrierung fehlgeschlagen: ' + this.getErrorMessage(error));
        }
    }

    async logout() {
        try {
            if (this.unsubscribe) {
                this.unsubscribe();
            }
            await this.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'Benutzer nicht gefunden';
            case 'auth/wrong-password':
                return 'Falsches Passwort';
            case 'auth/email-already-in-use':
                return 'E-Mail-Adresse wird bereits verwendet';
            case 'auth/weak-password':
                return 'Passwort ist zu schwach';
            case 'auth/invalid-email':
                return 'Ungültige E-Mail-Adresse';
            default:
                return error.message;
        }
    }

    showAppleAlert(message, type = 'error') {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--apple-secondary-grouped-background);
            border-radius: var(--apple-radius-lg);
            padding: var(--apple-spacing-lg);
            box-shadow: var(--apple-shadow-xl);
            border: 1px solid var(--apple-quaternary-system-fill);
            z-index: 10000;
            max-width: 320px;
            backdrop-filter: var(--apple-blur-light);
            -webkit-backdrop-filter: var(--apple-blur-light);
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        const iconColor = type === 'success' ? 'var(--apple-green)' : 'var(--apple-red)';
        const icon = type === 'success' ? 
            '<path d="M6 10l2 2 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' :
            '<path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
        
        alert.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: ${iconColor}; flex-shrink: 0; margin-top: 2px;">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                    ${icon}
                </svg>
                <p class="sf-text" style="color: var(--apple-label); margin: 0; line-height: 1.4;">${message}</p>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Animate in
        requestAnimationFrame(() => {
            alert.style.transform = 'translateX(0)';
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 300);
        }, 4000);
    }

    // Firebase Data Methods
    async loadTasksFromFirebase() {
        if (!this.user || !this.db) return;

        try {
            this.unsubscribe = this.db.collection('tasks')
                .where('userId', '==', this.user.uid)
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    this.tasks = [];
                    snapshot.forEach((doc) => {
                        this.tasks.push({ id: doc.id, ...doc.data() });
                    });
                    this.renderTasks();
                    this.updateTaskCounts();
                });
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async saveTaskToFirebase(task) {
        if (!this.user || !this.db) {
            this.saveTasks();
            return;
        }

        const taskData = {
            ...task,
            userId: this.user.uid,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (task.id && task.id.length > 20) {
                await this.db.collection('tasks').doc(task.id).update(taskData);
            } else {
                const docRef = await this.db.collection('tasks').add({
                    ...taskData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                task.id = docRef.id;
            }
        } catch (error) {
            console.error('Error saving task:', error);
            this.showAppleAlert('Fehler beim Speichern der Aufgabe');
        }
    }

    async deleteTaskFromFirebase(taskId) {
        if (!this.user || !this.db) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            return;
        }

        try {
            await this.db.collection('tasks').doc(taskId).delete();
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showAppleAlert('Fehler beim Löschen der Aufgabe');
        }
    }

    // Task Management Methods
    openTaskModal(taskId = null) {
        this.currentTaskId = taskId;
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const title = document.getElementById('modal-title');

        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            title.textContent = 'Aufgabe bearbeiten';
            this.populateForm(task);
        } else {
            title.textContent = 'Neue Aufgabe erstellen';
            form.reset();
            this.updateColorPickerSelection('var(--apple-blue)');
        }

        modal.style.display = 'block';
        // Apple-style focus
        setTimeout(() => {
            document.getElementById('task-title').focus();
        }, 100);
    }

    closeTaskModal() {
        const modal = document.getElementById('task-modal');
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 200);
        this.currentTaskId = null;
    }

    populateForm(task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-category').value = task.category || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-assignee').value = task.assignee || '';
        document.getElementById('sync-to-outlook').checked = task.syncToOutlook || false;
        
        if (task.categoryColor) {
            this.updateColorPickerSelection(task.categoryColor);
            document.getElementById('task-category').dataset.selectedColor = task.categoryColor;
        }
        
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            document.getElementById('task-due-date').value = date.toISOString().slice(0, 16);
        }
    }

    async saveTask() {
        const categoryInput = document.getElementById('task-category');
        const selectedColor = categoryInput.dataset.selectedColor || 'var(--apple-blue)';
        
        const formData = {
            title: document.getElementById('task-title').value.trim(),
            description: document.getElementById('task-description').value.trim(),
            category: categoryInput.value.trim(),
            categoryColor: selectedColor,
            priority: document.getElementById('task-priority').value,
            assignee: document.getElementById('task-assignee').value.trim(),
            dueDate: document.getElementById('task-due-date').value,
            syncToOutlook: document.getElementById('sync-to-outlook').checked
        };

        if (!formData.title) {
            this.showAppleAlert('Bitte geben Sie einen Titel ein.');
            return;
        }

        // Add or update category if provided
        if (formData.category) {
            formData.categoryId = this.addOrUpdateCategory(formData.category, formData.categoryColor);
        }

        if (this.currentTaskId) {
            const taskIndex = this.tasks.findIndex(t => t.id === this.currentTaskId);
            const updatedTask = {
                ...this.tasks[taskIndex],
                ...formData
            };
            
            if (this.db && this.user) {
                await this.saveTaskToFirebase(updatedTask);
            } else {
                this.tasks[taskIndex] = updatedTask;
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounts();
            }
        } else {
            const newTask = {
                id: this.generateId(),
                ...formData,
                status: 'todo'
            };
            
            if (this.db && this.user) {
                await this.saveTaskToFirebase(newTask);
            } else {
                this.tasks.push(newTask);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounts();
            }
        }

        this.closeTaskModal();
        this.showAppleAlert('Aufgabe erfolgreich gespeichert!', 'success');
        
        // Update category filters if new category was added
        this.updateCategoryFilters();
    }

    updateCategoryFilters() {
        // Update board category filters
        const filterBar = document.querySelector('.category-filter-bar');
        const existingFilters = filterBar.querySelectorAll('.category-filter:not(.all)');
        
        // Remove old category filters
        existingFilters.forEach(filter => filter.remove());
        
        // Add updated category filters
        this.categories.forEach(category => {
            const filterElement = document.createElement('div');
            filterElement.className = 'category-filter';
            filterElement.dataset.category = category.id;
            filterElement.innerHTML = `
                <div class="category-dot" style="background-color: ${category.color};"></div>
                <span>${category.name}</span>
            `;
            filterBar.appendChild(filterElement);
        });
        
        // Update timeline category filters
        const timelineFilterBar = document.getElementById('timeline-category-filter');
        if (timelineFilterBar) {
            const timelineExistingFilters = timelineFilterBar.querySelectorAll('.category-filter:not(.all)');
            
            // Remove old timeline category filters
            timelineExistingFilters.forEach(filter => filter.remove());
            
            // Add updated timeline category filters
            this.categories.forEach(category => {
                const filterElement = document.createElement('div');
                filterElement.className = 'category-filter';
                filterElement.dataset.category = category.id;
                filterElement.innerHTML = `
                    <div class="category-dot" style="background-color: ${category.color};"></div>
                    <span>${category.name}</span>
                `;
                timelineFilterBar.appendChild(filterElement);
            });
        }
        
        // Re-setup event listeners
        this.setupCategoryFilters();
        this.setupTimelineEventListeners();
    }

    async deleteTask(taskId) {
        // Apple-style confirmation
        if (confirm('Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?')) {
            if (this.db && this.user) {
                await this.deleteTaskFromFirebase(taskId);
            } else {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounts();
            }
            this.showAppleAlert('Aufgabe gelöscht', 'success');
        }
    }

    async updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            
            if (newStatus === 'done') {
                task.completedAt = new Date().toISOString();
            } else {
                delete task.completedAt;
            }
            
            if (this.db && this.user) {
                await this.saveTaskToFirebase(task);
            } else {
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCounts();
            }
        }
    }

    // Timeline Rendering Methods
    renderTimeline() {
        const timelineTrack = document.getElementById('timeline-track');
        const timelineEmpty = document.getElementById('timeline-empty');
        
        if (!timelineTrack) return;
        
        // Clear existing timeline items (keep axis)
        const existingItems = timelineTrack.querySelectorAll('.timeline-item, .timeline-date-marker, .timeline-date-label');
        existingItems.forEach(item => item.remove());
        
        // Get tasks with due dates
        let timelineTasks = this.tasks.filter(task => task.dueDate);
        
        // Apply category filter
        if (this.activeFilter !== 'all') {
            timelineTasks = timelineTasks.filter(task => task.categoryId === this.activeFilter);
        }
        
        // Apply timeline filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        if (this.timelineFilter === 'today') {
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            timelineTasks = timelineTasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate >= today && taskDate < tomorrow;
            });
        } else if (this.timelineFilter === 'week') {
            timelineTasks = timelineTasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate >= today && taskDate <= weekFromNow;
            });
        }
        
        // Sort tasks by due date
        timelineTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        if (timelineTasks.length === 0) {
            timelineEmpty.style.display = 'flex';
            return;
        } else {
            timelineEmpty.style.display = 'none';
        }
        
        // Group tasks by date
        const tasksByDate = this.groupTasksByDate(timelineTasks);
        
        // Calculate timeline layout
        this.layoutTimelineItems(tasksByDate, timelineTrack);
    }
    
    groupTasksByDate(tasks) {
        const groups = {};
        
        tasks.forEach(task => {
            const date = new Date(task.dueDate);
            const dateKey = date.toDateString();
            
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: date,
                    tasks: []
                };
            }
            
            groups[dateKey].tasks.push(task);
        });
        
        return Object.values(groups).sort((a, b) => a.date - b.date);
    }
    
    layoutTimelineItems(taskGroups, container) {
        const containerHeight = 600; // Base height for timeline
        let currentY = 50; // Start position
        
        taskGroups.forEach((group, groupIndex) => {
            // Add date marker and label
            const dateMarker = document.createElement('div');
            dateMarker.className = 'timeline-date-marker';
            dateMarker.style.top = `${currentY}px`;
            container.appendChild(dateMarker);
            
            const dateLabel = document.createElement('div');
            dateLabel.className = 'timeline-date-label';
            dateLabel.style.top = `${currentY - 12}px`;
            dateLabel.textContent = this.formatTimelineDate(group.date);
            container.appendChild(dateLabel);
            
            currentY += 40; // Space after date label
            
            // Add tasks for this date
            group.tasks.forEach((task, taskIndex) => {
                const timelineItem = this.createTimelineItem(task);
                
                // Alternate left and right positioning
                const isLeft = taskIndex % 2 === 0;
                timelineItem.classList.add(isLeft ? 'left' : 'right');
                
                timelineItem.style.top = `${currentY}px`;
                
                // Add status-based styling
                const now = new Date();
                const taskDate = new Date(task.dueDate);
                
                if (taskDate < now && task.status !== 'done') {
                    timelineItem.classList.add('overdue');
                } else if (this.isToday(taskDate)) {
                    timelineItem.classList.add('today');
                } else if (taskDate > now) {
                    timelineItem.classList.add('upcoming');
                }
                
                container.appendChild(timelineItem);
                
                currentY += 120; // Space between tasks
            });
            
            currentY += 20; // Extra space between date groups
        });
        
        // Update container height
        container.style.minHeight = `${Math.max(containerHeight, currentY + 50)}px`;
    }
    
    createTimelineItem(task) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.dataset.taskId = task.id;
        
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date() && task.status !== 'done';
        
        item.innerHTML = `
            <div class="timeline-item-header">
                <h4 class="timeline-item-title">${this.escapeHtml(task.title)}</h4>
                <div class="timeline-item-status ${task.status}">
                    ${this.getStatusText(task.status)}
                </div>
            </div>
            
            <div class="timeline-item-meta">
                <div class="timeline-item-date ${isOverdue ? 'overdue' : ''}">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1"/>
                        <path d="M7 3v4l3 3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
                    </svg>
                    ${dueDate.toLocaleString('de-DE', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}
                </div>
                
                ${task.category ? `
                    <div class="timeline-item-category">
                        <div class="timeline-item-category-dot" style="background-color: ${task.categoryColor || 'var(--apple-blue)'};"></div>
                        <span>${this.escapeHtml(task.category)}</span>
                    </div>
                ` : ''}
            </div>
            
            ${task.description ? `
                <p class="timeline-item-description">${this.escapeHtml(task.description)}</p>
            ` : ''}
        `;
        
        // Add click handler to edit task
        item.addEventListener('click', () => {
            this.openTaskModal(task.id);
        });
        
        return item;
    }
    
    formatTimelineDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Heute';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Morgen';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Gestern';
        } else {
            return date.toLocaleDateString('de-DE', { 
                weekday: 'long', 
                day: '2-digit', 
                month: 'long' 
            });
        }
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    getStatusText(status) {
        const statusTexts = {
            'todo': 'Zu erledigen',
            'in-progress': 'In Bearbeitung',
            'review': 'Review',
            'done': 'Erledigt'
        };
        return statusTexts[status] || status;
    }

    // Rendering Methods
    renderTasks() {
        const columns = {
            'todo': document.getElementById('todo-list'),
            'in-progress': document.getElementById('in-progress-list'),
            'review': document.getElementById('review-list'),
            'done': document.getElementById('done-list')
        };

        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = '';
        });

        // Filter tasks based on active filter
        const filteredTasks = this.activeFilter === 'all' 
            ? this.tasks 
            : this.tasks.filter(task => task.categoryId === this.activeFilter);

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            const column = columns[task.status];
            if (column) {
                column.appendChild(taskElement);
            }
        });
        
        // Update timeline if it's the current view
        if (this.currentView === 'timeline') {
            this.renderTimeline();
        }
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-card priority-${task.priority}`;
        taskDiv.draggable = true;
        taskDiv.dataset.taskId = task.id;

        // Setup drag events
        taskDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            taskDiv.classList.add('dragging');
        });

        taskDiv.addEventListener('dragend', () => {
            taskDiv.classList.remove('dragging');
        });

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';

        taskDiv.innerHTML = `
            <div class="task-header">
                <div class="task-title sf-text">${this.escapeHtml(task.title)}</div>
                <div class="task-actions">
                    <button class="task-action" onclick="app.openTaskModal('${task.id}')" title="Bearbeiten">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="task-action" onclick="app.deleteTask('${task.id}')" title="Löschen">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 3h9M4 3V1.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V3M5 5.5v3M7 5.5v3" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${task.description ? `<div class="task-description sf-text">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <div class="task-info">
                    ${task.category ? `
                        <div class="category-badge">
                            <div class="category-dot" style="background-color: ${task.categoryColor || 'var(--apple-blue)'};"></div>
                            <span>${this.escapeHtml(task.category)}</span>
                        </div>
                    ` : ''}
                    <span class="priority-badge priority-${task.priority} sf-text">${this.getPriorityText(task.priority)}</span>
                    ${task.syncToOutlook ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" title="Mit Outlook synchronisiert"><rect x="1" y="3" width="10" height="6" rx="1" stroke="currentColor" stroke-width="1"/><path d="M1 4l5 3 5-3" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
                    ${this.user ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" title="Cloud-synchronisiert"><path d="M8 6a3 3 0 00-6 0 2 2 0 000 4h6a2 2 0 000-4z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" title="Lokal gespeichert"><rect x="2" y="3" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1"/><rect x="4" y="1" width="4" height="2" rx="0.5" stroke="currentColor" stroke-width="1"/></svg>'}
                </div>
                <div class="task-details">
                    ${dueDate ? `<div class="task-due-date sf-text ${isOverdue ? 'overdue' : ''}">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1"/>
                            <path d="M6 3v3l2 2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
                        </svg>
                        ${dueDate.toLocaleDateString('de-DE')}
                    </div>` : ''}
                    ${task.assignee ? `<div class="task-assignee sf-text">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6" cy="3.5" r="2" stroke="currentColor" stroke-width="1"/>
                            <path d="M2 10c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" stroke-width="1"/>
                        </svg>
                        ${this.escapeHtml(task.assignee)}
                    </div>` : ''}
                </div>
            </div>
        `;

        return taskDiv;
    }

    updateTaskCounts() {
        const counts = {
            'todo': 0,
            'in-progress': 0,
            'review': 0,
            'done': 0
        };

        // Filter tasks based on active filter
        const filteredTasks = this.activeFilter === 'all' 
            ? this.tasks 
            : this.tasks.filter(task => task.categoryId === this.activeFilter);

        filteredTasks.forEach(task => {
            counts[task.status]++;
        });

        Object.keys(counts).forEach(status => {
            const column = document.querySelector(`[data-status="${status}"] .task-count`);
            if (column) {
                column.textContent = counts[status];
            }
        });
    }

    addSampleTasks() {
        if (this.tasks.length === 0) {
            const sampleTasks = [
                {
                    id: 'sample-1',
                    title: 'Projektplanung Q2 abschließen',
                    description: 'Detaillierte Roadmap erstellen und mit dem Team abstimmen.',
                    category: 'Planung',
                    categoryId: 'planning',
                    categoryColor: 'var(--apple-indigo)',
                    priority: 'high',
                    status: 'todo',
                    assignee: 'Max Mustermann',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    syncToOutlook: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'sample-2',
                    title: 'Code Review durchführen',
                    description: 'Pull Request #123 überprüfen und Feedback geben.',
                    category: 'Entwicklung',
                    categoryId: 'development',
                    categoryColor: 'var(--apple-orange)',
                    priority: 'medium',
                    status: 'in-progress',
                    assignee: 'Anna Schmidt',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    syncToOutlook: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'sample-3',
                    title: 'API-Dokumentation aktualisieren',
                    description: 'Neue Endpoints dokumentieren und Beispiele hinzufügen.',
                    category: 'Arbeit',
                    categoryId: 'work',
                    categoryColor: 'var(--apple-blue)',
                    priority: 'low',
                    status: 'review',
                    assignee: 'Tom Weber',
                    syncToOutlook: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'sample-4',
                    title: 'Bug #456 beheben',
                    description: 'Kritischen Bug in der Benutzeranmeldung beheben.',
                    category: 'Dringend',
                    categoryId: 'urgent',
                    categoryColor: 'var(--apple-red)',
                    priority: 'high',
                    status: 'done',
                    assignee: 'Lisa Müller',
                    completedAt: new Date().toISOString(),
                    syncToOutlook: false,
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            this.tasks = sampleTasks;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
        }
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPriorityText(priority) {
        const priorities = {
            'low': 'Niedrig',
            'medium': 'Mittel',
            'high': 'Hoch'
        };
        return priorities[priority] || priority;
    }

    saveTasks() {
        localStorage.setItem('kanban-tasks', JSON.stringify(this.tasks));
    }

    // Outlook Integration (Placeholder)
    async syncWithOutlook() {
        this.showAppleAlert('Outlook-Synchronisation ist in Entwicklung. Verwenden Sie die Implementierungsanleitung für die vollständige Integration.');
    }
}

// Initialize the Apple-style app with categories
let app;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Add Apple-style loading animation
    setTimeout(() => {
        app = new AppleKanbanApp();
    }, 500);
});

// Apple-style keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        if (app) app.openTaskModal();
    }
    
    if (e.key === 'Escape') {
        if (app) app.closeTaskModal();
    }
});

// Apple-style window focus handling
window.addEventListener('focus', () => {
    if (app && app.tasks) {
        app.renderTasks();
        app.updateTaskCounts();
    }
});