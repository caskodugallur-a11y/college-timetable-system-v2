// ============================================
// ScheduleFlow - Dashboard Management System
// Premium SaaS Dashboard Engine
// ============================================

// Check authentication
function checkAuth() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const adminName = localStorage.getItem('adminUsername');
    const nameDisplay = document.getElementById('adminNameDisplay');
    if (nameDisplay) nameDisplay.textContent = adminName || 'Admin';

    // Logout buttons
    document.querySelectorAll('#logoutBtn, #logoutBtnSidebar').forEach(btn => {
        btn.addEventListener('click', function() {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUsername');
            if (window.Toast) window.Toast.info('Logged out successfully');
            setTimeout(() => window.location.href = '../index.html', 300);
        });
    });

    // Initialize
    initializeDashboard();
    setupNavigation();
    setupMobileSidebar();
    setupModals();
    initMiniCharts();
    updateSidebarNotifBadge();
});

// Setup navigation
function setupNavigation() {
    // Sidebar items and bottom nav items
    document.querySelectorAll('.sidebar-item, .bottom-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const module = this.getAttribute('data-module');
            if (module) switchModule(module);
        });
    });
}

// Setup mobile menu sidebar drawer toggle
function setupMobileSidebar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
        });

        // Close sidebar when clicking a sidebar navigation item
        sidebar.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
            });
        });

        // Close sidebar when clicking outside it
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && e.target !== mobileMenuBtn) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

// Switch module with 3D transition
function switchModule(moduleName) {
    const currentActive = document.querySelector('.module.active');
    const moduleElement = document.getElementById(moduleName + '-module');
    const titleEl = document.getElementById('pageTitle');

    // Update active states on sidebar items and bottom nav
    document.querySelectorAll('.sidebar-item, .bottom-nav-item').forEach(item => {
        const mod = item.getAttribute('data-module');
        item.classList.toggle('active', mod === moduleName);
    });

    // Update page title content
    const titles = {
        'dashboard': 'Dashboard',
        'teachers': 'Teacher Management',
        'subjects': 'Subject Management',
        'classes': 'Class Management',
        'timetable': 'Timetable Editor',
        'reports': 'Reports & Analytics',
        'timetable-intelligence': 'Timetable Intelligence',
        'notifications': 'Notifications'
    };
    if (titleEl) titleEl.textContent = titles[moduleName] || 'Dashboard';

    // Use GSAP transition if available
    if (window.GSAPAnimations && moduleElement && currentActive !== moduleElement) {
        GSAPAnimations.moduleTransition(currentActive, moduleElement, titleEl);
    } else {
        // Fallback
        document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
        if (moduleElement) moduleElement.classList.add('active');
    }

    // Load module-specific data
    const loaders = {
        'teachers': loadTeachers,
        'subjects': loadSubjects,
        'classes': loadClasses,
        'timetable': loadTimetableData,
        'reports': loadReportData,
        'dashboard': loadDashboard,
        'timetable-intelligence': loadTimetableIntelligence,
        'notifications': loadNotifications
    };
    if (loaders[moduleName]) loaders[moduleName]();
}


// ============================================
// MINI CHARTS
// ============================================
function initMiniCharts() {
    const chartIds = ['teacherMiniChart', 'subjectMiniChart', 'classMiniChart', 'timetableMiniChart'];
    chartIds.forEach(id => {
        const container = document.getElementById(id);
        if (!container) return;
        const heights = [];
        const bars = 12;
        for (let i = 0; i < bars; i++) {
            heights.push(Math.floor(Math.random() * 32) + 8);
        }
        container.innerHTML = heights.map(h => 
            `<div class="bar fill" style="height: ${h}px;"></div>`
        ).join('');
    });
}

// ============================================
// CHARTS (Chart.js)
// ============================================
let workloadChartInstance = null;
let departmentChartInstance = null;

function initCharts() {
    initWorkloadChart();
    initDepartmentChart();
}

