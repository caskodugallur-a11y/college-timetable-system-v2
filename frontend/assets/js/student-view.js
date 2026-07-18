// ============================================
// STUDENT VIEW — MODERN CONTROLLER
// Preserves all existing DemoAPI functions
// Adds: Teacher timetable, custom dropdown, dual PDF
// ============================================

// ── State ──
let currentViewMode = 'class'; // 'class' or 'teacher'
let selectedTeacherId = null;
let selectedTeacherName = null;
let allTeachersCache = [];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  initializeStudentView();
  initCustomTeacherDropdown();
});

async function initializeStudentView() {
  try {
    // Load departments into dropdown (preserved logic)
    const departments = ['BCA', 'BCom'];
    const deptSelect = document.getElementById('studentDept');

    deptSelect.innerHTML = '<option value="">Select Department</option>';
    departments.forEach(dept => {
      deptSelect.appendChild(new Option(dept, dept));
    });

    // Load all teachers for dropdown
    await loadAllTeachers();

  } catch (error) {
    console.error('Error initializing student view:', error);
  }
}

// ============================================
// TEACHER LOADING (preserved, enhanced)
// ============================================
async function loadAllTeachers() {
  try {
    const teachers = await DemoAPI.getTeachers();
    allTeachersCache = teachers;

    // Populate hidden select for backend compat
    const teacherSelect = document.getElementById('teacherFilter');
    if (teacherSelect) {
      teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
      teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        teacherSelect.appendChild(option);
      });
    }

    // Populate custom dropdown
    populateCustomTeacherList(teachers);

  } catch (error) {
    console.error('Error loading teachers:', error);
  }
}

// ============================================
// CUSTOM TEACHER DROPDOWN
// ============================================
function initCustomTeacherDropdown() {
  const trigger = document.getElementById('teacherTrigger');
  const panel = document.getElementById('teacherPanel');
  const searchInput = document.getElementById('teacherSearchInput');
  const wrapper = document.getElementById('teacherDropdownWrapper');

  if (!trigger || !panel) return;

  // Toggle dropdown
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      closeTeacherDropdown();
    } else {
      openTeacherDropdown();
    }
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const options = document.querySelectorAll('.sv-teacher-option');
      options.forEach(opt => {
        const name = opt.getAttribute('data-name').toLowerCase();
        opt.style.display = name.includes(query) ? 'flex' : 'none';
      });
    });
  }

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      closeTeacherDropdown();
    }
  });

  // Keyboard navigation
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger.click();
    }
  });
}

function openTeacherDropdown() {
  const trigger = document.getElementById('teacherTrigger');
  const panel = document.getElementById('teacherPanel');
  const searchInput = document.getElementById('teacherSearchInput');
  trigger.classList.add('active');
  trigger.setAttribute('aria-expanded', 'true');
  panel.classList.add('open');
  if (searchInput) {
    setTimeout(() => searchInput.focus(), 100);
  }
}

function closeTeacherDropdown() {
  const trigger = document.getElementById('teacherTrigger');
  const panel = document.getElementById('teacherPanel');
  trigger.classList.remove('active');
  trigger.setAttribute('aria-expanded', 'false');
  panel.classList.remove('open');
}

