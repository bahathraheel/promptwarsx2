/**
 * ELITE ELECTION — Enhanced Assistant UI Controller
 * Chat panel with conversation memory, smart follow-ups, proactive tips,
 * markdown rendering, typing animation, and accessibility features.
 */

class AssistantUI {
  constructor() {
    this.panel = document.getElementById("chat-panel");
    this.toggle = document.getElementById("chat-toggle");
    this.closeBtn = document.getElementById("chat-close");
    this.messages = document.getElementById("chat-messages");
    this.form = document.getElementById("chat-form");
    this.input = document.getElementById("chat-input");
    this.sendBtn = document.getElementById("chat-send");
    this.quickQuestions = document.getElementById("quick-questions");
    this.toastContainer = document.getElementById("toast-container");

    this.isOpen = false;
    this.currentZone = "welcome";
    this.isLoading = false;
    this.conversationHistory = [];
    this.messageCount = 0;
    this.hasShownTip = {};

    this._bindEvents();
  }

  _bindEvents() {
    this.toggle.addEventListener("click", () => this.togglePanel());
    this.closeBtn.addEventListener("click", () => this.closePanel());
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessage();
    });
    this.input.addEventListener("input", () => {
      this.sendBtn.disabled = !this.input.value.trim();
    });

    // Keyboard shortcut: Escape to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.closePanel();
    });
  }

  togglePanel() {
    this.isOpen ? this.closePanel() : this.openPanel();
  }

  openPanel() {
    this.isOpen = true;
    this.panel.classList.add("open");
    this.panel.setAttribute("aria-hidden", "false");
    this.toggle.classList.add("hidden");
    this.toggle.setAttribute("aria-expanded", "true");
    this.input.focus();

    // Add welcome message if first open
    if (this.messages.children.length === 0) {
      this.addBotMessage(
        "👋 HEY I AM GNAN HOW CAN I ASSIST YOU\n\n" +
          "I am your highly capable Election Guide powered by Google and Gemini. " +
          "I can help you with:\n" +
          "• 📝 Voter registration\n" +
          "• 📅 Election timelines & deadlines\n" +
          "• 🗳️ Polling day procedures\n" +
          "• 📊 Understanding results\n" +
          "• ♿ Accessibility accommodations\n\n" +
          "Ask me anything or tap a suggestion below! 👇",
      );
      this._showDefaultFollowUps();
    }
  }

  closePanel() {
    this.isOpen = false;
    this.panel.classList.remove("open");
    this.panel.setAttribute("aria-hidden", "true");
    this.toggle.classList.remove("hidden");
    this.toggle.setAttribute("aria-expanded", "false");
    this.toggle.focus();
  }

  /** Set the current zone and update quick questions */
  setZone(zoneId, zoneData) {
    this.currentZone = zoneId;
    this._updateQuickQuestions(zoneData ? zoneData.faq : []);

    // Show proactive tip when entering a new zone (once)
    if (!this.hasShownTip[zoneId] && this.isOpen) {
      this.hasShownTip[zoneId] = true;
      this._showProactiveTip(zoneId);
    }
  }

  /** Fetch and show proactive tip from API */
  async _showProactiveTip(zoneId) {
    try {
      const res = await fetch(`/api/assistant/tip/${zoneId}`);
      const data = await res.json();
      if (data.success) {
        this.addBotMessage(data.data.tip, "Proactive tip");
      }
    } catch (e) {
      /* silent */
    }
  }

  _showDefaultFollowUps() {
    const defaults = [
      "How do I register to vote?",
      "When is Election Day?",
      "What ID do I need to vote?",
      "How does absentee voting work?",
    ];
    this._renderFollowUpChips(defaults);
  }

  _updateQuickQuestions(questions) {
    if (!this.quickQuestions) return;
    this.quickQuestions.innerHTML = "";
    const faqs = questions || [];
    faqs.slice(0, 4).forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "quick-q";
      btn.textContent = q;
      btn.setAttribute("aria-label", `Ask: ${q}`);
      btn.addEventListener("click", () => {
        this.input.value = q;
        this.sendMessage();
      });
      this.quickQuestions.appendChild(btn);
    });
  }

  /** Render follow-up chips inside the chat */
  _renderFollowUpChips(followUps) {
    if (!followUps || followUps.length === 0) return;

    const container = document.createElement("div");
    container.className = "follow-up-chips";
    container.setAttribute("aria-label", "Suggested follow-up questions");

    followUps.forEach((q) => {
      const chip = document.createElement("button");
      chip.className = "follow-up-chip";
      chip.textContent = q;
      chip.setAttribute("aria-label", `Ask: ${q}`);
      chip.addEventListener("click", () => {
        container.remove();
        this.input.value = q;
        this.sendMessage();
      });
      container.appendChild(chip);
    });

    this.messages.appendChild(container);
    this._scrollToBottom();
  }

  /** Simple markdown-to-HTML converter for bot messages */
  _renderMarkdown(text) {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Bullet points
    html = html.replace(/^[•\-]\s(.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
    // Line breaks
    html = html.replace(/\n\n/g, "<br><br>");
    html = html.replace(/\n/g, "<br>");

    return html;
  }

  async sendMessage() {
    const question = this.input.value.trim();
    if (!question || this.isLoading) return;

    // Remove any existing follow-up chips
    const existingChips = this.messages.querySelectorAll(".follow-up-chips");
    existingChips.forEach((c) => c.remove());

    this.addUserMessage(question);
    this.input.value = "";
    this.sendBtn.disabled = true;
    this.isLoading = true;
    this.messageCount++;

    // Add to conversation history
    this.conversationHistory.push({ role: "user", content: question });

    // Show typing indicator
    const typingId = this.addTypingIndicator();

    try {
      const response = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          zoneId: this.currentZone,
          conversationHistory: this.conversationHistory.slice(-6),
        }),
      });

      const data = await response.json();
      this.removeTypingIndicator(typingId);

      if (data.success) {
        const modelTag = data.data.model === "fallback" ? "Offline mode" : null;
        const confidenceTag =
          data.data.confidence === "low" ? " • General info" : "";
        this.addBotMessage(
          data.data.answer,
          modelTag ? modelTag + confidenceTag : null,
        );

        // Store bot response in history
        this.conversationHistory.push({
          role: "assistant",
          content: data.data.answer,
        });

        // Show follow-up suggestions
        if (data.data.followUps && data.data.followUps.length > 0) {
          this._renderFollowUpChips(data.data.followUps);
        }

        // Update quick questions from intent
        if (data.data.followUps) {
          this._updateQuickQuestions(data.data.followUps);
        }
      } else {
        this.addBotMessage(
          "I'm sorry, I couldn't process that. Please try rephrasing your question or call 1-866-OUR-VOTE for live assistance.",
        );
      }
    } catch (error) {
      this.removeTypingIndicator(typingId);
      this.addBotMessage(
        "I'm currently offline. Here's a tip: visit **vote.gov** for official election information, or call **1-866-OUR-VOTE** for immediate help.",
      );
    }

    this.isLoading = false;

    // Keep conversation history manageable
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-12);
    }
  }

  addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg-user";
    div.setAttribute("role", "listitem");
    div.textContent = text;
    this.messages.appendChild(div);
    this._scrollToBottom();
  }

  addBotMessage(text, meta = null) {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg-bot";
    div.setAttribute("role", "listitem");

    const content = document.createElement("div");
    content.className = "msg-content";
    content.innerHTML = this._renderMarkdown(text);
    div.appendChild(content);

    if (meta) {
      const metaEl = document.createElement("div");
      metaEl.className = "msg-meta";
      metaEl.textContent = meta;
      div.appendChild(metaEl);
    }

    // Action buttons row
    const actions = document.createElement("div");
    actions.className = "msg-actions";

    // TTS button
    const ttsBtn = document.createElement("button");
    ttsBtn.className = "btn btn-ghost btn-sm";
    ttsBtn.innerHTML = "🔊 Listen";
    ttsBtn.setAttribute("aria-label", "Read this message aloud");
    ttsBtn.addEventListener("click", () => this._speakText(text));
    actions.appendChild(ttsBtn);

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.className = "btn btn-ghost btn-sm";
    copyBtn.innerHTML = "📋 Copy";
    copyBtn.setAttribute("aria-label", "Copy this message");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = "✅ Copied!";
        setTimeout(() => {
          copyBtn.innerHTML = "📋 Copy";
        }, 2000);
      });
    });
    actions.appendChild(copyBtn);

    div.appendChild(actions);
    this.messages.appendChild(div);
    this._scrollToBottom();
  }

  addTypingIndicator() {
    const id = "typing-" + Date.now();
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg-bot typing-indicator";
    div.id = id;
    div.setAttribute("aria-label", "Assistant is typing");
    div.innerHTML = `
      <div class="typing-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <span class="sr-only">Thinking…</span>
    `;
    this.messages.appendChild(div);
    this._scrollToBottom();
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  _scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  /** Text-to-speech: try Cloud TTS, fallback to browser */
  async _speakText(text) {
    // Strip markdown
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/[•\-]/g, "");

    // Try browser SpeechSynthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }

  /** Clear conversation history */
  clearHistory() {
    this.conversationHistory = [];
    this.messageCount = 0;
    this.messages.innerHTML = "";
    this.addBotMessage(
      "🔄 Conversation cleared! Ask me anything about elections.",
    );
    this._showDefaultFollowUps();
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "toast-error" : type === "success" ? "toast-success" : ""}`;
    toast.textContent = message;
    toast.setAttribute("role", "alert");
    this.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

window.AssistantUI = AssistantUI;