function initWorkloadChart() {
    const canvas = document.getElementById('workloadChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (workloadChartInstance) workloadChartInstance.destroy();
    
    const ctx = canvas.getContext('2d');
    workloadChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ajikumar', 'Bidura', 'Reji', 'Haifa', 'Fousia', 'Sikha', 'Roshna'],
            datasets: [{
                label: 'Hours/Week',
                data: [12, 14, 7, 4, 6, 2, 5],
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                borderColor: 'rgba(59, 130, 246, 0.8)',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'rgba(255,255,255,0.5)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.5)' }
                }
            }
        }
    });
}

function initDepartmentChart() {
    const canvas = document.getElementById('departmentChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (departmentChartInstance) departmentChartInstance.destroy();
    
    const ctx = canvas.getContext('2d');
    departmentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['BCA', 'BCom', 'MCom'],
            datasets: [{
                data: [7, 2, 2],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255,255,255,0.7)',
                        padding: 16,
                        usePointStyle: true
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// ============================================
// DASHBOARD MODULE
// ============================================

async function initializeDashboard() {
    await loadDashboard();
    // Initialize charts after a brief delay to ensure DOM is ready
    setTimeout(() => initCharts(), 100);
}

async function loadDashboard() {
    try {
        // Show loading state for statistics
        const statsElements = document.querySelectorAll('[id^="total"]');
        statsElements.forEach(el => el.textContent = '...');

        // Load statistics from API
        const teachers = await APIClient.getTeachers();
        const subjects = await APIClient.getSubjects();
        const classes = await APIClient.getClasses();
        const timetable = await APIClient.getTimetable();

        document.getElementById('totalTeachers').textContent = teachers.length;
        document.getElementById('totalSubjects').textContent = subjects.length;
        document.getElementById('totalClasses').textContent = classes.length;
        document.getElementById('totalTimetables').textContent = timetable.length;

        // Load workload
        const workloadContainer = document.getElementById('workloadContainer');
        workloadContainer.innerHTML = '';

        if (teachers.length === 0) {
            workloadContainer.innerHTML = '<div style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No teachers yet</div>';
            return;
        }

        // For each teacher, calculate their workload
        for (const teacher of teachers) {
            try {
                const workload = await APIClient.getTeacherWorkload(teacher.id);
                const div = document.createElement('div');
                div.className = 'workload-item';
                div.innerHTML = `
                    <div class="workload-item-name">${teacher.name}</div>
                    <div class="workload-item-info">
                        📚 ${workload.unique_subjects || 0} subjects | 🎓 ${workload.unique_classes || 0} classes | ⏱️ ${workload.total_slots || 0} hours/week
                    </div>
                `;
                workloadContainer.appendChild(div);
            } catch (error) {
                console.error(`Error loading workload for teacher ${teacher.id}:`, error);
            }
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        window.Toast.error('Failed to load dashboard data');
    }
}

// ============================================
// TEACHERS MANAGEMENT
// ============================================

async function loadTeachers() {
    try {
        const tbody = document.getElementById('teachersTableBody');
        
        // Show loading skeleton
        tbody.innerHTML = `
            <tr>
                <td><div class="skeleton-text" style="width: 60%;"></div></td>
                <td><div class="skeleton-text" style="width: 70%;"></div></td>
                <td><div class="skeleton-text" style="width: 40%;"></div></td>
                <td><div class="skeleton-text" style="width: 50%;"></div></td>
                <td><div class="skeleton-text" style="width: 80%;"></div></td>
            </tr>
            <tr>
                <td><div class="skeleton-text" style="width: 60%;"></div></td>
                <td><div class="skeleton-text" style="width: 70%;"></div></td>
                <td><div class="skeleton-text" style="width: 40%;"></div></td>
                <td><div class="skeleton-text" style="width: 50%;"></div></td>
                <td><div class="skeleton-text" style="width: 80%;"></div></td>
            </tr>
        `;

        // Fetch teachers from API
        const teachers = await APIClient.getTeachers();
        tbody.innerHTML = '';

        if (teachers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem; color: var(--text-tertiary);">No teachers found. <a href="#" onclick="openAddTeacherModal(); return false;" style="color: var(--primary-light);">Add one now</a></td></tr>';
            return;
        }

        teachers.forEach(teacher => {
            const tr = document.createElement('tr');
            const statusColor = teacher.status === 'active' ? '#dcfce7' : '#fee2e2';
            const statusBg = teacher.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
            
            tr.innerHTML = `
                <td>${teacher.name || 'N/A'}</td>
                <td>${teacher.department || 'N/A'}</td>
                <td>${teacher.email ? teacher.email.split('@')[0] : 'No email'}</td>
                <td><span class="badge" style="background: ${statusBg}; color: ${statusColor}; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem;">${teacher.status || 'inactive'}</span></td>
                <td>
                    <div class="table-actions" style="display: flex; gap: 0.5rem;">
                        <button class="action-btn action-edit" onclick="openEditTeacherModal('${teacher.id}')" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; cursor: pointer;">Edit</button>
                        <button class="action-btn action-delete" onclick="deleteTeacher('${teacher.id}')" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; cursor: pointer;">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Setup search
        const searchInput = document.getElementById('teacherSearch');
        if (searchInput) {
            searchInput.addEventListener('keyup', function() {
                filterTable('teachersTableBody', this.value);
            });
        }

    } catch (error) {
        console.error('Error loading teachers:', error);
        const tbody = document.getElementById('teachersTableBody');
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger" style="padding: 2rem; color: var(--danger);">Failed to load teachers: ${error.message}</td></tr>`;
        window.Toast.error('Failed to load teachers: ' + error.message);
    }
}

function openAddTeacherModal() {
    document.getElementById('teacherModalTitle').textContent = 'Add Teacher';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherForm').removeAttribute('data-id');
    document.getElementById('teacherForm').removeAttribute('data-edit-mode');
    
    // Reset form fields
    document.getElementById('teacherName').value = '';
    document.getElementById('teacherDept').value = '';
    document.getElementById('teacherStatus').value = 'active';
    
    document.getElementById('teacherModal').classList.add('active');
}

async function openEditTeacherModal(teacherId) {
    try {
        document.getElementById('teacherModalTitle').textContent = 'Edit Teacher';
        document.getElementById('teacherForm').setAttribute('data-id', teacherId);
        document.getElementById('teacherForm').setAttribute('data-edit-mode', 'true');
        
        // Show loading state
        const nameField = document.getElementById('teacherName');
        const originalText = nameField.value;
        nameField.placeholder = 'Loading...';
        
        // Fetch teacher data
        const teacher = await APIClient.getTeacher(teacherId);
        
        // Populate form
        document.getElementById('teacherName').value = teacher.name || '';
        document.getElementById('teacherDept').value = teacher.department || '';
        document.getElementById('teacherStatus').value = teacher.status || 'active';
        
        nameField.placeholder = 'Enter full name';
        document.getElementById('teacherModal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading teacher:', error);
        window.Toast.error('Failed to load teacher: ' + error.message);
    }
}



function closeTeacherModal() {
    document.getElementById('teacherModal').classList.remove('active');
}

// Teacher form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const teacherForm = document.getElementById('teacherForm');
    if (teacherForm) {
        teacherForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // Get form data
                const name = document.getElementById('teacherName').value.trim();
                const department = document.getElementById('teacherDept').value;
                const status = document.getElementById('teacherStatus').value;
                const teacherId = this.getAttribute('data-id');
                const isEditMode = this.getAttribute('data-edit-mode') === 'true';
                
                // Validate
                if (!name || !department) {
                    window.Toast.error('Please fill in all required fields');
                    return;
                }
                
                // Show loading state on submit button
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite; display: inline;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Saving...';
                
                const teacherData = {
                    name: name,
                    department: department,
                    status: status,
                    email: document.getElementById('teacherName').value + '@college.edu' // Auto-generate email
                };
                
                let result;
                if (isEditMode && teacherId) {
                    // Update existing teacher
                    result = await APIClient.updateTeacher(teacherId, teacherData);
                    window.Toast.success('Teacher updated successfully');
                } else {
                    // Create new teacher
                    result = await APIClient.createTeacher(teacherData);
                    window.Toast.success('Teacher created successfully');
                }
                
                // Close modal
                closeTeacherModal();
                
                // Reload teachers list
                await loadTeachers();
                
                // Reset form
                this.reset();
                this.removeAttribute('data-id');
                this.removeAttribute('data-edit-mode');
                
            } catch (error) {
                console.error('Error saving teacher:', error);
                window.Toast.error('Failed to save teacher: ' + error.message);
            } finally {
                // Restore submit button
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/></svg> Save Teacher';
            }
        });
    }
});


async function deleteTeacher(teacherId) {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
        return;
    }

    try {
        // Show loading toast
        window.Toast.info('Deleting teacher...');
        
        // Call API to delete
        await APIClient.deleteTeacher(teacherId);
        
        // Show success message
        window.Toast.success('Teacher deleted successfully');
        
        // Reload teachers list
        await loadTeachers();
        
    } catch (error) {
        console.error('Error deleting teacher:', error);
        window.Toast.error('Failed to delete teacher: ' + error.message);
    }
}