function populateCustomTeacherList(teachers) {
  const list = document.getElementById('teacherList');
  if (!list) return;
  list.innerHTML = '';

  // Add "None" option to clear
  const noneOpt = document.createElement('div');
  noneOpt.className = 'sv-teacher-option' + (selectedTeacherId === null ? ' selected' : '');
  noneOpt.setAttribute('data-name', 'none');
  noneOpt.setAttribute('data-id', '');
  noneOpt.setAttribute('role', 'option');
  noneOpt.innerHTML = `
    <div class="sv-teacher-avatar" style="background: var(--sv-bg-subtle); color: var(--sv-text-tertiary);">—</div>
    <span>None (Show class timetable)</span>
    <svg class="sv-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  `;
  noneOpt.addEventListener('click', () => selectTeacher(null, null));
  list.appendChild(noneOpt);

  // Add teacher options
  teachers.forEach(teacher => {
    const initials = teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const opt = document.createElement('div');
    opt.className = 'sv-teacher-option' + (selectedTeacherId === teacher.id ? ' selected' : '');
    opt.setAttribute('data-name', teacher.name);
    opt.setAttribute('data-id', teacher.id);
    opt.setAttribute('role', 'option');
    opt.innerHTML = `
      <div class="sv-teacher-avatar">${initials}</div>
      <span>${teacher.name}</span>
      <svg class="sv-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    opt.addEventListener('click', () => selectTeacher(teacher.id, teacher.name));
    list.appendChild(opt);
  });
}

function selectTeacher(teacherId, teacherName) {
  selectedTeacherId = teacherId;
  selectedTeacherName = teacherName;

  // Update trigger text
  const triggerText = document.querySelector('#teacherTrigger .sv-trigger-text');
  if (teacherId && teacherName) {
    triggerText.textContent = teacherName;
    triggerText.classList.remove('placeholder');
  } else {
    triggerText.textContent = 'Select Teacher';
    triggerText.classList.add('placeholder');
  }

  // Update selected state in dropdown
  document.querySelectorAll('.sv-teacher-option').forEach(opt => {
    opt.classList.toggle('selected', opt.getAttribute('data-id') === (teacherId || ''));
  });

  // Update hidden select for backend compat
  const hiddenSelect = document.getElementById('teacherFilter');
  if (hiddenSelect) {
    hiddenSelect.value = teacherId || '';
  }

  closeTeacherDropdown();

  // Switch view mode
  if (teacherId) {
    currentViewMode = 'teacher';
    showTeacherBanner(teacherName);
    loadTeacherTimetable(teacherId, teacherName);
  } else {
    currentViewMode = 'class';
    hideTeacherBanner();
    // Re-load class timetable if class is selected
    const classId = document.getElementById('studentClass').value;
    if (classId) {
      loadStudentTimetable();
    } else {
      resetTimetableView();
    }
  }
}

// ============================================
// TEACHER BANNER
// ============================================
function showTeacherBanner(name) {
  const banner = document.getElementById('teacherBanner');
  const nameEl = document.getElementById('teacherBannerName');
  if (banner && nameEl) {
    nameEl.textContent = name;
    banner.classList.add('visible');
  }
}

function hideTeacherBanner() {
  const banner = document.getElementById('teacherBanner');
  if (banner) banner.classList.remove('visible');
}

// ============================================
// RESET VIEW
// ============================================
function resetTimetableView() {
  const container = document.getElementById('studentTimetableBody');
  const title = document.getElementById('timetableTitle');
  container.innerHTML = `
    <div class="sv-placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <div class="sv-placeholder-text">Select a class to view the timetable</div>
      <div class="sv-placeholder-sub">Choose a department and class from the filters above</div>
    </div>
  `;
  title.textContent = 'Weekly Timetable';
}

// ============================================
// CLASS OPTIONS (preserved logic)
// ============================================
async function updateClassOptions() {
  try {
    const selectedDept = document.getElementById('studentDept').value;
    const classSelect = document.getElementById('studentClass');
    classSelect.innerHTML = '<option value="">Select Class</option>';

    if (!selectedDept) return;

    const classes = await DemoAPI.getClasses();
    const filteredClasses = classes.filter(cls => cls.department === selectedDept);
    filteredClasses.forEach(cls => {
      classSelect.appendChild(new Option(cls.name, cls.id));
    });

  } catch (error) {
    console.error('Error updating class options:', error);
  }
}

// ============================================
// LOAD STUDENT (CLASS) TIMETABLE — Enhanced render
// Core DemoAPI logic preserved entirely
// ============================================
async function loadStudentTimetable() {
  try {
    const classId = document.getElementById('studentClass').value;
    const container = document.getElementById('studentTimetableBody');

    if (!classId) {
      resetTimetableView();
      return;
    }

    // Clear teacher selection when loading class timetable
    if (currentViewMode === 'teacher') {
      selectTeacher(null, null);
    }
    currentViewMode = 'class';
    hideTeacherBanner();

    const classes = await DemoAPI.getClasses();
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    const clsName = cls.name;
    const clsSem = `Semester ${cls.semester}`;

    // Fetch data (preserved DemoAPI calls)
    const rawTable = await DemoAPI.getTimetable(classId);
    const teachers = await DemoAPI.getTeachers();
    const subjects = await DemoAPI.getSubjects();

    // Map data (preserved mapping logic)
    const timetableData = [];
    rawTable.forEach(slot => {
      const teacher = teachers.find(t => t.id === slot.teacher);
      const subject = subjects.find(s => s.id === slot.subject);

      timetableData.push({
        day: slot.day,
        period: slot.period,
        subject_code: subject?.code || '',
        subject_name: subject?.name || '',
        teacher_name: teacher ? teacher.name : (slot.teacher || 'Unassigned'),
        teacher_id: slot.teacher
      });
    });

    // Update title
    document.getElementById('timetableTitle').textContent = `${clsName} — ${clsSem}`;

    // Render modern table
    renderClassTimetableTable(container, timetableData);

  } catch (error) {
    console.error('Error rendering student timetable:', error);
  }
}

// ============================================
// RENDER CLASS TIMETABLE (modern table)
// ============================================
function renderClassTimetableTable(container, timetableData) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { period: '1', time: '8:30 AM', end: '9:30 AM' },
    { period: '2', time: '9:30 AM', end: '10:30 AM' },
    { period: '3', time: '10:30 AM', end: '11:25 AM' },
    { period: 'INTERVAL', time: '11:25 AM', end: '11:40 AM' },
    { period: '4', time: '11:40 AM', end: '12:30 PM' },
    { period: '5', time: '12:30 PM', end: '1:30 PM' }
  ];

  const colorCycle = ['sv-cell-blue', 'sv-cell-purple', 'sv-cell-green', 'sv-cell-amber', 'sv-cell-rose', 'sv-cell-teal'];
  const subjectColorMap = {};
  let colorIndex = 0;

  // Assign consistent colors per subject
  timetableData.forEach(item => {
    if (item.subject_name && !subjectColorMap[item.subject_name]) {
      subjectColorMap[item.subject_name] = colorCycle[colorIndex % colorCycle.length];
      colorIndex++;
    }
  });

  let html = '<table class="sv-table"><thead><tr>';
  html += '<th>Time</th>';
  days.forEach(d => { html += `<th>${d}</th>`; });
  html += '</tr></thead><tbody>';

  timeSlots.forEach(slot => {
    if (slot.period === 'INTERVAL') {
      html += `<tr class="sv-lunch-row">
        <td class="sv-time-cell">${slot.time}<span class="sv-time-range">${slot.end}</span></td>
        <td colspan="${days.length}"><div class="sv-lunch-cell">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          INTERVAL
        </div></td>
      </tr>`;
    } else {
      html += '<tr>';
      html += `<td class="sv-time-cell">${slot.time}<span class="sv-time-range">${slot.end}</span></td>`;

      days.forEach(day => {
        const cellData = timetableData.find(t => t.day === day && t.period === slot.period);
        if (cellData) {
          const colorClass = subjectColorMap[cellData.subject_name] || 'sv-cell-blue';
          html += `<td>
            <div class="sv-cell ${colorClass}" data-teacher-id="${cellData.teacher_id}">
              <div class="sv-cell-subject">${cellData.subject_name}</div>
              <div class="sv-cell-class">${cellData.teacher_name}</div>
            </div>
          </td>`;
        } else {
          html += '<td><div class="sv-cell-empty">—</div></td>';
        }
      });

      html += '</tr>';
    }
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ============================================
// TEACHER TIMETABLE — Dynamically generated
// Loops all timetable slots to find teacher's schedule
// ============================================
async function loadTeacherTimetable(teacherId, teacherName) {
  try {
    const container = document.getElementById('studentTimetableBody');
    const title = document.getElementById('timetableTitle');
    title.textContent = `${teacherName} — Weekly Schedule`;

    // Fetch ALL data (same DemoAPI calls)
    const allSlots = await DemoAPI.getTimetable();
    const classes = await DemoAPI.getClasses();
    const subjects = await DemoAPI.getSubjects();

    // Filter slots for this teacher
    const teacherSlots = allSlots.filter(s => s.teacher === teacherId);

    // Build timetable data
    const timetableData = [];
    teacherSlots.forEach(slot => {
      const cls = classes.find(c => c.id === slot.class_id);
      const subject = subjects.find(s => s.id === slot.subject);

      timetableData.push({
        day: slot.day,
        period: slot.period,
        class_name: cls?.name || 'Unknown',
        subject_name: subject?.name || '',
        subject_code: subject?.code || ''
      });
    });

    // Render teacher timetable
    renderTeacherTimetableTable(container, timetableData);

  } catch (error) {
    console.error('Error loading teacher timetable:', error);
  }
}

function renderTeacherTimetableTable(container, timetableData) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { period: '1', time: '8:30 AM', end: '9:30 AM' },
    { period: '2', time: '9:30 AM', end: '10:30 AM' },
    { period: '3', time: '10:30 AM', end: '11:25 AM' },
    { period: 'INTERVAL', time: '11:25 AM', end: '11:40 AM' },
    { period: '4', time: '11:40 AM', end: '12:30 PM' },
    { period: '5', time: '12:30 PM', end: '1:30 PM' }
  ];

  const colorCycle = ['sv-cell-purple', 'sv-cell-blue', 'sv-cell-teal', 'sv-cell-amber', 'sv-cell-green', 'sv-cell-rose'];
  const classColorMap = {};
  let colorIndex = 0;

  // Assign colors per class
  timetableData.forEach(item => {
    if (item.class_name && !classColorMap[item.class_name]) {
      classColorMap[item.class_name] = colorCycle[colorIndex % colorCycle.length];
      colorIndex++;
    }
  });

  let html = '<table class="sv-table"><thead><tr>';
  html += '<th>Time</th>';
  days.forEach(d => { html += `<th>${d}</th>`; });
  html += '</tr></thead><tbody>';

  timeSlots.forEach(slot => {
    if (slot.period === 'INTERVAL') {
      html += `<tr class="sv-lunch-row">
        <td class="sv-time-cell">${slot.time}<span class="sv-time-range">${slot.end}</span></td>
        <td colspan="${days.length}"><div class="sv-lunch-cell">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          INTERVAL
        </div></td>
      </tr>`;
    } else {
      html += '<tr>';
      html += `<td class="sv-time-cell">${slot.time}<span class="sv-time-range">${slot.end}</span></td>`;

      days.forEach(day => {
        const cellData = timetableData.find(t => t.day === day && t.period === slot.period);
        if (cellData) {
          const colorClass = classColorMap[cellData.class_name] || 'sv-cell-purple';
          html += `<td>
            <div class="sv-cell ${colorClass}">
              <div class="sv-cell-subject">${cellData.subject_name}</div>
              <div class="sv-cell-class">${cellData.class_name}</div>
            </div>
          </td>`;
        } else {
          html += '<td><div class="sv-cell-empty">—</div></td>';
        }
      });

      html += '</tr>';
    }
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ============================================
// TEACHER FILTER CHANGE (preserved for compat)
// ============================================
async function onTeacherFilterChange() {
  const teacherId = document.getElementById('teacherFilter').value;
  if (teacherId) {
    const teacher = allTeachersCache.find(t => t.id === teacherId);
    selectTeacher(teacherId, teacher?.name || 'Teacher');
  } else {
    selectTeacher(null, null);
  }
}

// Highlight teacher slots (preserved)
function highlightTeacherSlots(teacherId) {
  const cells = document.querySelectorAll('.sv-cell[data-teacher-id]');
  cells.forEach(cell => {
    const cellTeacherId = cell.getAttribute('data-teacher-id');
    if (teacherId && cellTeacherId === teacherId) {
      cell.style.outline = '2px solid var(--sv-accent)';
      cell.style.outlineOffset = '-2px';
    } else {
      cell.style.outline = '';
      cell.style.outlineOffset = '';
    }
  });
}

// ============================================
// LOAD TEACHER SCHEDULE PANEL (preserved for compat)
// Now delegates to the new teacher timetable
// ============================================
async function loadTeacherSchedulePanel(teacherId) {
  const teacher = allTeachersCache.find(t => t.id === teacherId);
  if (teacher) {
    await loadTeacherTimetable(teacherId, teacher.name);
  }
}

// ============================================
// PDF DOWNLOAD — Dual mode (class + teacher)
// Preserved print-window approach
// ============================================
async function downloadTimetablePDF() {
  try {
    if (currentViewMode === 'teacher' && selectedTeacherId) {
      await downloadTeacherPDF();
    } else {
      await downloadClassPDF();
    }
  } catch (error) {
    alert('Error downloading PDF: ' + error.message);
  }
}

// Class PDF (preserved logic, enhanced styling)
async function downloadClassPDF() {
  const classId = document.getElementById('studentClass').value;
  if (!classId) {
    if (window.Toast) {
      window.Toast.info('Please select a class first');
    } else {
      alert('Please select a class first');
    }
    return;
  }

  const classes = await DemoAPI.getClasses();
  const cls = classes.find(c => c.id === classId);
  if (!cls) return;
  const clsName = cls.name;

  const rawTable = await DemoAPI.getTimetable(classId);
  const teachers = await DemoAPI.getTeachers();
  const subjects = await DemoAPI.getSubjects();

  const timetable = [];
  rawTable.forEach(s => {
    const teachObj = teachers.find(t => t.id === s.teacher);
    const subObj = subjects.find(sub => sub.id === s.subject);
    timetable.push({
      day: s.day,
      period: s.period,
      subject_name: subObj?.name || '',
      teacher_name: teachObj?.name || ''
    });
  });

  const html = buildPDFHtml(`Class Timetable: ${clsName}`, timetable, 'class');
  printPDF(html);
}

// Teacher PDF (new)
async function downloadTeacherPDF() {
  if (!selectedTeacherId || !selectedTeacherName) return;

  const allSlots = await DemoAPI.getTimetable();
  const classes = await DemoAPI.getClasses();
  const subjects = await DemoAPI.getSubjects();

  const teacherSlots = allSlots.filter(s => s.teacher === selectedTeacherId);
  const timetable = [];
  teacherSlots.forEach(slot => {
    const cls = classes.find(c => c.id === slot.class_id);
    const subject = subjects.find(s => s.id === slot.subject);
    timetable.push({
      day: slot.day,
      period: slot.period,
      subject_name: subject?.name || '',
      class_name: cls?.name || ''
    });
  });

  const html = buildPDFHtml(`Teacher Schedule: ${selectedTeacherName}`, timetable, 'teacher');
  printPDF(html);
}

function buildPDFHtml(title, timetable, mode) {
  const periods = ['1', '2', '3', '4', '5'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let tableRows = '';
  periods.forEach(p => {
    tableRows += '<tr>';
    tableRows += `<td><strong>Period ${p}</strong></td>`;
    days.forEach(day => {
      const slot = timetable.find(t => t.day === day && t.period === p);
      if (slot) {
        const secondary = mode === 'teacher' ? slot.class_name : slot.teacher_name;
        tableRows += `<td>${slot.subject_name}<br/><small>${secondary}</small></td>`;
      } else {
        tableRows += '<td style="color:#ccc;">—</td>';
      }
    });
    tableRows += '</tr>';
  });

  return `
    <html>
    <head>
      <style>
        body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1a1a2e; }
        h1 { text-align: center; color: #4F6EF7; font-size: 20px; margin-bottom: 4px; }
        .subtitle { text-align: center; color: #64748B; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #E2E8F0; padding: 10px 8px; text-align: center; font-size: 12px; }
        th { background-color: #4F6EF7; color: white; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        tr:nth-child(even) { background-color: #F8FAFC; }
        td small { color: #64748B; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <h1>CAS KODUNGALLUR</h1>
      <div class="subtitle">${title} — Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      <table>
        <thead>
          <tr>
            <th>Period</th>
            ${days.map(d => `<th>${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">College of Applied Science, Kodungallur — IHRD</div>
    </body>
    </html>
  `;
}

function printPDF(html) {
  const printWindow = window.open('', '', 'height=600,width=900');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// ============================================
// PRESERVED — renderSidePanels (no-op now since
// sidebar panels were removed from HTML, but
// keeping the function to prevent errors)
// ============================================
async function renderSidePanels(timetableData) {
  // Side panels removed in the new design
  // This function is kept for backward compatibility
}

// ============================================
// PRESERVED — switchDashboardTab (no-op, compat)
// ============================================
function switchDashboardTab(tabName) {
  // Dashboard tabs removed in the new design
  // Kept for backward compatibility
}
window.switchDashboardTab = switchDashboardTab;
