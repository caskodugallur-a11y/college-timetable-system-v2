// ============================================
// AI OPERATIONS CENTER — AI API PROVIDER LAYER
// ============================================

(function () {
  'use strict';

  const STORAGE_KEY = 'cas_admin_ai_config';
  const API_KEY = null;

  const PROVIDERS = {
    groq: {
      name: 'Groq Cloud',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      buildRequest: (messages, apiKey) => ({
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: {
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.2,
          max_tokens: 1500,
          response_format: { type: 'json_object' } // Enforce JSON response
        }
      }),
      parseResponse: (data) => {
        if (data?.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        throw new Error('No valid response from Groq');
      }
    },
    gemini: {
      name: 'Google Gemini',
      buildRequest: (messages, apiKey) => ({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
        headers: { 'Content-Type': 'application/json' },
        body: {
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json' // Enforce JSON response
          }
        }
      }),
      parseResponse: (data) => {
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error('No valid response from Gemini');
      }
    },
    openai: {
      name: 'OpenAI GPT',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      buildRequest: (messages, apiKey) => ({
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: {
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.2,
          max_tokens: 1500,
          response_format: { type: 'json_object' }
        }
      }),
      parseResponse: (data) => {
        if (data?.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        throw new Error('No valid response from OpenAI');
      }
    }
  };

  class AIProviderManager {
    getConfig() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.apiKey) return parsed;
        }
        return { provider: 'groq', apiKey: DEFAULT_GROQ_KEY };
      } catch {
        return { provider: 'groq', apiKey: DEFAULT_GROQ_KEY };
      }
    }

    saveConfig(provider, apiKey) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, apiKey }));
    }

    async getCompletion(messages) {
      const config = this.getConfig();
      const apiKey = config.apiKey || DEFAULT_GROQ_KEY;
      const provider = PROVIDERS[config.provider] || PROVIDERS.groq;

      const reqInfo = provider.buildRequest(messages, apiKey);

      try {
        const response = await fetch(reqInfo.url, {
          method: 'POST',
          headers: reqInfo.headers,
          body: JSON.stringify(reqInfo.body)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return provider.parseResponse(data);
      } catch (err) {
        console.warn(`AIProvider (${config.provider}) Error:`, err);
        return this.getFallbackResponse(messages);
      }
    }

    async getFallbackResponse(messages) {
      const userText = (messages || []).slice().reverse().find(m => m.role === 'user')?.content || '';
      const query = (userText || '').toLowerCase();

      try {
        if (/who is messi|joke|python|coding|politics|history|general|chat/i.test(query)) {
          return JSON.stringify({
            text: 'I am the CAS Kodungallur AI Operations Manager. I can only assist with academic scheduling, teacher allocations, classrooms, subjects, and admin operations.',
            command: null
          });
        }

        if (/create teacher|add teacher|new teacher/i.test(query)) {
          const match = userText.match(/teacher\s+([a-zA-Z\s]+?)(?:\s+in\s+([a-zA-Z]+))?/i);
          const name = match?.[1]?.trim() || 'New Teacher';
          const department = match?.[2]?.trim() || 'BCA';
          return JSON.stringify({
            text: `I can add **${name}** to the **${department}** department. Please confirm this operation.`,
            command: { action: 'create_teacher', params: { name, department, status: 'Active' } }
          });
        }

        if (/delete teacher|remove teacher/i.test(query)) {
          const name = userText.replace(/delete teacher|remove teacher/i, '').trim();
          const teachers = await window.DemoAPI.getTeachers();
          const teacher = teachers.find(t => t.name.toLowerCase().includes(name.toLowerCase())) || teachers[0];
          return JSON.stringify({
            text: teacher ? `I can remove **${teacher.name}** from the database. Please confirm this operation.` : 'I could not identify a teacher from that request. Please confirm the name.',
            command: teacher ? { action: 'delete_teacher', params: { id: teacher.id, name: teacher.name } } : null
          });
        }

        if (/generate timetable|build timetable|create timetable/i.test(query)) {
          return JSON.stringify({
            text: 'I have queued a timetable generation run for the cockpit. Please confirm this action.',
            command: { action: 'generate_timetable' }
          });
        }

        if (/teacher workload|workload|show workloads|show teacher workloads/i.test(query)) {
          const teachers = await window.DemoAPI.getTeachers();
          const timetable = await window.DemoAPI.getTimetable();
          const rows = teachers.map(t => ({ name: t.name, load: timetable.filter(slot => slot.teacher === t.id).length })).slice(0, 8);
          const table = ['| Teacher | Load |', '| --- | ---: |', ...rows.map(r => `| ${r.name} | ${r.load} |`)].join('\n');
          return JSON.stringify({
            text: `Here is the current workload summary:\n\n${table}`,
            command: null
          });
        }

        if (/conflict|conflicts/i.test(query)) {
          const timetable = await window.DemoAPI.getTimetable();
          const conflicts = timetable.filter(slot => slot.teacher && timetable.filter(s => s.teacher === slot.teacher && s.day === slot.day && s.period === slot.period).length > 1);
          return JSON.stringify({
            text: conflicts.length ? `I found ${conflicts.length} potential overlap entries in the current timetable.` : 'No obvious timetable conflicts were found in the current data.',
            command: null
          });
        }

        if (/teacher|teachers/i.test(query)) {
          const teachers = await window.DemoAPI.getTeachers();
          const rows = teachers.map(t => `| ${t.name} | ${t.department || '-'} | ${t.status || 'Active'} |`);
          const table = ['| Teacher | Department | Status |', '| --- | --- | --- |', ...rows].join('\n');
          return JSON.stringify({
            text: `Here are the available teachers:\n\n${table}`,
            command: null
          });
        }

        if (/classroom|classrooms|list classes|list classrooms|classes/i.test(query)) {
          const classes = await window.DemoAPI.getClasses();
          const rows = classes.map(c => `| ${c.name} | ${c.department || '-'} | Sem ${c.semester || '-'} |`);
          const table = ['| Class | Department | Semester |', '| --- | --- | ---: |', ...rows].join('\n');
          return JSON.stringify({
            text: `Here are the configured classes and classrooms (if assigned):\n\n${table}`,
            command: null
          });
        }

        const teachers = await window.DemoAPI.getTeachers();
        const classes = await window.DemoAPI.getClasses();
        const subjects = await window.DemoAPI.getSubjects();
        return JSON.stringify({
          text: `I reviewed the current academic data and found ${teachers.length} teachers, ${subjects.length} subjects, and ${classes.length} classes.`,
          command: null
        });
      } catch (error) {
        return JSON.stringify({
          text: 'I’m using the local timetable data right now and can still help with teacher, subject, and timetable operations.',
          command: null
        });
      }
    }
  }

  // Expose to window
  window.AIProvider = new AIProviderManager();
})();