// ============================================
// SUBJECTS MANAGEMENT
// ============================================

async function loadSubjects() {
    try {
        const subjects = await DemoAPI.getSubjects();
        const teachers = await DemoAPI.getTeachers();
        
        // Populate teacher dropdown
        const teacherSelects = document.querySelectorAll('#subjectTeacher');
        teacherSelects.forEach(select => {
            select.innerHTML = '<option value="">Select Teacher</option>';
            teachers.forEach(teacher => {
                select.appendChild(new Option(teacher.name, teacher.id));
            });
        });

        const tbody = document.getElementById('subjectsTableBody');
        tbody.innerHTML = '';

        if (subjects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No subjects found</td></tr>';
            return;
        }

        subjects.forEach(subject => {
            const teacher = teachers.find(t => t.id === subject.teacher);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${subject.name}</td>
                <td>${subject.code}</td>
                <td>${subject.department}</td>
                <td>${teacher?.name || 'Unassigned'}</td>
                <td>${subject.hours_per_week}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn action-edit" onclick="openEditSubjectModal('${subject.id}')">Edit</button>
                        <button class="action-btn action-delete" onclick="deleteSubject('${subject.id}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('subjectSearch').addEventListener('keyup', function() {
            filterTable('subjectsTableBody', this.value);
        });

    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

function openAddSubjectModal() {
    document.getElementById('subjectModalTitle').textContent = 'Add Subject';
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectForm').removeAttribute('data-id');
    document.getElementById('subjectModal').classList.add('active');
}

async function openEditSubjectModal(subjectId) {
    const subjects = await DemoAPI.getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    
    if (subject) {
        document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
        document.getElementById('subjectName').value = subject.name;
        document.getElementById('subjectCode').value = subject.code;
        document.getElementById('subjectDept').value = subject.department;
        document.getElementById('subjectSem').value = subject.semester;
        document.getElementById('subjectTeacher').value = subject.teacher;
        document.getElementById('subjectHours').value = subject.hours_per_week;
        document.getElementById('subjectForm').setAttribute('data-id', subjectId);
        document.getElementById('subjectModal').classList.add('active');
    }
}

function closeSubjectModal() {
    document.getElementById('subjectModal').classList.remove('active');
}

document.getElementById('subjectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const subjectId = this.getAttribute('data-id');
    const subjectData = {
        name: document.getElementById('subjectName').value,
        code: document.getElementById('subjectCode').value,
        department: document.getElementById('subjectDept').value,
        semester: document.getElementById('subjectSem').value,
        teacher: document.getElementById('subjectTeacher').value,
        hours_per_week: parseInt(document.getElementById('subjectHours').value)
    };

    try {
        if (subjectId) {
            await DemoAPI.updateSubject(subjectId, subjectData);
            alert('Subject updated successfully!');
        } else {
            await DemoAPI.addSubject(subjectData);
            alert('Subject added successfully!');
        }
        closeSubjectModal();
        loadSubjects();
    } catch (error) {
        alert('Error saving subject: ' + error.message);
    }
});

async function deleteSubject(subjectId) {
    if (confirm('Are you sure you want to delete this subject?')) {
        try {
            await DemoAPI.deleteSubject(subjectId);
            alert('Subject deleted successfully!');
            loadSubjects();
        } catch (error) {
            alert('Error deleting subject: ' + error.message);
        }
    }
}

// ============================================
// CLASSES MANAGEMENT
// ============================================

async function loadClasses() {
    try {
        const classes = await DemoAPI.getClasses();
        const tbody = document.getElementById('classesTableBody');
        tbody.innerHTML = '';

        if (classes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No classes found</td></tr>';
            return;
        }

        classes.forEach(cls => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cls.name}</td>
                <td>${cls.department}</td>
                <td>Semester ${cls.semester}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn action-edit" onclick="openEditClassModal('${cls.id}')">Edit</button>
                        <button class="action-btn action-delete" onclick="deleteClass('${cls.id}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('classSearch').addEventListener('keyup', function() {
            filterTable('classesTableBody', this.value);
        });

    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

function openAddClassModal() {
    document.getElementById('classModalTitle').textContent = 'Add Class';
    document.getElementById('classForm').reset();
    document.getElementById('classForm').removeAttribute('data-id');
    document.getElementById('classModal').classList.add('active');
}

async function openEditClassModal(classId) {
    const classes = await DemoAPI.getClasses();
    const cls = classes.find(c => c.id === classId);
    
    if (cls) {
        document.getElementById('classModalTitle').textContent = 'Edit Class';
        document.getElementById('className').value = cls.name;
        document.getElementById('classDept').value = cls.department;
        document.getElementById('classSem').value = cls.semester;
        document.getElementById('classForm').setAttribute('data-id', classId);
        document.getElementById('classModal').classList.add('active');
    }
}

function closeClassModal() {
    document.getElementById('classModal').classList.remove('active');
}

document.getElementById('classForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const classId = this.getAttribute('data-id');
    const classData = {
        name: document.getElementById('className').value,
        department: document.getElementById('classDept').value,
        semester: document.getElementById('classSem').value
    };

    try {
        if (classId) {
            await DemoAPI.updateClass(classId, classData);
            alert('Class updated successfully!');
        } else {
            await DemoAPI.addClass(classData);
            alert('Class added successfully!');
        }
        closeClassModal();
        loadClasses();
    } catch (error) {
        alert('Error saving class: ' + error.message);
    }
});

