// ============================================
// AI OPERATIONS CENTER — UI ENGINE
// ============================================

(function () {
  'use strict';

  class AIUIManager {
    constructor() {
      this.messagesContainer = null;
      this.inputField = null;
      this.sendBtn = null;
      this.configPanel = null;
      this.pendingCommand = null;
      this.isLoading = false;
    }

    init() {
      // Re-structure the Intelligence module page into two columns
      this.restructureHTML();

      if (window.TI_UI && typeof window.TI_UI.init === 'function' && !window.TI_UI.initialized) {
        window.TI_UI.init();
        window.TI_UI.initialized = true;
      }

      // Cache elements
      this.messagesContainer = document.getElementById('tiAiMessages');
      this.inputField = document.getElementById('tiAiInput');
      this.sendBtn = document.getElementById('tiAiSendBtn');
      this.configPanel = document.getElementById('tiAiConfigOverlay');

      // Bind events
      this.bindEvents();

      // Welcome message
      this.addBotMessage("Greetings, Administrator. I am the **CAS Kodungallur AI Operations Manager**. 🎓\n\nI can help you audit teacher workloads, resolve timetable conflicts, or run operations. Let me know what you need.");
    }

    restructureHTML() {
      const module = document.getElementById('timetable-intelligence-module');
      if (!module) return;

      // Extract existing section elements
      const sections = Array.from(module.children).filter(child => 
        child.classList.contains('ti-section') || child.classList.contains('ti-tabs')
      );

      // Create split panels
      module.innerHTML = `
        <!-- Left Panel: Chat Interface -->
        <div class="ti-ai-chat-panel">
          <div class="ti-ai-header">
            <div class="ti-ai-header-title">
              <span class="ti-ai-header-status"></span>
              AI Operations Manager
            </div>
            <button class="ti-config-btn" id="tiAiConfigBtn" title="AI Configuration">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            
            <div class="ti-config-overlay" id="tiAiConfigOverlay">
              <div class="ti-config-title">AI Engine Settings</div>
              <div class="ti-config-field">
                <label class="ti-config-label">Provider</label>
                <select class="ti-config-select" id="tiAiProviderSelect">
                  <option value="groq">Groq Cloud (Free)</option>
                  <option value="gemini">Google Gemini (Free)</option>
                  <option value="openai">OpenAI GPT</option>
                </select>
              </div>
              <div class="ti-config-field">
                <label class="ti-config-label">API Key</label>
                <input type="password" class="ti-config-input" id="tiAiApiKeyInput" placeholder="API Key" autocomplete="off">
              </div>
              <button class="ti-config-save" id="tiAiConfigSaveBtn">Save Config</button>
            </div>
          </div>

          <!-- Messages -->
          <div class="ti-ai-messages" id="tiAiMessages"></div>

          <!-- Suggestion Chips -->
          <div class="ti-ai-suggestions">
            <div class="ti-ai-chip" onclick="window.AIUI.sendSuggestion('Show teacher workloads')">Teacher workloads</div>
            <div class="ti-ai-chip" onclick="window.AIUI.sendSuggestion('Find conflicts')">Find conflicts</div>
            <div class="ti-ai-chip" onclick="window.AIUI.sendSuggestion('List classrooms')">List classrooms</div>
            <div class="ti-ai-chip" onclick="window.AIUI.sendSuggestion('Generate timetable')">Generate timetable</div>
          </div>

          <!-- Input bar -->
          <div class="ti-ai-input-wrapper">
            <input type="text" class="ti-ai-input" id="tiAiInput" placeholder="Type a management command..." autocomplete="off">
            <button class="ti-ai-send-btn" id="tiAiSendBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Right Panel: Operations Cockpit -->
        <div class="ti-cockpit-panel">
          <div class="ti-cockpit-content" id="tiCockpitContent"></div>
        </div>
      `;

      // Relocate tabs & sections to Cockpit panel
      const cockpit = document.getElementById('tiCockpitContent');
      sections.forEach(sec => cockpit.appendChild(sec));
    }

    bindEvents() {
      // Config overlay trigger
      document.getElementById('tiAiConfigBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.configPanel.classList.toggle('open');
      });

      // Close settings overlay on outer click
      document.addEventListener('click', (e) => {
        if (this.configPanel.classList.contains('open') && !this.configPanel.contains(e.target)) {
          this.configPanel.classList.remove('open');
        }
      });

      // Config save
      document.getElementById('tiAiConfigSaveBtn').addEventListener('click', () => {
        const provider = document.getElementById('tiAiProviderSelect').value;
        const apiKey = document.getElementById('tiAiApiKeyInput').value.trim();
        window.AIProvider.saveConfig(provider, apiKey);
        this.configPanel.classList.remove('open');
        this.addBotMessage(`Settings updated! Engine switched to **${provider.toUpperCase()}**.`);
      });

      // Send text input
      this.sendBtn.addEventListener('click', () => this.handleSend());
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSend();
        }
      });

      // Populate config fields
      const config = window.AIProvider.getConfig();
      document.getElementById('tiAiProviderSelect').value = config.provider;
      document.getElementById('tiAiApiKeyInput').value = config.apiKey;
    }

    sendSuggestion(text) {
      if (this.isLoading) return;
      this.inputField.value = text;
      this.handleSend();
    }

    addUserMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'ti-ai-msg ti-ai-msg-user';
      msg.textContent = text;
      this.messagesContainer.appendChild(msg);
      this.scrollToBottom();
    }

    addBotMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'ti-ai-msg ti-ai-msg-bot';
      msg.innerHTML = this.parseMarkdown(text);
      this.messagesContainer.appendChild(msg);
      this.scrollToBottom();
    }

    showTyping() {
      const typing = document.createElement('div');
      typing.className = 'ti-ai-typing';
      typing.id = 'tiAiTyping';
      typing.innerHTML = '<span class="ti-ai-typing-dot"></span><span class="ti-ai-typing-dot"></span><span class="ti-ai-typing-dot"></span>';
      this.messagesContainer.appendChild(typing);
      this.scrollToBottom();
    }

    hideTyping() {
      const typing = document.getElementById('tiAiTyping');
      if (typing) typing.remove();
    }

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    parseMarkdown(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code Blocks
        .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Linebreaks
        .replace(/\n/g, '<br>')
        // Tables
        .replace(/\|(.+)\|/g, (match) => {
          const cells = match.split('|').map(c => c.trim()).filter(Boolean);
          if (cells.every(c => c.startsWith('---') || c.startsWith(':---'))) return '';
          return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
        })
        .replace(/(<tr>.+<\/tr>)+/g, '<table><tbody>$&</tbody></table>');
    }

    async handleSend() {
      const text = this.inputField.value.trim();
      if (!text || this.isLoading) return;

      this.isLoading = true;
      this.sendBtn.disabled = true;
      this.inputField.value = '';

      // Add user query
      this.addUserMessage(text);

      // Show typing
      this.showTyping();

      try {
        // Compile messages payload
        const messages = await window.AIPrompt.buildMessages(text, window.AIHistory.getAll());

        // Hit LLM
        const rawResponse = await window.AIProvider.getCompletion(messages);
        
        this.hideTyping();

        // Parse structured command JSON
        const responseData = window.AIParser.parseResponse(rawResponse);

        // Render response
        this.addBotMessage(responseData.text);

        // Check if there is an executive action
        if (responseData.command) {
          if (window.AIExecutor.needsConfirmation(responseData.command)) {
            this.showConfirmation(responseData.command);
          } else {
            const execResult = await window.AIExecutor.execute(responseData.command);
            this.addBotMessage(execResult.message);
          }
        }

        // Add exchange to session history
        window.AIHistory.add(text, rawResponse);

      } catch (err) {
        this.hideTyping();
        this.addBotMessage(`⚠️ Operations Manager Error: ${err.message || 'Call failed'}.`);
        console.error("AI Operations Send Failed:", err);
      }

      this.isLoading = false;
      this.sendBtn.disabled = false;
      this.inputField.focus();
    }

    showConfirmation(command) {
      const id = 'confirm_' + Date.now();
      const card = document.createElement('div');
      card.className = `ti-confirm-card ${command.action.startsWith('create') ? 'create' : ''}`;
      card.id = id;

      let title = 'Confirm Operation';
      let desc = 'Are you sure you want to proceed with this operation?';

      if (command.action === 'create_teacher') {
        title = 'Confirm: Add Faculty';
        desc = `Create teacher **${command.params.name}** in the **${command.params.department}** department.`;
      } else if (command.action === 'delete_teacher') {
        title = 'Confirm: Delete Faculty ⚠️';
        desc = `Delete teacher **${command.params.name}** from the database. This action is destructive and cannot be undone.`;
      } else if (command.action === 'create_subject') {
        title = 'Confirm: Add Subject';
        desc = `Create subject **${command.params.name}** (${command.params.code}) for Semester ${command.params.semester}.`;
      } else if (command.action === 'generate_timetable') {
        title = 'Confirm: Rebuild Timetable ⚡';
        desc = 'Re-generate the entire college timetable. This will overwrite the current active draft schedule.';
      } else if (command.action === 'create_announcement') {
        title = 'Confirm: Publish Announcement';
        desc = `Publish announcement: **${command.params.title}**.`;
      }

      card.innerHTML = `
        <div class="ti-confirm-title">${title}</div>
        <div class="ti-confirm-desc">${desc}</div>
        <div class="ti-confirm-actions">
          <button class="ti-confirm-btn yes ${command.action.startsWith('create') ? 'create' : ''}" id="${id}_yes">Confirm</button>
          <button class="ti-confirm-btn no" id="${id}_no">Cancel</button>
        </div>
      `;

      this.messagesContainer.appendChild(card);
      this.scrollToBottom();

      // Action binding
      document.getElementById(`${id}_yes`).addEventListener('click', async () => {
        card.remove();
        this.showTyping();
        const execResult = await window.AIExecutor.execute(command);
        this.hideTyping();
        this.addBotMessage(execResult.message);
      });

      document.getElementById(`${id}_no`).addEventListener('click', () => {
        card.remove();
        this.addBotMessage('Operation cancelled by user.');
      });
    }
  }

  // Expose to window
  window.AIUI = new AIUIManager();

  // Dynamic wrapper hook to initialize when the tab is switched
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const origSwitchModule = window.switchModule;
      if (typeof origSwitchModule === 'function') {
        window.switchModule = function (moduleName) {
          origSwitchModule(moduleName);
          if (moduleName === 'timetable-intelligence' && window.AIUI) {
            if (!window.AIUI.initialized) {
              window.AIUI.init();
              window.AIUI.initialized = true;
            }
          }
        };
      }
    }, 100);
  });
})();
