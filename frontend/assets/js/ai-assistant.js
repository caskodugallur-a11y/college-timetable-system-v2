// ============================================
// CAS KODUNGALLUR — AI ACADEMIC ASSISTANT
// Free API Integration (Gemini / Groq)
// Retrieves ONLY real data from DemoAPI
// ============================================

(function () {
  'use strict';

  // ── Configuration ──
  const AI_STORAGE_KEY = 'cas_ai_config';
  const AI_HISTORY_KEY = 'cas_ai_history';

  // ── Gemini models to try in order (most generous free quota first) ──
  const GEMINI_MODELS = [
    'gemini-1.5-flash',        // 15 RPM, 1M TPM free tier
    'gemini-2.0-flash-lite',   // 30 RPM free tier
    'gemini-2.0-flash',        // 2 RPM free tier (most restrictive)
  ];

  const AI_PROVIDERS = {
    gemini: {
      name: 'Google Gemini',
      buildRequest: (messages, apiKey, model) => ({
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        body: {
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            topP: 0.8
          }
        }
      }),
      parseResponse: (data) => {
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error('No response from Gemini');
      }
    },
    groq: {
      name: 'Groq',
      buildRequest: (messages, apiKey) => ({
        url: 'https://api.groq.com/openai/v1/chat/completions',
        body: {
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.3,
          max_tokens: 1024
        },
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }),
      parseResponse: (data) => {
        if (data?.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        throw new Error('No response from Groq');
      }
    }
  };

  // ── System Prompt ──
  const SYSTEM_PROMPT = `You are the CAS Kodungallur Academic Assistant. You are an AI embedded in the College of Applied Science, Kodungallur timetable management system.

STRICT RULES:
1. You can ONLY answer questions about CAS Kodungallur: timetable, classes, schedules, teachers, faculty, subjects, departments, rooms, academic calendar.
2. You MUST ONLY use the data provided in the CONTEXT below. NEVER make up or invent information.
3. If the answer is NOT in the provided data, respond: "I couldn't find that information in the college database."
4. REFUSE any questions about: jokes, politics, religion, general knowledge, coding help, medical advice, essay writing, or anything unrelated to CAS Kodungallur academics.
5. For refused questions, respond: "I am the CAS Kodungallur Academic Assistant. I can only answer questions related to the college, timetable, teachers, departments, subjects, and official college information."
6. Be concise, professional, and helpful.
7. When showing schedules, format them clearly with day, time, subject, class, and room.
8. Today's day is important — use it to answer "today's timetable" questions.`;

  // ── State ──
  let isOpen = false;
  let isSettingsOpen = false;
  let isLoading = false;
  let chatHistory = [];

  // ── Get Config ──
  // Default config — Groq pre-configured for instant use
  const DEFAULT_CONFIG = {
    provider: 'groq',
 const DEFAULT_GROQ_KEY = "";
  

  function getConfig() {
    try {
      const stored = localStorage.getItem(AI_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If stored config has no key, use default
        return parsed.apiKey ? parsed : DEFAULT_CONFIG;
      }
      return DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  function saveConfig(config) {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
  }

  // ── Fetch College Data Context ──
  async function buildCollegeContext() {
    try {
      const [teachers, subjects, classes, timetable] = await Promise.all([
        DemoAPI.getTeachers(),
        DemoAPI.getSubjects(),
        DemoAPI.getClasses(),
        DemoAPI.getTimetable()
      ]);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[new Date().getDay()];
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let context = `COLLEGE DATA CONTEXT (Retrieved from database at ${currentTime}):\n`;
      context += `Today is: ${today}, ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`;

      // Teachers
      context += `TEACHERS (${teachers.length}):\n`;
      teachers.forEach(t => {
        context += `- ${t.name} (ID: ${t.id}, Department: ${t.department}, Status: ${t.status})\n`;
      });

      // Subjects
      context += `\nSUBJECTS (${subjects.length}):\n`;
      subjects.forEach(s => {
        const teacher = teachers.find(t => t.id === s.teacher);
        context += `- ${s.name} (Code: ${s.code}, Department: ${s.department}, Semester: ${s.semester}, Teacher: ${teacher?.name || 'Unassigned'}, Hours/week: ${s.hours_per_week})\n`;
      });

      // Classes
      context += `\nCLASSES (${classes.length}):\n`;
      classes.forEach(c => {
        context += `- ${c.name} (ID: ${c.id}, Department: ${c.department}, Semester: ${c.semester})\n`;
      });

      // Timetable — grouped by class
      context += `\nTIMETABLE SCHEDULE:\n`;
      const periodTimes = {
        '1': '9:00 AM - 10:00 AM',
        '2': '10:00 AM - 11:00 AM',
        '3': '11:15 AM - 12:15 PM',
        '4': '2:00 PM - 3:00 PM',
        '5': '3:00 PM - 4:00 PM'
      };

      classes.forEach(cls => {
        const classSlots = timetable.filter(t => t.class_id === cls.id);
        if (classSlots.length === 0) return;
        context += `\n${cls.name}:\n`;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(day => {
          const daySlots = classSlots.filter(s => s.day === day).sort((a, b) => parseInt(a.period) - parseInt(b.period));
          if (daySlots.length === 0) return;
          context += `  ${day}:\n`;
          daySlots.forEach(slot => {
            const subject = subjects.find(s => s.id === slot.subject);
            const teacher = teachers.find(t => t.id === slot.teacher);
            context += `    Period ${slot.period} (${periodTimes[slot.period] || 'Unknown'}): ${subject?.name || 'Unknown'} — ${teacher?.name || 'Unassigned'} — ${slot.room || 'TBD'}\n`;
          });
        });
      });

      return context;
    } catch (error) {
      console.error('AI: Error building context:', error);
      return 'CONTEXT: Error loading college data. Limited information available.';
    }
  }

  // ── Try a single Gemini model ──
  async function tryGeminiModel(model, messages, apiKey) {
    const provider = AI_PROVIDERS.gemini;
    const request = provider.buildRequest(messages, apiKey, model);

    const response = await fetch(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.body)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `HTTP ${response.status}`;
      // Check if it's a quota/rate-limit error — signal to try next model
      const isQuotaError = response.status === 429 ||
        errMsg.toLowerCase().includes('quota') ||
        errMsg.toLowerCase().includes('rate') ||
        errMsg.toLowerCase().includes('resource_exhausted') ||
        errMsg.toLowerCase().includes('limit');
      const err = new Error(errMsg);
      err.isQuotaError = isQuotaError;
      throw err;
    }

    const data = await response.json();
    return provider.parseResponse(data);
  }

  // ── Send Message to AI (with cascading model fallback) ──
  async function sendToAI(userMessage) {
    const config = getConfig();

    if (!config.apiKey) {
      return 'Please configure your API key first. Click the ⚙️ settings icon above to add your free Gemini or Groq API key.';
    }

    // Build context from live data
    const context = await buildCollegeContext();

    // Build messages array
    const messages = [
      { role: 'user', content: SYSTEM_PROMPT + '\n\n' + context + '\n\nUser Question: ' + userMessage }
    ];

    // Add recent chat history for context (last 4 exchanges)
    if (chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-8);
      const historyContext = recentHistory.map(m =>
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');
      messages[0].content += '\n\nRecent conversation:\n' + historyContext;
    }

    // ── Gemini: try models in cascade ──
    if (config.provider === 'gemini') {
      let lastError = null;
      for (const model of GEMINI_MODELS) {
        try {
          console.log(`AI: Trying model ${model}...`);
          const result = await tryGeminiModel(model, messages, config.apiKey);
          console.log(`AI: Success with ${model}`);
          return result;
        } catch (error) {
          lastError = error;
          if (error.isQuotaError) {
            console.warn(`AI: Quota exceeded on ${model}, trying next model...`);
            continue; // Try next model
          }
          // Non-quota error — don't try other models
          break;
        }
      }
      // All models failed
      console.error('AI: All Gemini models failed:', lastError);
      if (lastError?.isQuotaError) {
        return 'Your Gemini API quota is exhausted across all models. The free tier resets daily. Please wait and try again later, or switch to Groq in settings.';
      }
      if (lastError?.message?.includes('API key') || lastError?.message?.includes('API_KEY_INVALID')) {
        return 'Invalid API key. Please check your key in the settings.';
      }
      return `Sorry, I encountered an error: ${lastError?.message || 'Unknown error'}. Please try again.`;
    }

    // ── Groq provider ──
    const provider = AI_PROVIDERS[config.provider];
    if (!provider) {
      return 'Invalid AI provider configured. Please check settings.';
    }

    try {
      const request = provider.buildRequest(messages, config.apiKey);

      const response = await fetch(request.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers || {})
        },
        body: JSON.stringify(request.body)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `API Error (${response.status})`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      return provider.parseResponse(data);
    } catch (error) {
      console.error('AI: API Error:', error);
      if (error.message.includes('API key')) {
        return 'Invalid API key. Please check your key in the settings.';
      }
      return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
  }

  // ── DOM References ──
  let fabBtn, chatWindow, messagesContainer, inputField, sendBtn, settingsPanel;

  // ── Create UI ──
  function createAIWidget() {
    // Floating Action Button
    const fab = document.createElement('button');
    fab.className = 'ai-fab';
    fab.id = 'aiFab';
    fab.setAttribute('aria-label', 'Open AI Assistant');
    fab.innerHTML = `
      <span class="ai-fab-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </span>
      AI Assistant
      <span class="ai-fab-dot"></span>
    `;
    document.body.appendChild(fab);
    fabBtn = fab;

    // Chat Window
    const win = document.createElement('div');
    win.className = 'ai-window';
    win.id = 'aiWindow';
    win.innerHTML = `
      <div class="ai-header">
        <div class="ai-header-left">
          <div class="ai-header-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div class="ai-header-title">CAS Academic Assistant</div>
            <div class="ai-header-status">Powered by AI · College Data</div>
          </div>
        </div>
        <div class="ai-header-actions">
          <button class="ai-header-btn" id="aiSettingsBtn" aria-label="Settings" title="AI Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button class="ai-header-btn" id="aiCloseBtn" aria-label="Close chat" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="ai-messages" id="aiMessages">
        <div class="ai-msg ai-msg-bot">
          Hello! I'm the CAS Kodungallur Academic Assistant. 🎓<br><br>
          I can help you with:<br>
          • Timetable schedules<br>
          • Teacher information<br>
          • Subject details<br>
          • Class schedules<br><br>
          Ask me anything about the college!
        </div>
      </div>

      <div class="ai-settings" id="aiSettings">
        <div class="ai-settings-title">AI Configuration</div>
        <div class="ai-settings-field">
          <label class="ai-settings-label">Provider</label>
          <select class="ai-settings-select" id="aiProviderSelect">
            <option value="gemini">Google Gemini (Free)</option>
            <option value="groq">Groq (Free)</option>
          </select>
        </div>
        <div class="ai-settings-field">
          <label class="ai-settings-label">API Key</label>
          <input type="password" class="ai-settings-input" id="aiApiKeyInput" placeholder="Enter your API key" autocomplete="off">
        </div>
        <button class="ai-settings-save" id="aiSettingsSave">Save Configuration</button>
      </div>

      <div class="ai-input-area">
        <input type="text" class="ai-input" id="aiInput" placeholder="Ask about timetable, teachers, classes..." autocomplete="off">
        <button class="ai-send-btn" id="aiSendBtn" aria-label="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(win);
    chatWindow = win;

    // Cache references
    messagesContainer = document.getElementById('aiMessages');
    inputField = document.getElementById('aiInput');
    sendBtn = document.getElementById('aiSendBtn');
    settingsPanel = document.getElementById('aiSettings');

    // Load existing config into settings
    const config = getConfig();
    document.getElementById('aiProviderSelect').value = config.provider;
    document.getElementById('aiApiKeyInput').value = config.apiKey;

    // Bind events
    bindEvents();
  }

  // ── Event Binding ──
  function bindEvents() {
    // Toggle chat
    fabBtn.addEventListener('click', () => toggleChat());
    document.getElementById('aiCloseBtn').addEventListener('click', () => toggleChat(false));

    // Settings
    document.getElementById('aiSettingsBtn').addEventListener('click', () => {
      isSettingsOpen = !isSettingsOpen;
      settingsPanel.classList.toggle('open', isSettingsOpen);
    });

    document.getElementById('aiSettingsSave').addEventListener('click', () => {
      const provider = document.getElementById('aiProviderSelect').value;
      const apiKey = document.getElementById('aiApiKeyInput').value.trim();
      saveConfig({ provider, apiKey });
      isSettingsOpen = false;
      settingsPanel.classList.remove('open');
      addBotMessage('Settings saved! Using ' + AI_PROVIDERS[provider].name + '.');
    });

    // Send message
    sendBtn.addEventListener('click', () => handleSend());
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggleChat(false);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (isOpen && !chatWindow.contains(e.target) && !fabBtn.contains(e.target)) {
        toggleChat(false);
      }
    });
  }

  // ── Toggle Chat ──
  function toggleChat(forceState) {
    isOpen = forceState !== undefined ? forceState : !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    if (isOpen) {
      inputField.focus();
    }
  }

  // ── Add Messages ──
  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'ai-msg ai-msg-user';
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'ai-msg ai-msg-bot';
    msg.innerHTML = formatBotResponse(text);
    messagesContainer.appendChild(msg);
    scrollToBottom();
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'ai-typing';
    typing.id = 'aiTyping';
    typing.innerHTML = '<span class="ai-typing-dot"></span><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span>';
    messagesContainer.appendChild(typing);
    scrollToBottom();
  }

  function hideTyping() {
    const typing = document.getElementById('aiTyping');
    if (typing) typing.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // ── Format Response ──
  function formatBotResponse(text) {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '• ')
      .replace(/- /g, '– ');
  }

  // ── Handle Send ──
  async function handleSend() {
    const text = inputField.value.trim();
    if (!text || isLoading) return;

    isLoading = true;
    sendBtn.disabled = true;
    inputField.value = '';

    // Show user message
    addUserMessage(text);
    chatHistory.push({ role: 'user', content: text });

    // Show typing
    showTyping();

    try {
      const response = await sendToAI(text);
      hideTyping();
      addBotMessage(response);
      chatHistory.push({ role: 'assistant', content: response });

      // Keep history manageable
      if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(-16);
      }
    } catch (error) {
      hideTyping();
      addBotMessage('Sorry, something went wrong. Please try again.');
      console.error('AI Error:', error);
    }

    isLoading = false;
    sendBtn.disabled = false;
    inputField.focus();
  }

  // ── Initialize ──
  function init() {
    // Only initialize on student view page
    if (!document.body.classList.contains('student-page-modern')) return;
    createAIWidget();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