async function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class?')) {
        try {
            await DemoAPI.deleteClass(classId);
            alert('Class deleted successfully!');
            loadClasses();
        } catch (error) {
            alert('Error deleting class: ' + error.message);
        }
    }
}

// ============================================
// TIMETABLE MANAGEMENT
// ============================================

async function loadTimetableData() {
    try {
        const classes = await DemoAPI.getClasses();
        const select = document.getElementById('timetableClassSelect');
        select.innerHTML = '<option value="">Select Class...</option>';
        
        classes.forEach(cls => {
            select.appendChild(new Option(`${cls.name} (${cls.department} - Sem ${cls.semester})`, cls.id));
        });
    } catch (error) {
        console.error('Error loading timetable data:', error);
    }
}

async function loadTimetable() {
    try {
        const classId = document.getElementById('timetableClassSelect').value;
        const container = document.getElementById('timetableBody');
        
        if (!classId) {
            container.innerHTML = '<div style="text-align: center; padding: 3rem 1rem; color: var(--text-tertiary);">Select a class to view the timetable</div>';
            return;
        }

        const timetable = await DemoAPI.getTimetable(classId);
        const teachers = await DemoAPI.getTeachers();
        const subjects = await DemoAPI.getSubjects();
        const periods = ['1', '2', '3', '4', '5', '6', '7'];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        container.innerHTML = '';

        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'timetable-grid';
        gridWrapper.style.cssText = 'min-width: 720px;';
        gridWrapper.style.setProperty('--col-count', days.length);

        // Header
        const header = document.createElement('div');
        header.className = 'timetable-grid-header';
        header.innerHTML = '<div>Period</div><div>Monday</div><div>Tuesday</div><div>Wednesday</div><div>Thursday</div><div>Friday</div><div>Saturday</div>';
        gridWrapper.appendChild(header);

        periods.forEach(period => {
            const row = document.createElement('div');
            row.className = 'timetable-row';
            
            let html = `<div class="timetable-period">P${period}</div>`;

            days.forEach(day => {
                const slot = timetable.find(t => t.day === day && t.period === period);
                const teacher = slot ? teachers.find(t => t.id === slot.teacher) : null;
                const subject = slot ? subjects.find(s => s.id === slot.subject) : null;

                if (slot) {
                    html += `
                        <div class="timetable-cell" onclick="openEditTimetableModal('${classId}', '${day}', '${period}', '${slot.id}')" draggable="true">
                            <div class="slot-card" data-slot-id="${slot.id}">
                                <div class="slot-subject">${subject?.code || subject?.name || ''}</div>
                                <div class="slot-teacher">${teacher?.name || ''}</div>
                                <div class="slot-class">${day}</div>
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="timetable-cell empty" onclick="openEditTimetableModal('${classId}', '${day}', '${period}')">
                            <div class="add-slot">+</div>
                        </div>
                    `;
                }
            });

            row.innerHTML = html;
            gridWrapper.appendChild(row);
        });

        container.appendChild(gridWrapper);

        // Initialize drag & drop
        if (window.DragDrop) {
            window.DragDrop.init('#timetableContainer');
        }

    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

let currentSlotData = {};

async function openEditTimetableModal(classId, day, period, slotId = null) {
    try {
        const teachers = await DemoAPI.getTeachers();
        const subjects = await DemoAPI.getSubjects();

        // Populate dropdowns
        const teacherSelect = document.getElementById('slotTeacher');
        const subjectSelect = document.getElementById('slotSubject');

        teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';

        teachers.forEach(teacher => {
            teacherSelect.appendChild(new Option(teacher.name, teacher.id));
        });

        subjects.forEach(subject => {
            subjectSelect.appendChild(new Option(subject.name, subject.id));
        });

        currentSlotData = { classId, day, period, slotId };

        // Pre-fill if editing
        if (slotId) {
            const timetable = await DemoAPI.getTimetable(classId);
            const slot = timetable.find(t => t.id === slotId);
            if (slot) {
                teacherSelect.value = slot.teacher;
                subjectSelect.value = slot.subject;
            }
        }

        document.getElementById('timetableEditModal').classList.add('active');

    } catch (error) {
        alert('Error opening modal: ' + error.message);
    }
}

function closeTimetableEditModal() {
    document.getElementById('timetableEditModal').classList.remove('active');
}

document.getElementById('timetableEditForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const teacherId = document.getElementById('slotTeacher').value;
        const subjectId = document.getElementById('slotSubject').value;

        if (!teacherId || !subjectId) {
            alert('Please select both teacher and subject');
            return;
        }

        // Check for conflicts
        const conflict = await DemoAPI.checkTeacherConflict(teacherId, currentSlotData.day, currentSlotData.period);
        if (conflict && !currentSlotData.slotId) {
            alert('ERROR: Teacher already assigned during this period.');
            return;
        }

        const slot = {
            id: currentSlotData.slotId || Date.now().toString(),
            class_id: currentSlotData.classId,
            day: currentSlotData.day,
            period: currentSlotData.period,
            teacher: teacherId,
            subject: subjectId
        };

        await DemoAPI.saveTimetableSlot(slot);
        alert('Timetable slot saved successfully!');
        closeTimetableEditModal();
        loadTimetable();

    } catch (error) {
        alert('Error saving slot: ' + error.message);
    }
});

