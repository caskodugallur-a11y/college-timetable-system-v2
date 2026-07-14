// ============================================
// AI OPERATIONS CENTER — ACTION EXECUTOR
// ============================================

(function () {
  'use strict';

  class AIActionExecutor {
    // Check if an action is destructive or creative and requires a confirmation dialog
    needsConfirmation(command) {
      if (!command) return false;
      const destructiveActions = ['delete_teacher', 'delete_subject', 'reset_timetable'];
      const creativeActions = ['create_teacher', 'create_subject', 'create_announcement', 'generate_timetable'];
      return destructiveActions.includes(command.action) || creativeActions.includes(command.action);
    }

    async execute(command) {
      if (!command || !command.action) return { success: false, message: 'No action specified' };

      // Validate permission first
      const hasPermission = window.AIPermission.checkPermission(command.action);
      if (!hasPermission) {
        return { success: false, message: 'Permission Denied. Only authenticated administrators can perform operations.' };
      }

      try {
        switch (command.action) {
          case 'create_teacher':
            return await this.createTeacher(command.params);
          case 'delete_teacher':
            return await this.deleteTeacher(command.params);
          case 'update_teacher_phone':
            return await this.updateTeacherPhone(command.params);
          case 'create_subject':
            return await this.createSubject(command.params);
          case 'generate_timetable':
            return await this.generateTimetable();
          case 'export_timetable':
            return await this.exportTimetable();
          case 'create_announcement':
            return await this.createAnnouncement(command.params);
          default:
            return { success: false, message: `Command '${command.action}' not recognized.` };
        }
      } catch (err) {
        console.error("AI Executor: Failed executing action:", err);
        return { success: false, message: `Action failed: ${err.message}` };
      }
    }

    async createTeacher(params) {
      if (!params || !params.name || (!params.department && !params.dept)) {
        return { success: false, message: 'Missing required parameters: name or department' };
      }

      const department = params.department || params.dept;
      const teacher = {
        name: params.name,
        department,
        status: params.status || 'Active',
        email: params.email || `${params.name.toLowerCase().replace(/\s+/g, '')}@college.edu`,
        phone: params.phone || '+1234567890'
      };

      // Reuse the existing DemoAPI layer for persistence
      const result = await (window.DemoAPI.addTeacher || window.DemoAPI.saveTeacher).call(window.DemoAPI, teacher);
      
      // Update the Intelligence cockpit data setup table
      if (window.TIData && window.TIData.syncWithMainDatabase) {
        await window.TIData.syncWithMainDatabase();
      }

      // If loadTeachers is defined globally (in dashboard.js), reload the main teacher table
      if (typeof window.loadTeachers === 'function') {
        window.loadTeachers();
      }

      return { success: true, message: `Teacher **${params.name}** has been successfully added to the **${params.department}** department.` };
    }

    async deleteTeacher(params) {
      if (!params || !params.id) {
        return { success: false, message: 'Missing teacher ID parameter' };
      }

      // Call existing DemoAPI delete function
      await window.DemoAPI.deleteTeacher(params.id);

      // Clean intelligence allocations
      if (window.TIData) {
        window.TIData.deleteTeacher(params.id);
        await window.TIData.syncWithMainDatabase();
      }

      if (typeof window.loadTeachers === 'function') {
        window.loadTeachers();
      }

      return { success: true, message: `Teacher **${params.name || 'with ID ' + params.id}** has been deleted from the database.` };
    }

    async updateTeacherPhone(params) {
      if (!params || !params.id || !params.phone) {
        return { success: false, message: 'Missing required parameters: id or phone' };
      }

      // Read current teacher list
      const teachers = await window.DemoAPI.getTeachers();
      const teacher = teachers.find(t => t.id === params.id);
      if (!teacher) {
        return { success: false, message: `Teacher with ID '${params.id}' not found.` };
      }

      teacher.phone = params.phone;
      await (window.DemoAPI.updateTeacher || window.DemoAPI.saveTeacher).call(window.DemoAPI, teacher.id, teacher);

      if (typeof window.loadTeachers === 'function') {
        window.loadTeachers();
      }

      return { success: true, message: `Phone number of **${teacher.name}** updated to **${params.phone}**.` };
    }

    async createSubject(params) {
      if (!params || !params.name || !params.code || (!params.department && !params.dept) || !params.semester) {
        return { success: false, message: 'Missing required parameters for subject creation.' };
      }

      const department = params.department || params.dept;
      const subject = {
        name: params.name,
        code: params.code,
        department,
        semester: String(params.semester),
        hours_per_week: parseInt(params.hours) || 4,
        teacher: ''
      };

      await (window.DemoAPI.addSubject || window.DemoAPI.saveSubject).call(window.DemoAPI, subject);

      if (window.TIData && window.TIData.syncWithMainDatabase) {
        await window.TIData.syncWithMainDatabase();
      }

      if (typeof window.loadSubjects === 'function') {
        window.loadSubjects();
      }

      return { success: true, message: `Subject **${params.name}** (${params.code}) created for Semester ${params.semester}.` };
    }

    async generateTimetable() {
      if (!window.TI_UI || typeof window.TI_UI.runGeneration !== 'function') {
        return { success: false, message: 'Timetable generation module is not loaded.' };
      }

      // Switch to the Generate tab
      window.TI_UI.switchTab('generate');
      
      // Execute the existing generation function
      await window.TI_UI.runGeneration();

      return { success: true, message: 'Timetable generation has been executed. Check the cockpit conflicts and previews tabs.' };
    }

    async exportTimetable() {
      // Trigger PDF preview print view
      if (window.TI_UI && typeof window.TI_UI.printPreview === 'function') {
        window.TI_UI.switchTab('preview');
        window.TI_UI.printPreview();
        return { success: true, message: 'Sent timetable print layout to browser printer dialog.' };
      }
      return { success: false, message: 'Preview print feature not found.' };
    }

    async createAnnouncement(params) {
      if (!params || !params.title || !params.content) {
        return { success: false, message: 'Missing title or content parameters.' };
      }

      const stored = localStorage.getItem('timetable_system_demo_data');
      if (stored) {
        const db = JSON.parse(stored);
        db.announcements = db.announcements || [];
        const item = {
          id: 'ann_' + Date.now(),
          title: params.title,
          content: params.content,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        db.announcements.push(item);
        localStorage.setItem('timetable_system_demo_data', JSON.stringify(db));

        if (typeof window.loadDashboard === 'function') {
          window.loadDashboard();
        }

        return { success: true, message: `Announcement **${params.title}** created successfully!` };
      }

      return { success: false, message: 'Database database not found.' };
    }
  }

  // Expose to window
  window.AIExecutor = new AIActionExecutor();
})();
