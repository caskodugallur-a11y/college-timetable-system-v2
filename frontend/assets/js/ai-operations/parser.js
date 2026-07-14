// ============================================
// AI OPERATIONS CENTER — COMMAND PARSER
// ============================================

(function () {
  'use strict';

  class AICommandParser {
    parseResponse(rawResponse) {
      let cleaned = rawResponse.trim();

      // Stripping potential markdown JSON blocks: ```json ... ```
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      cleaned = cleaned.trim();

      try {
        const parsed = JSON.parse(cleaned);
        return {
          text: parsed.text || "No response text was generated.",
          command: parsed.command || null
        };
      } catch (err) {
        console.error("AI Parser: Response failed to parse as valid JSON. Raw string:", rawResponse);
        // Fallback if model returned plain string text instead of required JSON structure
        return {
          text: rawResponse,
          command: null
        };
      }
    }
  }

  // Expose to window
  window.AIParser = new AICommandParser();
})();