async function clearTimetableSlot() {
    if (confirm('Clear this slot?')) {
        try {
            if (currentSlotData.slotId) {
                await DemoAPI.deleteTimetableSlot(currentSlotData.slotId);
            }
            alert('Slot cleared successfully!');
            closeTimetableEditModal();
            loadTimetable();
        } catch (error) {
            alert('Error clearing slot: ' + error.message);
        }
    }
}

// ============================================
// REPORTS
// ============================================

async function loadReportData() {
    try {
        const classes = await DemoAPI.getClasses();
        
        document.getElementById('pdfClassSelect').innerHTML = '<option value="">Select Class...</option>';
        document.getElementById('excelClassSelect').innerHTML = '<option value="">Select Class...</option>';
        
        classes.forEach(cls => {
            document.getElementById('pdfClassSelect').appendChild(new Option(`${cls.name}`, cls.id));
            document.getElementById('excelClassSelect').appendChild(new Option(`${cls.name}`, cls.id));
        });
    } catch (error) {
        console.error('Error loading report data:', error);
    }
}

async function exportPDF() {
    const classId = document.getElementById('pdfClassSelect').value;
    if (!classId) {
        alert('Please select a class');
        return;
    }

    try {
        const classes = await DemoAPI.getClasses();
        const timetable = await DemoAPI.getTimetable(classId);
        const teachers = await DemoAPI.getTeachers();
        const subjects = await DemoAPI.getSubjects();
        const cls = classes.find(c => c.id === classId);

        // Create a simple HTML representation and print
        let html = `
            <h2>Timetable: ${cls.name}</h2>
            <p>Department: ${cls.department} | Semester: ${cls.semester}</p>
            <p>Date Generated: ${new Date().toLocaleDateString()}</p>
            <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; margin-top: 20px;">
                <tr style="background: #2563EB; color: white;">
                    <th>Period</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                </tr>
        `;

        for (let i = 1; i <= 7; i++) {
            html += '<tr>';
            html += `<td>Period ${i}</td>`;
            
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
                const slot = timetable.find(t => t.day === day && t.period === i.toString());
                if (slot) {
                    const teacher = teachers.find(t => t.id === slot.teacher);
                    const subject = subjects.find(s => s.id === slot.subject);
                    html += `<td>${subject?.code || ''}<br/>${teacher?.name || ''}</td>`;
                } else {
                    html += '<td>-</td>';
                }
            });
            html += '</tr>';
        }

        html += '</table>';

        // Open print dialog
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();

    } catch (error) {
        alert('Error exporting PDF: ' + error.message);
    }
}

