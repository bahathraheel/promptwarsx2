/**
 * ELITE ELECTION — Text-Only Mode Script
 * Fetches zone data and renders accessible text content.
 */

(function () {
  'use strict';

  async function loadTextContent() {
    const container = document.getElementById('text-zones-container');
    if (!container) return;

    try {
      const res = await fetch('/api/accessibility/text-mode');
      const data = await res.json();

      if (!data.success) throw new Error('Failed to load');

      container.innerHTML = '';

      data.data.zones.forEach(zone => {
        const section = document.createElement('section');
        section.className = 'text-zone';
        section.setAttribute('aria-label', zone.name);

        section.innerHTML = `
          <h2>${zone.icon} ${zone.name}</h2>
          <p>${zone.description}</p>
          <h3>Key Facts</h3>
          <ul>${zone.keyFacts.map(f => `<li>${f}</li>`).join('')}</ul>
          <h3>Frequently Asked Questions</h3>
          <ul>${zone.frequentlyAsked.map(q => `<li>${q}</li>`).join('')}</ul>
        `;

        container.appendChild(section);
      });

      // Timeline
      if (data.data.timeline) {
        const timeSection = document.createElement('section');
        timeSection.className = 'text-zone';
        timeSection.setAttribute('aria-label', 'Election Timeline');
        const entries = Object.entries(data.data.timeline)
          .map(([key, val]) => `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${val}</li>`)
          .join('');
        timeSection.innerHTML = `<h2>📅 Election Timeline</h2><ul>${entries}</ul>`;
        container.appendChild(timeSection);
      }
    } catch (error) {
      container.innerHTML = '<p style="color:var(--elite-danger);">Failed to load content. Please refresh or visit <a href="https://vote.gov">vote.gov</a> for election information.</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTextContent);
  } else {
    loadTextContent();
  }
})();
