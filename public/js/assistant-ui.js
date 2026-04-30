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
    this.micBtn = document.getElementById("chat-mic");
    this.quickQuestions = document.getElementById("quick-questions");
    this.toastContainer = document.getElementById("toast-container");

    this.isOpen = false;
    this.currentZone = "welcome";
    this.isLoading = false;
    this.conversationHistory = [];
    this.messageCount = 0;
    this.hasShownTip = {};
    this._isTyping = false; // Tracks if currently animating text
    this._recognition = null;
    this._isRecording = false;
    this._initSpeechRecognition();

    // Gnan Voice — professional and welcoming Indian guide settings
    this.isMuted = false;
    this._selectedVoice = null;
    this._voiceReady = false;
    this._loadVoice();

    this._bindEvents();
  }

  /** Load and cache the best available Indian/English voices */
  _loadVoice() {
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Priority: natural Indian English voices
      const preferred = [
        "Google English India",
        "Microsoft Prabhat Online (Natural) - English (India)",
        "Microsoft Neerja Online (Natural) - English (India)",
        "Microsoft Ravi Online (Natural) - English (India)",
        "Microsoft Heera Online (Natural) - English (India)",
        "Google UK English Male",
        "Microsoft Guy Online (Natural) - English (United States)",
        "Daniel",
        "Alex",
      ];

      for (const name of preferred) {
        const v = voices.find((vx) => vx.name === name);
        if (v) { this._selectedVoice = v; this._voiceReady = true; return; }
      }

      // Fallback: any en-IN voice
      const enIn = voices.find((v) => v.lang.startsWith("en-IN"));
      if (enIn) { this._selectedVoice = enIn; this._voiceReady = true; return; }

      // Last resort: first en voice
      const en = voices.find((v) => v.lang.startsWith("en"));
      if (en) { this._selectedVoice = en; this._voiceReady = true; }
    };

    if (window.speechSynthesis.getVoices().length) {
      pick();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", pick, { once: true });
    }
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

    if (this.micBtn) {
      this.micBtn.addEventListener("click", () => this.toggleVoiceInput());
    }

    // Mute toggle button in chat header
    const muteBtn = document.getElementById("chat-mute");
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        this.isMuted = !this.isMuted;
        muteBtn.innerHTML = this.isMuted ? "🔇" : "🔊";
        muteBtn.setAttribute("aria-label", this.isMuted ? "Unmute Gnan" : "Mute Gnan");
        muteBtn.title = this.isMuted ? "Unmute Gnan" : "Mute Gnan";
        if (this.isMuted) window.speechSynthesis.cancel();
      });
    }

    // Keyboard shortcut: Escape to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.closePanel();
    });
  }

  /** Initialize Speech Recognition API */
  _initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (this.micBtn) this.micBtn.style.display = "none";
      return;
    }

    this._recognition = new SpeechRecognition();
    this._recognition.continuous = false;
    this._recognition.interimResults = false;
    this._recognition.lang = "en-IN";

    this._recognition.onstart = () => {
      this._isRecording = true;
      if (this.micBtn) this.micBtn.classList.add("recording");
      if (this.input) this.input.placeholder = "Listening…";
    };

    this._recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.input) {
        this.input.value = transcript;
        this.sendBtn.disabled = false;
        this.sendMessage();
      }
    };

    this._recognition.onerror = (event) => {
      this._stopRecording();
      if (event.error !== "no-speech") {
        this.showToast(`Voice error: ${event.error}`, "error");
      }
    };

    this._recognition.onend = () => {
      this._stopRecording();
    };
  }

  toggleVoiceInput() {
    if (this._isRecording) {
      this._recognition.stop();
    } else {
      try {
        this._recognition.start();
      } catch (e) {
        console.error("Speech recognition already started or failed", e);
      }
    }
  }

  _stopRecording() {
    this._isRecording = false;
    if (this.micBtn) this.micBtn.classList.remove("recording");
    if (this.input) this.input.placeholder = "Ask about elections…";
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
      const welcome =
        "Namaste! I am Gnan, your dedicated election guide for India. 👋\n\n" +
        "I am here to help you navigate every step of the democratic process with accuracy and ease.\n" +
        "I can provide official information on:\n" +
        "• 📝 Voter registration & Form 6\n" +
        "• 📅 Election phases & timelines\n" +
        "• 🗳️ Polling day procedures (EVM & VVPAT)\n" +
        "• 📊 Understanding election results\n" +
        "• ♿ Accessibility facilities for PwD voters\n\n" +
        "Are you a first-time voter, or have you participated in our democracy before?";
      this.addBotMessage(welcome, null, false, true /* humanTyping */);
      // Speak the welcome message automatically after typing animation
      setTimeout(() => this._speakText(welcome), 3500);
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
    this._renderFollowUpChips([
      "Am I eligible to vote in India?",
      "How do I register to vote?",
      "What documents do I need for a Voter ID?",
      "Can I register online via the NVSP portal?",
    ]);
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
          true  /* autoSpeak */,
          true  /* humanTyping — slow word-by-word like a real dude typing */
        );

        // Store bot response in history
        this.conversationHistory.push({
          role: "assistant",
          content: data.data.answer,
        });

        // Show follow-up suggestions after a delay (wait for typing to finish)
        const typingDelay = Math.min(data.data.answer.split(' ').length * 55, 4000);
        setTimeout(() => {
          if (data.data.followUps && data.data.followUps.length > 0) {
            this._renderFollowUpChips(data.data.followUps);
          }
          // Update quick questions from intent
          if (data.data.followUps) {
            this._updateQuickQuestions(data.data.followUps);
          }
        }, typingDelay);
      } else {
        this.addBotMessage(
          "I apologize, but I encountered an error. Please try rephrasing your question or call the ECI Voter Helpline at 1950 for immediate help.",
          null, false, true
        );
      }
    } catch (error) {
      this.removeTypingIndicator(typingId);
      this.addBotMessage(
        "I'm currently unable to connect to my main knowledge base. 😟 However, you can visit **voters.eci.gov.in** for official information, or call the voter helpline at **1950**.",
        null, false, true
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

  addBotMessage(text, meta = null, autoSpeak = false, humanTyping = false) {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg-bot";
    div.setAttribute("role", "listitem");

    const content = document.createElement("div");
    content.className = "msg-content";
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
    actions.style.display = "none"; // hidden until typing done

    // TTS toggle button
    const ttsBtn = document.createElement("button");
    ttsBtn.className = "btn btn-ghost btn-sm tts-btn";
    ttsBtn.innerHTML = "🔊 Listen";
    ttsBtn.setAttribute("aria-label", "Read this message aloud");
    ttsBtn.addEventListener("click", () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        ttsBtn.innerHTML = "🔊 Listen";
      } else {
        this._speakText(text);
        ttsBtn.innerHTML = "⏹️ Stop";
        window.speechSynthesis.addEventListener("end", () => {
          ttsBtn.innerHTML = "🔊 Listen";
        }, { once: true });
      }
    });
    actions.appendChild(ttsBtn);

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.className = "btn btn-ghost btn-sm";
    copyBtn.innerHTML = "📋 Copy";
    copyBtn.setAttribute("aria-label", "Copy this message");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = "✅ Copied!";
        setTimeout(() => { copyBtn.innerHTML = "📋 Copy"; }, 2000);
      });
    });
    actions.appendChild(copyBtn);

    // Feedback buttons (👍/👎)
    const feedback = document.createElement("div");
    feedback.className = "msg-feedback";
    feedback.style.display = "flex";
    feedback.style.gap = "4px";
    feedback.style.marginLeft = "auto";

    const upBtn = document.createElement("button");
    upBtn.className = "btn btn-ghost btn-sm feedback-btn";
    upBtn.innerHTML = "👍";
    upBtn.title = "Helpful";
    upBtn.addEventListener("click", () => {
      this.showToast("Thanks for the feedback!", "success");
      feedback.innerHTML = "<span style='font-size:0.7rem;opacity:0.7'>Feedback sent!</span>";
    });

    const downBtn = document.createElement("button");
    downBtn.className = "btn btn-ghost btn-sm feedback-btn";
    downBtn.innerHTML = "👎";
    downBtn.title = "Not helpful";
    downBtn.addEventListener("click", () => {
      this.showToast("Feedback received. I'll do better!", "info");
      feedback.innerHTML = "<span style='font-size:0.7rem;opacity:0.7'>Feedback sent!</span>";
    });

    feedback.appendChild(upBtn);
    feedback.appendChild(downBtn);
    actions.appendChild(feedback);

    div.appendChild(actions);

    this.messages.appendChild(div);
    this._scrollToBottom();

    if (humanTyping) {
      // Slow human-like word-by-word typing
      this._humanTypeText(content, text, () => {
        actions.style.display = "";
        if (autoSpeak) this._speakText(text);
      });
    } else {
      content.innerHTML = this._renderMarkdown(text);
      actions.style.display = "";
      if (autoSpeak) this._speakText(text);
    }
  }

  /**
   * Simulate human-like slow typing: reveals words one by one
   * with variable pauses for commas, punctuation, and line breaks.
   */
  _humanTypeText(container, text, onDone) {
    // Split into tokens: words + special breaks
    const tokens = text.split(/(\s+|\n)/g).filter(Boolean);
    let idx = 0;
    let displayed = "";

    const typeNext = () => {
      if (idx >= tokens.length) {
        // Finalize with full markdown rendering
        container.innerHTML = this._renderMarkdown(displayed);
        this._scrollToBottom();
        if (onDone) onDone();
        return;
      }

      const token = tokens[idx++];
      displayed += token;

      // Show partial render as plain text while typing
      container.textContent = displayed;
      this._scrollToBottom();

      // Variable delay based on token content (human feel)
      let delay = 38 + Math.random() * 30; // base: ~38-68ms per word
      if (token === "\n" || token === "\n\n") delay = 280;  // line break pause
      else if (/[.!?]$/.test(token.trim())) delay = 320;    // sentence end
      else if (/[,;:]$/.test(token.trim())) delay = 160;    // comma pause
      else if (/^(•|-)/.test(token.trim())) delay = 120;    // bullet item

      setTimeout(typeNext, delay);
    };

    typeNext();
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

  /** Text-to-speech: Gnan's energetic 16-year-old male voice */
  _speakText(text) {
    if (this.isMuted) return;
    if (!("speechSynthesis" in window)) return;

    // Strip markdown symbols so they aren't read aloud
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*\*/g, "$1")
      .replace(/[•\-]/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // remove emojis
      .trim();

    window.speechSynthesis.cancel(); // stop anything already playing

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 🎤 Gnan voice profile — professional and warm Indian guide
    if (this._selectedVoice) utterance.voice = this._selectedVoice;
    utterance.lang   = "en-IN";
    utterance.rate   = 0.95;  // steady, clear pace
    utterance.pitch  = 1.0;   // natural pitch
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
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