async function exportExcel() {
    const classId = document.getElementById('excelClassSelect').value;
    if (!classId) {
        alert('Please select a class');
        return;
    }

    try {
        const classes = await DemoAPI.getClasses();
        const timetable = await DemoAPI.getTimetable(classId);
        const teachers = await DemoAPI.getTeachers();
        const subjects = await DemoAPI.getSubjects();
        const cls = classes.find(c => c.id === classId);

        let csv = 'Timetable Export\n';
        csv += `Class: ${cls.name}\n`;
        csv += `Department: ${cls.department}\n`;
        csv += `Semester: ${cls.semester}\n`;
        csv += `Date Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        csv += 'Period,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday\n';

        for (let i = 1; i <= 7; i++) {
            let row = `Period ${i}`;
            
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
                const slot = timetable.find(t => t.day === day && t.period === i.toString());
                if (slot) {
                    const teacher = teachers.find(t => t.id === slot.teacher);
                    const subject = subjects.find(s => s.id === slot.subject);
                    row += `,"${subject?.code} (${teacher?.name})"`;
                } else {
                    row += ',-';
                }
            });
            csv += row + '\n';
        }

        // Download as CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetable-${cls.name.replace(/\s+/g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        alert('Error exporting Excel: ' + error.message);
    }
}

async function generateWorkloadReport() {
    try {
        const workload = await DemoAPI.getTeacherWorkload();
        const teachers = await DemoAPI.getTeachers();

        let csv = 'Teacher Workload Report\n';
        csv += `Date Generated: ${new Date().toLocaleDateString()}\n\n`;
        csv += 'Teacher Name,Subjects Taught,Classes Assigned,Total Hours Per Week\n';

        Object.values(workload).forEach(item => {
            csv += `"${item.teacher}",${item.subjects},${item.classes},${item.totalHours}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teacher-workload-report.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('Workload report generated and downloaded!');

    } catch (error) {
        alert('Error generating report: ' + error.message);
    }
}

