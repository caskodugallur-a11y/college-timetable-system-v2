// ============================================
// AI OPERATIONS CENTER — DATABASE RETRIEVAL LAYER
// ============================================

(function () {
  'use strict';

  class AIDatabaseRetrieval {
    async getTeachers() {
      try {
        if (window?.DemoAPI && typeof window.DemoAPI.getTeachers === 'function') {
          try {
            return await window.DemoAPI.getTeachers();
          } catch (inner) {}
        }
      } catch (e) {}

      try {
        const data = localStorage.getItem('timetable_system_demo_data');
        if (data) {
          return JSON.parse(data).teachers || [];
        }
      } catch (e) {}
      return [];
    }

    async getSubjects() {
      try {
        if (window?.DemoAPI && typeof window.DemoAPI.getSubjects === 'function') {
          try {
            return await window.DemoAPI.getSubjects();
          } catch (inner) {}
        }
      } catch (e) {}

      try {
        const data = localStorage.getItem('timetable_system_demo_data');
        if (data) {
          return JSON.parse(data).subjects || [];
        }
      } catch (e) {}
      return [];
    }

    async getClasses() {
      try {
        if (window?.DemoAPI && typeof window.DemoAPI.getClasses === 'function') {
          try {
            return await window.DemoAPI.getClasses();
          } catch (inner) {}
        }
      } catch (e) {}

      try {
        const data = localStorage.getItem('timetable_system_demo_data');
        if (data) {
          return JSON.parse(data).classes || [];
        }
      } catch (e) {}
      return [];
    }

    async getTimetable() {
      try {
        if (window?.DemoAPI && typeof window.DemoAPI.getTimetable === 'function') {
          try {
            return await window.DemoAPI.getTimetable();
          } catch (inner) {}
        }
      } catch (e) {}

      try {
        const data = localStorage.getItem('timetable_system_demo_data');
        if (data) {
          return JSON.parse(data).timetable || [];
        }
      } catch (e) {}
      return [];
    }

    async getAnnouncements() {
      try {
        if (window?.DemoAPI && typeof window.DemoAPI.getAnnouncements === 'function') {
          try {
            return await window.DemoAPI.getAnnouncements();
          } catch (inner) {}
        }
      } catch (e) {}

      try {
        const stored = localStorage.getItem('timetable_system_demo_data');
        if (stored) {
          const db = JSON.parse(stored);
          return db.announcements || [];
        }
      } catch {}
      return [];
    }

    async getContextString() {
      try {
        const [teachers, subjects, classes, timetable, announcements] = await Promise.all([
          this.getTeachers(),
          this.getSubjects(),
          this.getClasses(),
          this.getTimetable(),
          this.getAnnouncements()
        ]);

        const timeSlots = {
          '1': '9:00 AM - 10:00 AM',
          '2': '10:00 AM - 11:00 AM',
          '3': '11:15 AM - 12:15 PM',
          '4': '2:00 PM - 3:00 PM',
          '5': '3:00 PM - 4:00 PM'
        };

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[now.getDay()];

        let ctx = `CAS KODUNGALLUR ACADEMIC DATABASE CONTEXT:\n`;
        ctx += `Current Date: ${now.toDateString()} (Today: ${today})\n\n`;

        // 1. Teachers
        ctx += `TEACHERS:\n`;
        teachers.forEach(t => {
          ctx += `- ID: ${t.id} | Name: ${t.name} | Dept: ${t.department} | Status: ${t.status || 'Active'} | Email: ${t.email || '-'} | Phone: ${t.phone || '-'}\n`;
        });

        // 2. Subjects
        ctx += `\nSUBJECTS:\n`;
        subjects.forEach(s => {
          ctx += `- ID: ${s.id} | Name: ${s.name} | Code: ${s.code} | Dept: ${s.department} | Sem: ${s.semester} | Hours/Wk: ${s.hours_per_week || 4} | Teacher ID: ${s.teacher || 'None'}\n`;
        });

        // 3. Classes
        ctx += `\nCLASSES:\n`;
        classes.forEach(c => {
          ctx += `- ID: ${c.id} | Name: ${c.name} | Dept: ${c.department} | Sem: ${c.semester}\n`;
        });

        // 4. Timetable Slots
        ctx += `\nTIMETABLE ENTRIES:\n`;
        (timetable || []).forEach(slot => {
          const cls = (classes || []).find(c => c.id === slot.class_id) || null;
          const teacher = (teachers || []).find(t => t.id === slot.teacher) || null;
          const subject = (subjects || []).find(s => s.id === slot.subject) || null;

          ctx += `- Slot ID: ${slot.id} | Class: ${cls?.name || slot.class_id} | Day: ${slot.day} | Period: ${slot.period} (${timeSlots[slot.period] || 'TBD'}) | Teacher: ${teacher?.name || slot.teacher} | Subject: ${subject?.name || slot.subject} | Room: ${slot.room || 'TBD'}\n`;
        });

        // 5. Announcements
        ctx += `\nANNOUNCEMENTS:\n`;
        announcements.forEach(a => {
          ctx += `- ID: ${a.id} | Title: ${a.title} | Content: ${a.content} | Date: ${a.date}\n`;
        });

        // 6. Analytics/Metadata
        const stats = this.computeStatistics(teachers, subjects, classes, timetable);
        ctx += `\nANALYTICS & STATISTICS:\n`;
        ctx += `- Total Teachers: ${stats.totalTeachers} | Active: ${stats.activeTeachers}\n`;
        ctx += `- Total Subjects: ${stats.totalSubjects}\n`;
        ctx += `- Total Classes: ${stats.totalClasses}\n`;
        ctx += `- Busy Classrooms: ${stats.busyRooms.join(', ')}\n`;
        ctx += `- Teacher Workload hours/week:\n`;
        Object.entries(stats.workloads).forEach(([name, hr]) => {
          ctx += `  • ${name}: ${hr} classes/week\n`;
        });

        return ctx;
      } catch (err) {
        console.error("AI Context build failed:", err);
        return "CONTEXT ERROR: Could not retrieve database entities.";
      }
    }

    computeStatistics(teachers, subjects, classes, timetable) {
      const workloads = {};
      const busyRooms = [...new Set(timetable.map(t => t.room).filter(Boolean))];

      teachers.forEach(t => {
        workloads[t.name] = timetable.filter(slot => slot.teacher === t.id).length;
      });

      return {
        totalTeachers: teachers.length,
        activeTeachers: teachers.filter(t => t.status === 'active' || t.status === 'Active').length,
        totalSubjects: subjects.length,
        totalClasses: classes.length,
        busyRooms,
        workloads
      };
    }
  }

  // Expose to window
  window.AIDatabase = new AIDatabaseRetrieval();
})();
