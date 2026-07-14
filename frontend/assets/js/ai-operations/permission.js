// ============================================
// AI OPERATIONS CENTER — PERMISSION MANAGER
// ============================================

(function () {
  'use strict';

  class AIPermissionManager {
    isAdmin() {
      try {
        const token = localStorage.getItem('adminToken');
        const username = localStorage.getItem('adminUsername');
        return !!token && !!username;
      } catch {
        return false;
      }
    }

    checkPermission(action) {
      if (!action) return true;
      
      const adminOnlyActions = [
        'create_teacher',
        'delete_teacher',
        'update_teacher_phone',
        'create_subject',
        'generate_timetable',
        'create_announcement'
      ];

      if (adminOnlyActions.includes(action)) {
        return this.isAdmin();
      }

      return true; // Read action
    }
  }

  // Expose to window
  window.AIPermission = new AIPermissionManager();
})();
