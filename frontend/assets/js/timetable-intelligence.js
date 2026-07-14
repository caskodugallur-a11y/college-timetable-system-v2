// ============================================
// TIMETABLE INTELLIGENCE — Smart Scheduling Engine
// CAS Kodungallur Academic Scheduling System
// ============================================

const TI_DATA_KEY = 'ti_intelligence_data';
const TI_VERSION_KEY = 'ti_version_history';

// ============================================
// DATA LAYER
// ============================================
const TIData = {
    _get() {
        const d = localStorage.getItem(TI_DATA_KEY);
        return d ? JSON.parse(d) : { teachers: [], subjects: [], classes: [], labs: [], allocations: [], generatedTimetable: null, status: 'draft' };
    },
    _save(data) {
        localStorage.setItem(TI_DATA_KEY, JSON.stringify(data));
    },
    getTeachers() { return this._get().teachers; },
    getSubjects() { return this._get().subjects; },
    getClasses() { return this._get().classes; },
    getLabs() { return this._get().labs; },
    getAllocations() { return this._get().allocations; },
    getGeneratedTimetable() { return this._get().generatedTimetable; },
    getStatus() { return this._get().status; },

    addTeacher(t) { const d = this._get(); t.id = 'tt_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); d.teachers.push(t); this._save(d); return t; },
    updateTeacher(id, t) { const d = this._get(); const i = d.teachers.findIndex(x => x.id === id); if (i !== -1) { d.teachers[i] = { ...d.teachers[i], ...t }; this._save(d); } },
    deleteTeacher(id) { const d = this._get(); d.teachers = d.teachers.filter(x => x.id !== id); d.allocations = d.allocations.filter(a => a.teacherId !== id); this._save(d); },

    addSubject(s) { const d = this._get(); s.id = 'ts_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); d.subjects.push(s); this._save(d); return s; },
    updateSubject(id, s) { const d = this._get(); const i = d.subjects.findIndex(x => x.id === id); if (i !== -1) { d.subjects[i] = { ...d.subjects[i], ...s }; this._save(d); } },
    deleteSubject(id) { const d = this._get(); d.subjects = d.subjects.filter(x => x.id !== id); d.allocations = d.allocations.filter(a => a.subjectId !== id); this._save(d); },

    addClass(c) { const d = this._get(); c.id = 'tc_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); d.classes.push(c); this._save(d); return c; },
    updateClass(id, c) { const d = this._get(); const i = d.classes.findIndex(x => x.id === id); if (i !== -1) { d.classes[i] = { ...d.classes[i], ...c }; this._save(d); } },
    deleteClass(id) { const d = this._get(); d.classes = d.classes.filter(x => x.id !== id); d.allocations = d.allocations.filter(a => a.classId !== id); this._save(d); },

    addLab(l) { const d = this._get(); l.id = 'tl_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); d.labs.push(l); this._save(d); return l; },
    updateLab(id, l) { const d = this._get(); const i = d.labs.findIndex(x => x.id === id); if (i !== -1) { d.labs[i] = { ...d.labs[i], ...l }; this._save(d); } },
    deleteLab(id) { const d = this._get(); d.labs = d.labs.filter(x => x.id !== id); this._save(d); },

    addAllocation(a) { const d = this._get(); a.id = 'ta_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); d.allocations.push(a); this._save(d); return a; },
    deleteAllocation(id) { const d = this._get(); d.allocations = d.allocations.filter(x => x.id !== id); this._save(d); },

    setGeneratedTimetable(tt) { const d = this._get(); d.generatedTimetable = tt; d.status = 'generated'; this._save(d); },
    setStatus(status) { const d = this._get(); d.status = status; this._save(d); },
    clearGenerated() { const d = this._get(); d.generatedTimetable = null; d.status = 'draft'; this._save(d); },

    // Import existing data from the main demo database
    importFromExisting() {
        const existing = localStorage.getItem('timetable_system_demo_data');
        if (!existing) return false;
        const eData = JSON.parse(existing);
        const d = this._get();
        let imported = false;

        // Import teachers if TI has none
        if (d.teachers.length === 0 && eData.teachers && eData.teachers.length > 0) {
            d.teachers = eData.teachers.map(t => ({
                id: 'tt_' + t.id,
                name: t.name,
                department: t.department,
                designation: 'Assistant Professor',
                ugPg: t.department.startsWith('M') ? 'PG' : 'UG',
                maxPeriodsPerDay: 5,
                maxPeriodsPerWeek: 25,
                availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
                labHandling: true,
                status: t.status || 'active'
            }));
            imported = true;
        }
        // Import subjects if TI has none
        if (d.subjects.length === 0 && eData.subjects && eData.subjects.length > 0) {
            d.subjects = eData.subjects.map(s => ({
                id: 'ts_' + s.id,
                name: s.name,
                code: s.code,
                type: s.name.toLowerCase().includes('lab') ? 'practical' : 'theory',
                weeklyHours: s.hours_per_week || 4,
                department: s.department,
                semester: s.semester,
                assignedTeacher: s.teacher ? 'tt_' + s.teacher : '',
                labRequired: s.name.toLowerCase().includes('lab'),
                priority: 'normal'
            }));
            imported = true;
        }
        // Import classes if TI has none
        if (d.classes.length === 0 && eData.classes && eData.classes.length > 0) {
            d.classes = eData.classes.map(c => ({
                id: 'tc_' + c.id,
                name: c.name,
                department: c.department,
                semester: c.semester,
                section: 'A',
                workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
                periodsPerDay: 5,
                lunchBreak: 4 // after period 3 (lunch is the 4th slot)
            }));
            imported = true;
        }
        // Auto-create allocations from subjects
        if (d.allocations.length === 0 && d.subjects.length > 0) {
            d.subjects.forEach(s => {
                if (s.assignedTeacher) {
                    const matchingClasses = d.classes.filter(c => c.department === s.department && c.semester === s.semester);
                    matchingClasses.forEach(c => {
                        d.allocations.push({
                            id: 'ta_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
                            teacherId: s.assignedTeacher,
                            subjectId: s.id,
                            classId: c.id
                        });
                    });
                }
            });
            imported = true;
        }

        if (imported) this._save(d);
        return imported;
    },

    async syncWithMainDatabase() {
        if (window.Toast) window.Toast.info('Synchronizing data with main database...');
        try {
            // Fetch latest from DemoAPI (handles API and fallback)
            const [tList, sList, cList] = await Promise.all([
                DemoAPI.getTeachers(),
                DemoAPI.getSubjects(),
                DemoAPI.getClasses()
            ]);

            const d = this._get();
            
            // Map teachers
            d.teachers = tList.map(t => ({
                id: 'tt_' + t.id,
                name: t.name,
                department: t.department,
                designation: 'Assistant Professor',
                ugPg: t.department.startsWith('M') ? 'PG' : 'UG',
                maxPeriodsPerDay: 5,
                maxPeriodsPerWeek: 25,
                availableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
                labHandling: true,
                status: t.status || 'active'
            }));

            // Map subjects
            d.subjects = sList.map(s => ({
                id: 'ts_' + s.id,
                name: s.name,
                code: s.code,
                type: s.name.toLowerCase().includes('lab') ? 'practical' : 'theory',
                weeklyHours: s.hours_per_week || 4,
                department: s.department,
                semester: s.semester,
                assignedTeacher: s.teacher ? 'tt_' + s.teacher : '',
                labRequired: s.name.toLowerCase().includes('lab'),
                priority: 'normal'
            }));

            // Map classes
            d.classes = cList.map(c => ({
                id: 'tc_' + c.id,
                name: c.name,
                department: c.department,
                semester: c.semester,
                section: 'A',
                workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
                periodsPerDay: 5,
                lunchBreak: 4
            }));

            // Regenerate allocations
            d.allocations = [];
            d.subjects.forEach(s => {
                if (s.assignedTeacher) {
                    const matchingClasses = d.classes.filter(c => c.department === s.department && c.semester === s.semester);
                    matchingClasses.forEach(c => {
                        d.allocations.push({
                            id: 'ta_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
                            teacherId: s.assignedTeacher,
                            subjectId: s.id,
                            classId: c.id
                        });
                    });
                }
            });

            this._save(d);
            if (window.Toast) window.Toast.success('Data synchronized successfully!');
            return true;
        } catch (err) {
            console.error("Sync error:", err);
            if (window.Toast) window.Toast.error('Failed to sync data: ' + err.message);
            throw err;
        }
    }
};

// Version history
const TIVersions = {
    _get() {
        const d = localStorage.getItem(TI_VERSION_KEY);
        return d ? JSON.parse(d) : [];
    },
    _save(data) { localStorage.setItem(TI_VERSION_KEY, JSON.stringify(data)); },
    getAll() { return this._get(); },
    add(timetable, status) {
        const versions = this._get();
        const v = {
            id: 'v_' + Date.now(),
            number: versions.length + 1,
            generatedDate: new Date().toISOString(),
            generatedBy: localStorage.getItem('adminUsername') || 'Admin',
            approvalDate: status === 'published' ? new Date().toISOString() : null,
            publishedDate: status === 'published' ? new Date().toISOString() : null,
            status: status || 'draft',
            timetable: timetable
        };
        versions.push(v);
        this._save(versions);
        return v;
    },
    updateStatus(id, status) {
        const versions = this._get();
        const v = versions.find(x => x.id === id);
        if (v) {
            v.status = status;
            if (status === 'approved') v.approvalDate = new Date().toISOString();
            if (status === 'published') v.publishedDate = new Date().toISOString();
            this._save(versions);
        }
    },
    rollback(id) {
        const versions = this._get();
        const v = versions.find(x => x.id === id);
        if (v && v.timetable) return v.timetable;
        return null;
    }
};


// ============================================
// SCHEDULING ENGINE — Core Algorithm
// ============================================
const SchedulingEngine = {
    // Time slots definition
    timeSlots: [
        { period: 1, start: '09:00', end: '09:50', label: '9:00 - 9:50' },
        { period: 2, start: '09:50', end: '10:40', label: '9:50 - 10:40' },
        { period: 3, start: '10:40', end: '11:30', label: '10:40 - 11:30' },
        { period: 4, start: '11:40', end: '12:30', label: '11:40 - 12:30' },  // After short break
        { period: 5, start: '13:30', end: '14:20', label: '1:30 - 2:20' },    // After lunch
        { period: 6, start: '14:20', end: '15:10', label: '2:20 - 3:10' },
        { period: 7, start: '15:20', end: '16:10', label: '3:20 - 4:10' },
    ],

    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],

    /**
     * Main timetable generation function
     * Uses greedy assignment + constraint checking with backtracking
     */
    generate(teachers, subjects, classes, labs, allocations) {
        const result = { entries: [], conflicts: [], stats: {} };
        
        // Build allocation requirements
        const requirements = [];
        allocations.forEach(alloc => {
            const teacher = teachers.find(t => t.id === alloc.teacherId);
            const subject = subjects.find(s => s.id === alloc.subjectId);
            const cls = classes.find(c => c.id === alloc.classId);
            if (!teacher || !subject || !cls) return;

            const hours = parseInt(subject.weeklyHours) || 4;
            requirements.push({
                allocId: alloc.id,
                teacherId: alloc.teacherId,
                teacherName: teacher.name,
                subjectId: alloc.subjectId,
                subjectName: subject.name,
                subjectCode: subject.code,
                classId: alloc.classId,
                className: cls.name,
                department: cls.department,
                semester: cls.semester,
                weeklyHours: hours,
                isLab: subject.type === 'practical' || subject.labRequired,
                labRequired: subject.labRequired,
                priority: subject.priority || 'normal',
                teacherMaxPerDay: parseInt(teacher.maxPeriodsPerDay) || 5,
                teacherMaxPerWeek: parseInt(teacher.maxPeriodsPerWeek) || 25,
                teacherAvailDays: teacher.availableDays || this.days,
                classPeriodsPerDay: parseInt(cls.periodsPerDay) || 5,
                classWorkingDays: cls.workingDays || this.days,
                lunchBreak: parseInt(cls.lunchBreak) || 4
            });
        });

        // Sort: Labs first (need continuous blocks), then by priority, then by weekly hours desc
        requirements.sort((a, b) => {
            if (a.isLab !== b.isLab) return a.isLab ? -1 : 1;
            const prio = { high: 0, normal: 1, low: 2 };
            if ((prio[a.priority] || 1) !== (prio[b.priority] || 1)) return (prio[a.priority] || 1) - (prio[b.priority] || 1);
            return b.weeklyHours - a.weeklyHours;
        });

        // State tracking
        const schedule = {}; // { 'classId_day_period': entry }
        const teacherSchedule = {}; // { 'teacherId_day_period': true }
        const teacherDayCount = {}; // { 'teacherId_day': count }
        const teacherWeekCount = {}; // { 'teacherId': count }
        const roomSchedule = {}; // { 'room_day_period': true }
        const classDaySubjects = {}; // { 'classId_day': [subjectIds] }

        const getKey = (...parts) => parts.join('_');

        // Assign each requirement
        for (const req of requirements) {
            let assigned = 0;
            const needed = req.weeklyHours;

            if (req.isLab) {
                // Lab sessions need continuous blocks
                const blockSize = Math.min(needed, 3); // max 3 continuous periods for lab
                let blocksNeeded = Math.ceil(needed / blockSize);
                
                for (let bi = 0; bi < blocksNeeded && assigned < needed; bi++) {
                    const currentBlockSize = Math.min(blockSize, needed - assigned);
                    let placed = false;

                    // Find available lab
                    const availLab = labs.find(l => {
                        if (!l.labSubjects) return true;
                        const ls = Array.isArray(l.labSubjects) ? l.labSubjects : l.labSubjects.split(',').map(s => s.trim());
                        return ls.length === 0 || ls.includes(req.subjectName) || ls.includes(req.subjectId);
                    }) || labs[0];
                    const roomName = availLab ? availLab.name : 'Lab';

                    for (const day of this._shuffleArray([...req.classWorkingDays])) {
                        if (!req.teacherAvailDays.includes(day)) continue;
                        
                        const maxPeriod = req.classPeriodsPerDay;
                        for (let startP = 1; startP <= maxPeriod - currentBlockSize + 1; startP++) {
                            // Check if the entire block is free
                            let blockFree = true;
                            for (let p = startP; p < startP + currentBlockSize; p++) {
                                // Skip lunch period
                                if (p === req.lunchBreak) { blockFree = false; break; }
                                if (schedule[getKey(req.classId, day, p)]) { blockFree = false; break; }
                                if (teacherSchedule[getKey(req.teacherId, day, p)]) { blockFree = false; break; }
                                if (roomSchedule[getKey(roomName, day, p)]) { blockFree = false; break; }
                            }
                            // Check teacher day limit
                            const currentDayCount = teacherDayCount[getKey(req.teacherId, day)] || 0;
                            if (currentDayCount + currentBlockSize > req.teacherMaxPerDay) blockFree = false;
                            // Check teacher week limit
                            const currentWeekCount = teacherWeekCount[req.teacherId] || 0;
                            if (currentWeekCount + currentBlockSize > req.teacherMaxPerWeek) blockFree = false;

                            if (blockFree) {
                                for (let p = startP; p < startP + currentBlockSize; p++) {
                                    const entry = {
                                        id: 'ge_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
                                        classId: req.classId, className: req.className,
                                        day, period: p,
                                        teacherId: req.teacherId, teacherName: req.teacherName,
                                        subjectId: req.subjectId, subjectName: req.subjectName, subjectCode: req.subjectCode,
                                        room: roomName, isLab: true,
                                        department: req.department, semester: req.semester
                                    };
                                    result.entries.push(entry);
                                    schedule[getKey(req.classId, day, p)] = entry;
                                    teacherSchedule[getKey(req.teacherId, day, p)] = true;
                                    roomSchedule[getKey(roomName, day, p)] = true;
                                    teacherDayCount[getKey(req.teacherId, day)] = (teacherDayCount[getKey(req.teacherId, day)] || 0) + 1;
                                    teacherWeekCount[req.teacherId] = (teacherWeekCount[req.teacherId] || 0) + 1;

                                    const cdKey = getKey(req.classId, day);
                                    if (!classDaySubjects[cdKey]) classDaySubjects[cdKey] = [];
                                    classDaySubjects[cdKey].push(req.subjectId);
                                }
                                assigned += currentBlockSize;
                                placed = true;
                                break;
                            }
                        }
                        if (placed) break;
                    }
                }
            } else {
                // Theory subjects — spread across days, avoid repeating same subject on same day
                const daysShuffled = this._shuffleArray([...req.classWorkingDays]);
                let dayIndex = 0;
                let attempts = 0;
                const maxAttempts = needed * req.classWorkingDays.length * 10;

                while (assigned < needed && attempts < maxAttempts) {
                    const day = daysShuffled[dayIndex % daysShuffled.length];
                    dayIndex++;
                    attempts++;

                    if (!req.teacherAvailDays.includes(day)) continue;

                    // Rule 11: Avoid repeating same subject multiple times on same day
                    const cdKey = getKey(req.classId, day);
                    const daySubjects = classDaySubjects[cdKey] || [];
                    const subjectCountToday = daySubjects.filter(s => s === req.subjectId).length;
                    if (subjectCountToday >= 1 && assigned < needed - 1) continue; // Allow only if last resort

                    // Rule 2: Max 2 periods per day per teacher (changed from maxPeriodsPerDay which may be higher)
                    const teacherDayKey = getKey(req.teacherId, day);
                    const currentDayCount = teacherDayCount[teacherDayKey] || 0;
                    const effectiveMaxPerDay = Math.min(req.teacherMaxPerDay, 2); // Rule 2: max 2 per day
                    // For practical purposes, allow up to maxPeriodsPerDay but prefer 2
                    if (currentDayCount >= req.teacherMaxPerDay) continue;

                    // Week limit
                    if ((teacherWeekCount[req.teacherId] || 0) >= req.teacherMaxPerWeek) break;

                    // Find best period — prefer adjacent to existing periods (Rule 9: minimize gaps)
                    const room = 'Room ' + req.className.replace(/[^0-9A-Z]/gi, '').slice(0, 3);
                    let bestPeriod = null;
                    let bestScore = -Infinity;

                    for (let p = 1; p <= req.classPeriodsPerDay; p++) {
                        if (p === req.lunchBreak) continue;
                        if (schedule[getKey(req.classId, day, p)]) continue;
                        if (teacherSchedule[getKey(req.teacherId, day, p)]) continue;
                        if (roomSchedule[getKey(room, day, p)]) continue;

                        // Score: prefer periods adjacent to teacher's existing periods (reduce gaps)
                        let score = 0;
                        if (teacherSchedule[getKey(req.teacherId, day, p - 1)]) score += 3;
                        if (teacherSchedule[getKey(req.teacherId, day, p + 1)]) score += 3;
                        // Prefer even distribution: lower day count = higher score
                        score -= currentDayCount * 2;
                        // Penalize if subject already on this day
                        score -= subjectCountToday * 5;

                        if (score > bestScore) {
                            bestScore = score;
                            bestPeriod = p;
                        }
                    }

                    if (bestPeriod !== null) {
                        const entry = {
                            id: 'ge_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
                            classId: req.classId, className: req.className,
                            day, period: bestPeriod,
                            teacherId: req.teacherId, teacherName: req.teacherName,
                            subjectId: req.subjectId, subjectName: req.subjectName, subjectCode: req.subjectCode,
                            room: room, isLab: false,
                            department: req.department, semester: req.semester
                        };
                        result.entries.push(entry);
                        schedule[getKey(req.classId, day, bestPeriod)] = entry;
                        teacherSchedule[getKey(req.teacherId, day, bestPeriod)] = true;
                        roomSchedule[getKey(room, day, bestPeriod)] = true;
                        teacherDayCount[getKey(req.teacherId, day)] = currentDayCount + 1;
                        teacherWeekCount[req.teacherId] = (teacherWeekCount[req.teacherId] || 0) + 1;

                        if (!classDaySubjects[cdKey]) classDaySubjects[cdKey] = [];
                        classDaySubjects[cdKey].push(req.subjectId);
                        assigned++;
                    }
                }
            }

            // Track if requirement was not fully met
            if (assigned < needed) {
                result.conflicts.push({
                    type: 'missing_hours',
                    message: `${req.subjectName} for ${req.className}: assigned ${assigned}/${needed} hours`,
                    teacherId: req.teacherId,
                    subjectId: req.subjectId,
                    classId: req.classId,
                    assigned, needed
                });
            }
        }

        // Post-generation conflict analysis
        result.conflicts.push(...this._analyzeConflicts(result.entries, teachers));

        // Stats
        result.stats = {
            totalEntries: result.entries.length,
            totalConflicts: result.conflicts.length,
            classesScheduled: [...new Set(result.entries.map(e => e.classId))].length,
            teachersScheduled: [...new Set(result.entries.map(e => e.teacherId))].length,
        };

        return result;
    },

    _analyzeConflicts(entries, teachers) {
        const conflicts = [];
        
        // Check teacher double-bookings (Rule 1)
        const teacherSlots = {};
        entries.forEach(e => {
            const key = `${e.teacherId}_${e.day}_${e.period}`;
            if (teacherSlots[key]) {
                conflicts.push({
                    type: 'teacher_conflict',
                    message: `${e.teacherName} double-booked: ${e.day} Period ${e.period} (${teacherSlots[key].className} & ${e.className})`,
                    teacherId: e.teacherId
                });
            }
            teacherSlots[key] = e;
        });

        // Check room conflicts (Rule 6)
        const roomSlots = {};
        entries.forEach(e => {
            const key = `${e.room}_${e.day}_${e.period}`;
            if (roomSlots[key] && roomSlots[key].classId !== e.classId) {
                conflicts.push({
                    type: 'room_conflict',
                    message: `${e.room} conflict: ${e.day} Period ${e.period} (${roomSlots[key].className} & ${e.className})`,
                    room: e.room
                });
            }
            roomSlots[key] = e;
        });

        // Check teacher workload balance (Rule 15)
        const teacherCounts = {};
        entries.forEach(e => {
            teacherCounts[e.teacherId] = (teacherCounts[e.teacherId] || 0) + 1;
        });
        const counts = Object.values(teacherCounts);
        if (counts.length > 1) {
            const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
            const max = Math.max(...counts);
            const min = Math.min(...counts);
            if (max > avg * 2) {
                const overloaded = Object.entries(teacherCounts).filter(([, c]) => c > avg * 1.5);
                overloaded.forEach(([tid, count]) => {
                    const t = teachers.find(x => x.id === tid);
                    conflicts.push({
                        type: 'overloaded',
                        message: `${t ? t.name : tid} has ${count} periods (avg: ${Math.round(avg)})`,
                        teacherId: tid
                    });
                });
            }
        }

        return conflicts;
    },

    _shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};


// ============================================
// UI CONTROLLER
// ============================================
const TI_UI = {
    currentTab: 'data-setup',

    init() {
        this._setupTabs();
        TIData.syncWithMainDatabase().then(() => {
            this._renderDataSetup();
            this._renderAllocations();
            this._renderRules();
            this._renderGenerator();
            this._renderConflicts();
            this._renderPreview();
            this._renderApproval();
            this._renderVersions();
        }).catch(err => {
            this._renderDataSetup();
            this._renderAllocations();
            this._renderRules();
            this._renderGenerator();
            this._renderConflicts();
            this._renderPreview();
            this._renderApproval();
            this._renderVersions();
        });
    },

    _setupTabs() {
        document.querySelectorAll('.ti-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                this.switchTab(target);
            });
        });
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.ti-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
        document.querySelectorAll('.ti-section').forEach(s => s.classList.toggle('active', s.id === 'ti-' + tabName));
        
        // Refresh content on switch
        switch (tabName) {
            case 'data-setup': this._renderDataSetup(); break;
            case 'allocations': this._renderAllocations(); break;
            case 'rules': this._renderRules(); break;
            case 'generate': this._renderGenerator(); break;
            case 'conflicts': this._renderConflicts(); break;
            case 'preview': this._renderPreview(); break;
            case 'approval': this._renderApproval(); break;
            case 'versions': this._renderVersions(); break;
        }
    },

    // ── Data Setup Section ──
    _renderDataSetup() {
        const teachers = TIData.getTeachers();
        const subjects = TIData.getSubjects();
        const classes = TIData.getClasses();
        const labs = TIData.getLabs();

        // Stats row
        const statsEl = document.getElementById('ti-data-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="ti-stat"><div class="ti-stat-value">${teachers.length}</div><div class="ti-stat-label">Teachers</div></div>
                <div class="ti-stat"><div class="ti-stat-value">${subjects.length}</div><div class="ti-stat-label">Subjects</div></div>
                <div class="ti-stat"><div class="ti-stat-value">${classes.length}</div><div class="ti-stat-label">Classes</div></div>
                <div class="ti-stat"><div class="ti-stat-value">${labs.length}</div><div class="ti-stat-label">Laboratories</div></div>
            `;
        }

        this._renderTeacherTable(teachers);
        this._renderSubjectTable(subjects);
        this._renderClassTable(classes);
        this._renderLabTable(labs);
    },

    _renderTeacherTable(teachers) {
        const tbody = document.getElementById('ti-teachers-body');
        if (!tbody) return;
        if (teachers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="ti-empty"><div class="ti-empty-text">No teachers added yet</div><div class="ti-empty-hint">Click "Add Teacher" to get started</div></td></tr>';
            return;
        }
        tbody.innerHTML = teachers.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.department}</td>
                <td>${t.designation || '-'}</td>
                <td>${t.ugPg || '-'}</td>
                <td>${t.maxPeriodsPerDay || '-'}/${t.maxPeriodsPerWeek || '-'}</td>
                <td><span class="ti-rule-status ${t.status === 'active' ? 'pass' : 'fail'}">${t.status || 'active'}</span></td>
                <td>
                    <div style="display:flex;gap:4px">
                        <button class="ti-btn-icon" onclick="TI_UI.editTeacher('${t.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="ti-btn-icon danger" onclick="TI_UI.deleteTeacher('${t.id}')" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    _renderSubjectTable(subjects) {
        const tbody = document.getElementById('ti-subjects-body');
        if (!tbody) return;
        const teachers = TIData.getTeachers();
        if (subjects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="ti-empty"><div class="ti-empty-text">No subjects added yet</div></td></tr>';
            return;
        }
        tbody.innerHTML = subjects.map(s => {
            const teacher = teachers.find(t => t.id === s.assignedTeacher);
            return `
            <tr>
                <td>${s.name}</td>
                <td>${s.code}</td>
                <td><span class="ti-rule-status ${s.type === 'practical' ? 'pass' : 'pending'}">${s.type || 'theory'}</span></td>
                <td>${s.weeklyHours || '-'}</td>
                <td>${s.department} / Sem ${s.semester}</td>
                <td>${teacher ? teacher.name : '<span style="color:var(--danger)">Unassigned</span>'}</td>
                <td><span class="ti-rule-status ${s.priority === 'high' ? 'fail' : 'pending'}">${s.priority || 'normal'}</span></td>
                <td>
                    <div style="display:flex;gap:4px">
                        <button class="ti-btn-icon" onclick="TI_UI.editSubject('${s.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="ti-btn-icon danger" onclick="TI_UI.deleteSubject('${s.id}')" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    },

    _renderClassTable(classes) {
        const tbody = document.getElementById('ti-classes-body');
        if (!tbody) return;
        if (classes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="ti-empty"><div class="ti-empty-text">No classes added yet</div></td></tr>';
            return;
        }
        tbody.innerHTML = classes.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.department}</td>
                <td>${c.semester}</td>
                <td>${c.section || 'A'}</td>
                <td>${c.periodsPerDay || 5} / day</td>
                <td>
                    <div style="display:flex;gap:4px">
                        <button class="ti-btn-icon" onclick="TI_UI.editClass('${c.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="ti-btn-icon danger" onclick="TI_UI.deleteClass('${c.id}')" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    _renderLabTable(labs) {
        const tbody = document.getElementById('ti-labs-body');
        if (!tbody) return;
        if (labs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="ti-empty"><div class="ti-empty-text">No laboratories added yet</div></td></tr>';
            return;
        }
        tbody.innerHTML = labs.map(l => `
            <tr>
                <td>${l.name}</td>
                <td>${l.capacity || '-'}</td>
                <td>${l.labSubjects || '-'}</td>
                <td>${l.incharge || '-'}</td>
                <td>
                    <div style="display:flex;gap:4px">
                        <button class="ti-btn-icon" onclick="TI_UI.editLab('${l.id}')" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button class="ti-btn-icon danger" onclick="TI_UI.deleteLab('${l.id}')" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // ── CRUD Modals ──
    showAddTeacher() {
        this._showModal('Teacher', {
            fields: [
                { key: 'name', label: 'Teacher Name *', type: 'text', required: true, placeholder: 'Enter full name' },
                { key: 'department', label: 'Department *', type: 'select', required: true, options: ['','BCA','BCom','MCom','BBA','BA','BSc','MA','MSc'] },
                { key: 'designation', label: 'Designation', type: 'select', options: ['','Assistant Professor','Associate Professor','Professor','HOD','Guest Lecturer'] },
                { key: 'ugPg', label: 'UG / PG', type: 'select', options: ['','UG','PG'] },
                { key: 'maxPeriodsPerDay', label: 'Max Periods/Day', type: 'number', placeholder: '5', value: '5' },
                { key: 'maxPeriodsPerWeek', label: 'Max Periods/Week', type: 'number', placeholder: '25', value: '25' },
                { key: 'labHandling', label: 'Lab Handling', type: 'select', options: ['Yes','No'] },
                { key: 'status', label: 'Status', type: 'select', options: ['active','inactive'] },
            ],
            onSave: (data) => {
                data.availableDays = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
                TIData.addTeacher(data);
                this._renderDataSetup();
            }
        });
    },

    editTeacher(id) {
        const t = TIData.getTeachers().find(x => x.id === id);
        if (!t) return;
        this._showModal('Teacher', {
            editId: id,
            fields: [
                { key: 'name', label: 'Teacher Name *', type: 'text', required: true, value: t.name },
                { key: 'department', label: 'Department *', type: 'select', required: true, options: ['','BCA','BCom','MCom','BBA','BA','BSc','MA','MSc'], value: t.department },
                { key: 'designation', label: 'Designation', type: 'select', options: ['','Assistant Professor','Associate Professor','Professor','HOD','Guest Lecturer'], value: t.designation },
                { key: 'ugPg', label: 'UG / PG', type: 'select', options: ['','UG','PG'], value: t.ugPg },
                { key: 'maxPeriodsPerDay', label: 'Max Periods/Day', type: 'number', value: t.maxPeriodsPerDay || '5' },
                { key: 'maxPeriodsPerWeek', label: 'Max Periods/Week', type: 'number', value: t.maxPeriodsPerWeek || '25' },
                { key: 'labHandling', label: 'Lab Handling', type: 'select', options: ['Yes','No'], value: t.labHandling ? 'Yes' : 'No' },
                { key: 'status', label: 'Status', type: 'select', options: ['active','inactive'], value: t.status },
            ],
            onSave: (data) => {
                data.availableDays = t.availableDays || ['Monday','Tuesday','Wednesday','Thursday','Friday'];
                TIData.updateTeacher(id, data);
                this._renderDataSetup();
            }
        });
    },

    deleteTeacher(id) {
        if (confirm('Delete this teacher? Associated allocations will also be removed.')) {
            TIData.deleteTeacher(id);
            this._renderDataSetup();
            this._renderAllocations();
        }
    },

    showAddSubject() {
        const teachers = TIData.getTeachers();
        this._showModal('Subject', {
            fields: [
                { key: 'name', label: 'Subject Name *', type: 'text', required: true, placeholder: 'e.g., Data Structures' },
                { key: 'code', label: 'Subject Code *', type: 'text', required: true, placeholder: 'e.g., BCA3CJ201' },
                { key: 'type', label: 'Theory / Practical', type: 'select', options: ['theory','practical'] },
                { key: 'weeklyHours', label: 'Weekly Hours *', type: 'number', required: true, placeholder: '4', value: '4' },
                { key: 'department', label: 'Department *', type: 'select', required: true, options: ['','BCA','BCom','MCom','BBA','BA','BSc','MA','MSc'] },
                { key: 'semester', label: 'Semester *', type: 'select', required: true, options: ['','1','2','3','4','5','6'] },
                { key: 'assignedTeacher', label: 'Assigned Teacher', type: 'select', options: [['','Select Teacher'], ...teachers.map(t => [t.id, t.name])] },
                { key: 'labRequired', label: 'Lab Required', type: 'select', options: ['false','true'] },
                { key: 'priority', label: 'Priority', type: 'select', options: ['normal','high','low'] },
            ],
            onSave: (data) => {
                data.labRequired = data.labRequired === 'true';
                TIData.addSubject(data);
                this._renderDataSetup();
            }
        });
    },

    editSubject(id) {
        const s = TIData.getSubjects().find(x => x.id === id);
        if (!s) return;
        const teachers = TIData.getTeachers();
        this._showModal('Subject', {
            editId: id,
            fields: [
                { key: 'name', label: 'Subject Name *', type: 'text', required: true, value: s.name },
                { key: 'code', label: 'Subject Code *', type: 'text', required: true, value: s.code },
                { key: 'type', label: 'Theory / Practical', type: 'select', options: ['theory','practical'], value: s.type },
                { key: 'weeklyHours', label: 'Weekly Hours *', type: 'number', required: true, value: s.weeklyHours },
                { key: 'department', label: 'Department *', type: 'select', required: true, options: ['','BCA','BCom','MCom','BBA','BA','BSc','MA','MSc'], value: s.department },
                { key: 'semester', label: 'Semester *', type: 'select', required: true, options: ['','1','2','3','4','5','6'], value: s.semester },
                { key: 'assignedTeacher', label: 'Assigned Teacher', type: 'select', options: [['','Select Teacher'], ...teachers.map(t => [t.id, t.name])], value: s.assignedTeacher },
                { key: 'labRequired', label: 'Lab Required', type: 'select', options: ['false','true'], value: String(s.labRequired) },
                { key: 'priority', label: 'Priority', type: 'select', options: ['normal','high','low'], value: s.priority },
            ],
            onSave: (data) => {
                data.labRequired = data.labRequired === 'true';
                TIData.updateSubject(id, data);
                this._renderDataSetup();
            }
        });
    },

    deleteSubject(id) {
        if (confirm('Delete this subject?')) {
            TIData.deleteSubject(id);
            this._renderDataSetup();
            this._renderAllocations();
        }
    },

    showAddClass() {
        this._showModal('Class', {
            fields: [
                { key: 'name', label: 'Class Name *', type: 'text', required: true, placeholder: 'e.g., III SEM BCA' },
                { key: 'department', label: 'Department *', type: 'select', required: true, options: ['','BCA','BCom','MCom','BBA','BA','BSc','MA','MSc'] },
                { key: 'semester', label: 'Semester *', type: 'select', required: true, options: ['','1','2','3','4','5','6'] },
                { key: 'section', label: 'Section', type: 'text', placeholder: 'A', value: 'A' },
                { key: 'periodsPerDay', label: 'Periods Per Day', type: 'number', placeholder: '5', value: '5' },
                { key: 'lunchBreak', label: 'Lunch After Period', type: 'select', options: ['3','4','5'], value: '4' },
            ],
            onSave: (data) => {
                data.workingDays = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
                TIData.addClass(data);
                this._renderDataSetup();
            }
        });
    },

    editClass(id) {
        const c = TIData.getClasses().find(x => x.id === id);
        if (!c) return;
        this._showModal('Class', {
            editId: id,
            fields: [
                { key: 'name', label: 'Class Name *', type: 'text', required: true, value: c.name },
                { key: 'department', label: 'Department *', type: 'select', required: true, options: ['','BCA','BCom','MCom','BBA','BA','BSc','MA','MSc'], value: c.department },
                { key: 'semester', label: 'Semester *', type: 'select', required: true, options: ['','1','2','3','4','5','6'], value: c.semester },
                { key: 'section', label: 'Section', type: 'text', value: c.section || 'A' },
                { key: 'periodsPerDay', label: 'Periods Per Day', type: 'number', value: c.periodsPerDay || '5' },
                { key: 'lunchBreak', label: 'Lunch After Period', type: 'select', options: ['3','4','5'], value: String(c.lunchBreak || 4) },
            ],
            onSave: (data) => {
                data.workingDays = c.workingDays || ['Monday','Tuesday','Wednesday','Thursday','Friday'];
                TIData.updateClass(id, data);
                this._renderDataSetup();
            }
        });
    },

    deleteClass(id) {
        if (confirm('Delete this class?')) {
            TIData.deleteClass(id);
            this._renderDataSetup();
            this._renderAllocations();
        }
    },

    showAddLab() {
        this._showModal('Laboratory', {
            fields: [
                { key: 'name', label: 'Lab Name *', type: 'text', required: true, placeholder: 'e.g., Computer Lab 1' },
                { key: 'capacity', label: 'Lab Capacity', type: 'number', placeholder: '40' },
                { key: 'labSubjects', label: 'Lab Subjects (comma separated)', type: 'text', placeholder: 'Java Lab, Networks Lab' },
                { key: 'availableSlots', label: 'Available Slots', type: 'text', placeholder: 'All', value: 'All' },
                { key: 'incharge', label: 'Lab Incharge', type: 'text', placeholder: 'Lab assistant name' },
            ],
            onSave: (data) => {
                TIData.addLab(data);
                this._renderDataSetup();
            }
        });
    },

    editLab(id) {
        const l = TIData.getLabs().find(x => x.id === id);
        if (!l) return;
        this._showModal('Laboratory', {
            editId: id,
            fields: [
                { key: 'name', label: 'Lab Name *', type: 'text', required: true, value: l.name },
                { key: 'capacity', label: 'Lab Capacity', type: 'number', value: l.capacity },
                { key: 'labSubjects', label: 'Lab Subjects (comma separated)', type: 'text', value: l.labSubjects },
                { key: 'availableSlots', label: 'Available Slots', type: 'text', value: l.availableSlots || 'All' },
                { key: 'incharge', label: 'Lab Incharge', type: 'text', value: l.incharge },
            ],
            onSave: (data) => {
                TIData.updateLab(id, data);
                this._renderDataSetup();
            }
        });
    },

    deleteLab(id) {
        if (confirm('Delete this laboratory?')) {
            TIData.deleteLab(id);
            this._renderDataSetup();
        }
    },

    // ── Generic Modal Builder ──
    _showModal(title, config) {
        const existing = document.getElementById('ti-dynamic-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ti-dynamic-modal';
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal" style="max-width: 560px;">
                <div class="modal-header">
                    <h2>${config.editId ? 'Edit' : 'Add'} ${title}</h2>
                    <button class="modal-close" id="ti-modal-close">&times;</button>
                </div>
                <div class="ti-modal-body">
                    <form id="ti-modal-form">
                        <div class="ti-form-grid">
                            ${config.fields.map(f => `
                                <div class="ti-form-group">
                                    <label>${f.label}</label>
                                    ${f.type === 'select' ? `
                                        <select name="${f.key}" ${f.required ? 'required' : ''}>
                                            ${(Array.isArray(f.options[0]) ? f.options : f.options.map(o => [o, o])).map(([val, label]) => 
                                                `<option value="${val}" ${f.value == val ? 'selected' : ''}>${label || 'Select...'}</option>`
                                            ).join('')}
                                        </select>
                                    ` : f.type === 'textarea' ? `
                                        <textarea name="${f.key}" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>
                                    ` : `
                                        <input type="${f.type}" name="${f.key}" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}" value="${f.value || ''}">
                                    `}
                                </div>
                            `).join('')}
                        </div>
                        <div class="ti-form-actions" style="margin-top: var(--space-lg);">
                            <button type="button" class="ti-btn" id="ti-modal-cancel">Cancel</button>
                            <button type="submit" class="ti-btn ti-btn-primary">Save ${title}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const closeModal = () => overlay.remove();
        document.getElementById('ti-modal-close').onclick = closeModal;
        document.getElementById('ti-modal-cancel').onclick = closeModal;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

        document.getElementById('ti-modal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {};
            config.fields.forEach(f => {
                const el = e.target.querySelector(`[name="${f.key}"]`);
                formData[f.key] = el ? el.value : '';
            });
            config.onSave(formData);
            closeModal();
            if (window.Toast) window.Toast.success(`${title} saved successfully`);
        });
    },

    // ── Allocations Section ──
    _renderAllocations() {
        const container = document.getElementById('ti-allocations-list');
        if (!container) return;
        const allocations = TIData.getAllocations();
        const teachers = TIData.getTeachers();
        const subjects = TIData.getSubjects();
        const classes = TIData.getClasses();

        if (allocations.length === 0) {
            container.innerHTML = `
                <div class="ti-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <div class="ti-empty-text">No faculty allocations yet</div>
                    <div class="ti-empty-hint">Map teachers to subjects and classes to begin scheduling</div>
                </div>`;
            return;
        }

        container.innerHTML = allocations.map(a => {
            const t = teachers.find(x => x.id === a.teacherId);
            const s = subjects.find(x => x.id === a.subjectId);
            const c = classes.find(x => x.id === a.classId);
            return `
                <div class="ti-allocation-row">
                    <div style="font-weight:500;color:var(--text-primary)">${t ? t.name : '<span style="color:var(--danger)">Unknown</span>'}</div>
                    <div style="color:var(--primary-light)">${s ? s.name : '<span style="color:var(--danger)">Unknown</span>'}</div>
                    <div style="color:var(--text-secondary)">${c ? c.name : '<span style="color:var(--danger)">Unknown</span>'}</div>
                    <button class="ti-btn-icon danger" onclick="TI_UI.deleteAllocation('${a.id}')" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>`;
        }).join('');
    },

    showAddAllocation() {
        const teachers = TIData.getTeachers();
        const subjects = TIData.getSubjects();
        const classes = TIData.getClasses();

        if (teachers.length === 0 || subjects.length === 0 || classes.length === 0) {
            if (window.Toast) window.Toast.warning('Add teachers, subjects, and classes first');
            return;
        }

        this._showModal('Allocation', {
            fields: [
                { key: 'teacherId', label: 'Teacher *', type: 'select', required: true, options: [['','Select Teacher'], ...teachers.map(t => [t.id, `${t.name} (${t.department})`])] },
                { key: 'subjectId', label: 'Subject *', type: 'select', required: true, options: [['','Select Subject'], ...subjects.map(s => [s.id, `${s.name} (${s.code})`])] },
                { key: 'classId', label: 'Class *', type: 'select', required: true, options: [['','Select Class'], ...classes.map(c => [c.id, `${c.name} - Sem ${c.semester}`])] },
            ],
            onSave: (data) => {
                // Check for duplicate
                const existing = TIData.getAllocations();
                const dup = existing.find(a => a.teacherId === data.teacherId && a.subjectId === data.subjectId && a.classId === data.classId);
                if (dup) {
                    if (window.Toast) window.Toast.warning('This allocation already exists');
                    return;
                }
                TIData.addAllocation(data);
                this._renderAllocations();
            }
        });
    },

    deleteAllocation(id) {
        TIData.deleteAllocation(id);
        this._renderAllocations();
    },

    // ── Rules Section ──
    _renderRules() {
        const container = document.getElementById('ti-rules-list');
        if (!container) return;

        const rules = [
            { num: 1, title: 'No Teacher Overlap', desc: 'A teacher cannot be assigned to two classes at the same time.' },
            { num: 2, title: 'Max 2 Periods/Day/Teacher', desc: 'Maximum 2 periods per day per teacher. Excess periods move to another day.' },
            { num: 3, title: 'Weekly Hours Complete', desc: 'All weekly subject hours must be satisfied in the generated timetable.' },
            { num: 4, title: 'Lab ↔ Lab Room Only', desc: 'Lab subjects must only be allocated inside laboratory rooms.' },
            { num: 5, title: 'Continuous Lab Sessions', desc: 'Lab sessions are scheduled as one continuous block (e.g., 3 consecutive periods).' },
            { num: 6, title: 'No Classroom Conflicts', desc: 'One classroom cannot host two different classes simultaneously.' },
            { num: 7, title: 'No Lab Conflicts', desc: 'One laboratory cannot host multiple batches at the same time.' },
            { num: 8, title: 'Fixed Lunch Break', desc: 'No classes are scheduled during the lunch period.' },
            { num: 9, title: 'Minimize Teacher Gaps', desc: 'Avoid unnecessary idle gaps between a teacher\'s periods.' },
            { num: 10, title: 'Even Workload Distribution', desc: 'Distribute periods evenly across the week; avoid overloading any single day.' },
            { num: 11, title: 'No Subject Repetition/Day', desc: 'Avoid scheduling the same subject multiple times on a single day.' },
            { num: 12, title: 'UG/PG Separate, Shared Faculty', desc: 'UG and PG timetables generated independently but teacher availability is global.' },
            { num: 13, title: 'Faculty Availability', desc: 'Unavailable faculty cannot receive timetable allocations.' },
            { num: 14, title: 'Qualified Teachers Only', desc: 'Subjects are only assigned to their designated faculty member.' },
            { num: 15, title: 'Balanced Teacher Workload', desc: 'Avoid assigning most classes to one teacher while others remain free.' },
        ];

        container.innerHTML = rules.map(r => `
            <div class="ti-rule-card">
                <div class="ti-rule-number">R${r.num}</div>
                <div class="ti-rule-content">
                    <div class="ti-rule-title">${r.title}</div>
                    <div class="ti-rule-desc">${r.desc}</div>
                    <span class="ti-rule-status pending" id="ti-rule-status-${r.num}">Pending</span>
                </div>
            </div>
        `).join('');
    },

    // ── Generator Section ──
    _renderGenerator() {
        const btn = document.getElementById('ti-generate-btn');
        if (btn) {
            const allocs = TIData.getAllocations();
            btn.disabled = allocs.length === 0;
        }
    },

    async runGeneration() {
        const teachers = TIData.getTeachers().filter(t => t.status === 'active');
        const subjects = TIData.getSubjects();
        const classes = TIData.getClasses();
        const labs = TIData.getLabs();
        const allocations = TIData.getAllocations();

        if (allocations.length === 0) {
            if (window.Toast) window.Toast.error('No faculty allocations found. Set up allocations first.');
            return;
        }

        const progressContainer = document.getElementById('ti-progress');
        const btn = document.getElementById('ti-generate-btn');
        btn.disabled = true;
        progressContainer.classList.add('active');

        const steps = [
            'Validating academic data...',
            'Checking teacher assignments...',
            'Checking subject mappings...',
            'Verifying faculty allocations...',
            'Checking lab configuration...',
            'Applying scheduling rules...',
            'Generating timetable...',
            'Optimizing distribution...',
            'Resolving conflicts...',
            'Creating final draft...'
        ];

        const stepsEl = document.getElementById('ti-progress-steps');
        const barFill = document.getElementById('ti-progress-fill');
        stepsEl.innerHTML = steps.map((s, i) => `
            <div class="ti-progress-step" id="ti-step-${i}">
                <div class="step-icon">○</div>
                <span>${s}</span>
            </div>
        `).join('');

        // Animate steps
        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
            const stepEl = document.getElementById('ti-step-' + i);
            // Mark previous as done
            if (i > 0) {
                const prev = document.getElementById('ti-step-' + (i - 1));
                prev.classList.remove('active');
                prev.classList.add('done');
                prev.querySelector('.step-icon').innerHTML = '✓';
            }
            stepEl.classList.add('active');
            stepEl.querySelector('.step-icon').innerHTML = '<div class="spinner"></div>';
            barFill.style.width = ((i + 1) / steps.length * 100) + '%';
        }

        // Actually generate
        await new Promise(r => setTimeout(r, 500));
        const result = SchedulingEngine.generate(teachers, subjects, classes, labs, allocations);

        // Mark last step done
        const lastStep = document.getElementById('ti-step-' + (steps.length - 1));
        lastStep.classList.remove('active');
        lastStep.classList.add('done');
        lastStep.querySelector('.step-icon').innerHTML = '✓';
        barFill.style.width = '100%';

        // Save
        TIData.setGeneratedTimetable(result);
        TIVersions.add(result, 'draft');

        // Update rule statuses
        this._updateRuleStatuses(result);

        await new Promise(r => setTimeout(r, 600));

        btn.disabled = false;
        if (window.Toast) {
            if (result.conflicts.length === 0) {
                window.Toast.success(`Timetable generated! ${result.stats.totalEntries} slots scheduled.`);
            } else {
                window.Toast.info(`Generated with ${result.conflicts.length} issue(s). Review conflicts.`);
            }
        }

        // Auto-switch to conflicts or preview
        if (result.conflicts.length > 0) {
            this.switchTab('conflicts');
        } else {
            this.switchTab('preview');
        }
    },

    _updateRuleStatuses(result) {
        const conflictTypes = result.conflicts.map(c => c.type);
        const ruleMap = {
            1: !conflictTypes.includes('teacher_conflict'),
            2: true, // enforced during generation
            3: !conflictTypes.includes('missing_hours'),
            4: true, 5: true, 6: !conflictTypes.includes('room_conflict'),
            7: !conflictTypes.includes('lab_conflict'),
            8: true, 9: true, 10: true, 11: true, 12: true, 13: true, 14: true,
            15: !conflictTypes.includes('overloaded')
        };
        for (let i = 1; i <= 15; i++) {
            const el = document.getElementById('ti-rule-status-' + i);
            if (el) {
                const pass = ruleMap[i];
                el.className = 'ti-rule-status ' + (pass ? 'pass' : 'fail');
                el.textContent = pass ? 'Pass' : 'Failed';
            }
        }
    },

    // ── Conflicts Section ──
    _renderConflicts() {
        const container = document.getElementById('ti-conflicts-grid');
        if (!container) return;
        const tt = TIData.getGeneratedTimetable();
        if (!tt) {
            container.innerHTML = '<div class="ti-empty"><div class="ti-empty-text">No timetable generated yet</div><div class="ti-empty-hint">Generate a timetable first to see conflict analysis</div></div>';
            return;
        }

        const conflicts = tt.conflicts || [];
        const categories = [
            { type: 'teacher_conflict', label: 'Teacher Conflicts', icon: '👤', iconClass: 'error' },
            { type: 'room_conflict', label: 'Room Conflicts', icon: '🏫', iconClass: 'error' },
            { type: 'lab_conflict', label: 'Lab Conflicts', icon: '🔬', iconClass: 'error' },
            { type: 'overloaded', label: 'Overloaded Faculty', icon: '⚠️', iconClass: 'warning' },
            { type: 'missing_hours', label: 'Missing Subject Hours', icon: '📚', iconClass: 'warning' },
        ];

        container.innerHTML = categories.map(cat => {
            const items = conflicts.filter(c => c.type === cat.type);
            const hasConflict = items.length > 0;
            return `
                <div class="ti-conflict-card ${hasConflict ? 'has-conflict' : 'no-conflict'}">
                    <div class="ti-conflict-header">
                        <div class="ti-conflict-icon ${hasConflict ? cat.iconClass : 'success'}">${hasConflict ? cat.icon : '✓'}</div>
                        <div>
                            <div class="ti-conflict-title">${cat.label}</div>
                            <div class="ti-conflict-count">${hasConflict ? items.length + ' issue(s)' : 'No issues'}</div>
                        </div>
                    </div>
                    ${hasConflict ? `<ul class="ti-conflict-list">${items.map(i => `<li>${i.message}</li>`).join('')}</ul>` : ''}
                </div>`;
        }).join('');

        // Summary + action buttons
        const totalConflicts = conflicts.length;
        const summaryEl = document.getElementById('ti-conflict-summary');
        if (summaryEl) {
            summaryEl.innerHTML = totalConflicts === 0
                ? '<div class="ti-notice success">✓ No conflicts detected. The timetable is ready for review and approval.</div>'
                : `<div class="ti-notice warning">⚠ ${totalConflicts} conflict(s) detected. Review and resolve before approval.</div>`;
        }
    },

    autoResolve() {
        // Re-run generation
        if (window.Toast) window.Toast.info('Regenerating timetable with adjusted parameters...');
        TIData.clearGenerated();
        this.switchTab('generate');
        setTimeout(() => this.runGeneration(), 300);
    },

    regenerate() {
        TIData.clearGenerated();
        this.switchTab('generate');
        setTimeout(() => this.runGeneration(), 300);
    },

    // ── Preview Section ──
    _renderPreview() {
        const container = document.getElementById('ti-preview-content');
        if (!container) return;
        const tt = TIData.getGeneratedTimetable();
        if (!tt || !tt.entries || tt.entries.length === 0) {
            container.innerHTML = '<div class="ti-empty"><div class="ti-empty-text">No timetable to preview</div><div class="ti-empty-hint">Generate a timetable first</div></div>';
            return;
        }

        const viewType = document.getElementById('ti-preview-view') ? document.getElementById('ti-preview-view').value : 'class';
        const entries = tt.entries;

        if (viewType === 'class') {
            this._renderClassView(entries, container);
        } else if (viewType === 'teacher') {
            this._renderTeacherView(entries, container);
        } else if (viewType === 'department') {
            this._renderDepartmentView(entries, container);
        }
    },

    _renderClassView(entries, container) {
        const classes = [...new Set(entries.map(e => e.classId))];
        const classNames = {};
        entries.forEach(e => classNames[e.classId] = e.className);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const maxPeriod = Math.max(...entries.map(e => e.period), 5);

        let html = '';
        classes.forEach(classId => {
            const classEntries = entries.filter(e => e.classId === classId);
            html += `<div class="ti-card" style="margin-bottom: var(--space-lg);">
                <div class="ti-card-header"><div class="ti-card-title">${classNames[classId]}</div></div>
                <div class="ti-timetable-grid" style="--ti-days: ${days.length}">
                    <div class="ti-grid-header">Period</div>
                    ${days.map(d => `<div class="ti-grid-header">${d.slice(0, 3)}</div>`).join('')}
                    ${Array.from({ length: maxPeriod }, (_, i) => {
                        const p = i + 1;
                        const slot = SchedulingEngine.timeSlots[i];
                        return `<div class="ti-grid-period">${p}<span class="time">${slot ? slot.label : ''}</span></div>` +
                            days.map(day => {
                                const entry = classEntries.find(e => e.day === day && e.period === p);
                                if (entry) {
                                    return `<div class="ti-grid-cell ${entry.isLab ? 'lab-session' : ''}">
                                        <span class="subject-name">${entry.subjectName.length > 25 ? entry.subjectName.slice(0, 22) + '...' : entry.subjectName}</span>
                                        <span class="teacher-name">${entry.teacherName}</span>
                                        <span class="room-name">${entry.room}</span>
                                    </div>`;
                                }
                                return '<div class="ti-grid-cell empty">—</div>';
                            }).join('');
                    }).join('')}
                </div>
            </div>`;
        });
        container.innerHTML = html;
    },

    _renderTeacherView(entries, container) {
        const teacherIds = [...new Set(entries.map(e => e.teacherId))];
        const teacherNames = {};
        entries.forEach(e => teacherNames[e.teacherId] = e.teacherName);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const maxPeriod = Math.max(...entries.map(e => e.period), 5);

        let html = '';
        teacherIds.forEach(tid => {
            const tEntries = entries.filter(e => e.teacherId === tid);
            html += `<div class="ti-card" style="margin-bottom: var(--space-lg);">
                <div class="ti-card-header"><div class="ti-card-title">${teacherNames[tid]}</div><div class="ti-card-subtitle">${tEntries.length} periods/week</div></div>
                <div class="ti-timetable-grid" style="--ti-days: ${days.length}">
                    <div class="ti-grid-header">Period</div>
                    ${days.map(d => `<div class="ti-grid-header">${d.slice(0, 3)}</div>`).join('')}
                    ${Array.from({ length: maxPeriod }, (_, i) => {
                        const p = i + 1;
                        const slot = SchedulingEngine.timeSlots[i];
                        return `<div class="ti-grid-period">${p}<span class="time">${slot ? slot.label : ''}</span></div>` +
                            days.map(day => {
                                const entry = tEntries.find(e => e.day === day && e.period === p);
                                if (entry) {
                                    return `<div class="ti-grid-cell ${entry.isLab ? 'lab-session' : ''}">
                                        <span class="subject-name">${entry.subjectName.length > 25 ? entry.subjectName.slice(0, 22) + '...' : entry.subjectName}</span>
                                        <span class="teacher-name">${entry.className}</span>
                                        <span class="room-name">${entry.room}</span>
                                    </div>`;
                                }
                                return '<div class="ti-grid-cell empty">—</div>';
                            }).join('');
                    }).join('')}
                </div>
            </div>`;
        });
        container.innerHTML = html;
    },

    _renderDepartmentView(entries, container) {
        const departments = [...new Set(entries.map(e => e.department))];
        let html = '';
        departments.forEach(dept => {
            const deptEntries = entries.filter(e => e.department === dept);
            const classIds = [...new Set(deptEntries.map(e => e.classId))];
            const teacherIds = [...new Set(deptEntries.map(e => e.teacherId))];
            html += `<div class="ti-card" style="margin-bottom: var(--space-lg);">
                <div class="ti-card-header">
                    <div class="ti-card-title">${dept} Department</div>
                    <div class="ti-card-subtitle">${classIds.length} classes · ${teacherIds.length} teachers · ${deptEntries.length} periods</div>
                </div>
                <div class="ti-table-wrap"><table class="ti-table"><thead><tr>
                    <th>Class</th><th>Subject</th><th>Teacher</th><th>Day</th><th>Period</th><th>Room</th>
                </tr></thead><tbody>
                    ${deptEntries.sort((a,b) => a.className.localeCompare(b.className) || a.day.localeCompare(b.day) || a.period - b.period).map(e => `
                        <tr>
                            <td>${e.className}</td>
                            <td>${e.subjectName}</td>
                            <td>${e.teacherName}</td>
                            <td>${e.day}</td>
                            <td>${e.period}</td>
                            <td>${e.room}</td>
                        </tr>
                    `).join('')}
                </tbody></table></div>
            </div>`;
        });
        container.innerHTML = html;
    },

    changePreviewView() {
        this._renderPreview();
    },

    printPreview() {
        window.print();
    },

    // ── Approval Section ──
    _renderApproval() {
        const status = TIData.getStatus();
        const statusOrder = ['draft', 'generated', 'review', 'approved', 'published'];
        const currentIndex = statusOrder.indexOf(status);
        const tt = TIData.getGeneratedTimetable();

        // Workflow pipeline
        const pipelineEl = document.getElementById('ti-approval-pipeline');
        if (pipelineEl) {
            const steps = [
                { label: 'Draft', icon: '1' },
                { label: 'Generated', icon: '2' },
                { label: 'Under Review', icon: '3' },
                { label: 'Approved', icon: '4' },
                { label: 'Published', icon: '5' },
            ];
            pipelineEl.innerHTML = steps.map((s, i) => {
                const stepClass = i < currentIndex ? 'completed' : i === currentIndex ? 'current' : '';
                const lineClass = i < currentIndex ? 'completed' : '';
                return (i > 0 ? `<div class="ti-workflow-line ${lineClass}"></div>` : '') +
                    `<div class="ti-workflow-step ${stepClass}">
                        <div class="ti-workflow-dot">${i < currentIndex ? '✓' : s.icon}</div>
                        <div class="ti-workflow-label">${s.label}</div>
                    </div>`;
            }).join('');
        }

        // Actions
        const actionsEl = document.getElementById('ti-approval-actions');
        if (actionsEl) {
            let btns = '';
            if (!tt) {
                btns = '<div class="ti-notice info">Generate a timetable first to begin the approval workflow.</div>';
            } else if (status === 'generated' || status === 'draft') {
                btns = `
                    <button class="ti-btn ti-btn-primary" onclick="TI_UI.setApprovalStatus('review')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Submit for Review
                    </button>
                    <button class="ti-btn ti-btn-danger" onclick="TI_UI.regenerate()">Regenerate</button>
                `;
            } else if (status === 'review') {
                btns = `
                    <button class="ti-btn ti-btn-success" onclick="TI_UI.setApprovalStatus('approved')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        Approve
                    </button>
                    <button class="ti-btn ti-btn-danger" onclick="TI_UI.setApprovalStatus('draft')">Reject</button>
                    <button class="ti-btn" onclick="TI_UI.regenerate()">Regenerate</button>
                `;
            } else if (status === 'approved') {
                btns = `
                    <button class="ti-btn ti-btn-success" onclick="TI_UI.publishTimetable()" style="font-size: 1rem; padding: 12px 32px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        Approve & Publish
                    </button>
                    <button class="ti-btn ti-btn-danger" onclick="TI_UI.setApprovalStatus('review')">Back to Review</button>
                `;
            } else if (status === 'published') {
                btns = `
                    <div class="ti-notice success">✓ This timetable has been published and is now active in the Timetable module, Student Portal, and Faculty Portal.</div>
                    <button class="ti-btn" onclick="TI_UI.regenerate()" style="margin-top: var(--space-md);">Generate New Timetable</button>
                `;
            }
            actionsEl.innerHTML = btns;
        }
    },

    setApprovalStatus(status) {
        TIData.setStatus(status);
        const versions = TIVersions.getAll();
        if (versions.length > 0) {
            TIVersions.updateStatus(versions[versions.length - 1].id, status);
        }
        this._renderApproval();
        if (window.Toast) window.Toast.info(`Status updated to: ${status}`);
    },

    async publishTimetable() {
        const tt = TIData.getGeneratedTimetable();
        if (!tt || !tt.entries) {
            if (window.Toast) window.Toast.error('No timetable to publish');
            return;
        }

        // Convert generated entries to the existing timetable format
        const existingDataStr = localStorage.getItem('timetable_system_demo_data');
        if (!existingDataStr) {
            if (window.Toast) window.Toast.error('Main database not found');
            return;
        }
        const existingData = JSON.parse(existingDataStr);

        // Convert entries: map TI IDs back to original IDs
        const newTimetable = tt.entries.map((entry, index) => ({
            id: 'pub_' + Date.now() + '_' + index,
            class_id: entry.classId.replace('tc_', ''),
            day: entry.day,
            period: String(entry.period),
            teacher: entry.teacherId.replace('tt_', ''),
            subject: entry.subjectId.replace('ts_', ''),
            room: entry.room
        }));

        // Update local main database
        existingData.timetable = newTimetable;
        localStorage.setItem('timetable_system_demo_data', JSON.stringify(existingData));

        // Save to backend database if API is active
        if (window.APIClient) {
            try {
                if (window.Toast) window.Toast.info('Publishing to server...');
                
                // Get all current timetable slots
                const currentSlots = await DemoAPI.getTimetable();
                
                // Delete existing slots
                if (currentSlots.length > 0) {
                    await Promise.all(currentSlots.map(slot => DemoAPI.deleteTimetableSlot(slot.id)));
                }

                // Add new slots sequentially to avoid locks
                for (const slot of newTimetable) {
                    await DemoAPI.saveTimetableSlot(slot);
                }

                if (window.Toast) window.Toast.success('Published to server successfully!');
            } catch (err) {
                console.error("Error publishing timetable to backend server:", err);
                if (window.Toast) window.Toast.error('Failed to publish to server: ' + err.message);
                return; // Stop execution on error
            }
        }

        // Update TI status
        TIData.setStatus('published');
        const versions = TIVersions.getAll();
        if (versions.length > 0) {
            TIVersions.updateStatus(versions[versions.length - 1].id, 'published');
        }

        this._renderApproval();
        this._renderVersions();

        if (window.Toast) window.Toast.success('Timetable published! It\'s now live.');
    },

    // ── Versions Section ──
    _renderVersions() {
        const container = document.getElementById('ti-versions-list');
        if (!container) return;
        const versions = TIVersions.getAll();

        if (versions.length === 0) {
            container.innerHTML = '<div class="ti-empty"><div class="ti-empty-text">No version history yet</div><div class="ti-empty-hint">Generate a timetable to create the first version</div></div>';
            return;
        }

        container.innerHTML = versions.slice().reverse().map(v => `
            <div class="ti-version-row">
                <div class="ti-version-badge">v${v.number}</div>
                <div class="ti-version-info">
                    <div class="ti-version-date">${new Date(v.generatedDate).toLocaleString()}</div>
                    <div class="ti-version-meta">By ${v.generatedBy}${v.publishedDate ? ' · Published ' + new Date(v.publishedDate).toLocaleDateString() : ''}</div>
                </div>
                <span class="ti-version-status ${v.status}">${v.status}</span>
                ${v.status !== 'published' ? `<button class="ti-btn ti-btn-sm" onclick="TI_UI.rollbackVersion('${v.id}')">Rollback</button>` : ''}
            </div>
        `).join('');
    },

    rollbackVersion(id) {
        const tt = TIVersions.rollback(id);
        if (tt) {
            TIData.setGeneratedTimetable(tt);
            TIData.setStatus('generated');
            this._renderVersions();
            this._renderPreview();
            this._renderApproval();
            if (window.Toast) window.Toast.success('Timetable rolled back successfully');
        }
    }
};


// ============================================
// ENTRY POINT — Called by dashboard.js
// ============================================
function loadTimetableIntelligence() {
    if (window.AIUI && typeof window.AIUI.init === 'function') {
        if (!window.AIUI.initialized) {
            window.AIUI.init();
            window.AIUI.initialized = true;
        }
    } else if (window.TI_UI && typeof window.TI_UI.init === 'function') {
        TI_UI.init();
    }
}