async function generateConflictReport() {
    try {
        const timetable = await DemoAPI.getTimetable();
        const teachers = await DemoAPI.getTeachers();
        const conflicts = [];

        // Check for conflicts
        timetable.forEach(slot => {
            const conflicting = timetable.filter(t => 
                t.teacher === slot.teacher && 
                t.day === slot.day && 
                t.period === slot.period && 
                t.id !== slot.id
            );

            if (conflicting.length > 0) {
                conflicts.push(slot);
            }
        });

        if (conflicts.length === 0) {
            alert('✓ No scheduling conflicts detected!');
            return;
        }

        let csv = 'Scheduling Conflict Report\n';
        csv += `Date Generated: ${new Date().toLocaleDateString()}\n\n`;
        csv += 'Conflicts Found,Teacher,Day,Period\n';

        conflicts.forEach(conflict => {
            const teacher = teachers.find(t => t.id === conflict.teacher);
            csv += `"${teacher?.name}","${teacher?.name}","${conflict.day}","${conflict.period}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conflict-report.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        alert('Error generating conflict report: ' + error.message);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function setupModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

function filterTable(tableBodyId, searchValue) {
    const tbody = document.getElementById(tableBodyId);
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchValue.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ============================================
// NOTIFICATIONS MODULE
// ============================================

async function loadNotifications() {
    const list = document.getElementById('adminNotifList');
    const badge = document.getElementById('notifCountBadge');
    if (!list) return;

    try {
        const notifications = await DemoAPI.getNotifications();
        if (badge) badge.textContent = notifications.length;

        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="notif-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <div>No notifications sent yet. Use the form above to send your first notification.</div>
                </div>
            `;
            return;
        }

        list.innerHTML = notifications.map(n => `
            <div class="notif-card" id="notif-${n.id}">
                <div class="notif-card-top">
                    <div class="notif-card-meta">
                        <span class="notif-type-badge ${n.type}">${getNotifTypeLabel(n.type)}</span>
                        <span class="notif-dept-badge">${n.department === 'All' ? 'All Departments' : n.department}</span>
                    </div>
                    <button class="notif-card-delete" onclick="deleteNotificationAdmin('${n.id}')" title="Delete notification">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
                <div class="notif-card-title">${escapeHtml(n.title)}</div>
                <div class="notif-card-message">${escapeHtml(n.message)}</div>
                <div class="notif-card-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${formatNotifTime(n.timestamp)}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading notifications:', error);
        list.innerHTML = '<div class="notif-empty">Error loading notifications</div>';
    }
}

async function sendNotification(e) {
    e.preventDefault();

    const title = document.getElementById('notifTitle').value.trim();
    const message = document.getElementById('notifMessage').value.trim();
    const type = document.getElementById('notifType').value;
    const department = document.getElementById('notifDept').value;

    if (!title || !message) {
        if (window.Toast) window.Toast.show('Please fill in title and message', 'error');
        return;
    }

    try {
        await DemoAPI.addNotification({ title, message, type, department });

        // Reset form
        document.getElementById('notificationForm').reset();

        // Reload list
        loadNotifications();
        updateSidebarNotifBadge();

        if (window.Toast) window.Toast.show('Notification sent successfully!', 'success');
    } catch (error) {
        console.error('Error sending notification:', error);
        if (window.Toast) window.Toast.show('Failed to send notification', 'error');
    }
}

async function deleteNotificationAdmin(id) {
    if (!confirm('Delete this notification?')) return;

    try {
        await DemoAPI.deleteNotification(id);
        
        const card = document.getElementById(`notif-${id}`);
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                card.remove();
                loadNotifications();
                updateSidebarNotifBadge();
            }, 200);
        } else {
            loadNotifications();
            updateSidebarNotifBadge();
        }

        if (window.Toast) window.Toast.show('Notification deleted', 'info');
    } catch (error) {
        console.error('Error deleting notification:', error);
        if (window.Toast) window.Toast.show('Failed to delete notification', 'error');
    }
}

async function updateSidebarNotifBadge() {
    const badge = document.getElementById('sidebarNotifBadge');
    if (!badge) return;
    try {
        const notifications = await DemoAPI.getNotifications();
        if (notifications.length > 0) {
            badge.textContent = notifications.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (e) {
        badge.classList.add('hidden');
    }
}

function getNotifTypeLabel(type) {
    const labels = { info: 'Info', warning: 'Warning', urgent: 'Urgent', event: 'Event' };
    return labels[type] || 'Info';
}

function formatNotifTime(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
