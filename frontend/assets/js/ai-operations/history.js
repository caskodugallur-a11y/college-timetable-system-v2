// ============================================
// AI OPERATIONS CENTER — CONVERSATION HISTORY
// ============================================

(function () {
  'use strict';

  class AIHistoryManager {
    constructor() {
      this.history = [];
    }

    add(userText, botTextOrObj) {
      this.history.push({
        user: userText,
        bot: botTextOrObj
      });
      // Limit to 20 history records to avoid blowing context limit
      if (this.history.length > 20) {
        this.history.shift();
      }
    }

    getAll() {
      return this.history;
    }

    clear() {
      this.history = [];
    }
  }

  // Expose to window
  window.AIHistory = new AIHistoryManager();
})();
