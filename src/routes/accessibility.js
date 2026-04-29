/**
 * Accessibility routes for ELITE ELECTION.
 * Provides text-only mode content for screen readers and low-bandwidth.
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/** GET /api/accessibility/text-mode — Full text-only content */
router.get('/text-mode', (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'election-data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const textContent = {
      title: 'ELITE ELECTION — Your Complete Election Guide',
      description: 'An accessible, text-based guide to the election process.',
      zones: data.zones.map(zone => ({
        name: zone.name,
        icon: zone.icon,
        description: zone.description,
        keyFacts: zone.key_facts,
        frequentlyAsked: zone.faq
      })),
      timeline: data.timeline,
      resources: data.resources,
      accessibilityNote: 'This page is designed for screen readers and low-bandwidth connections. All interactive 3D features are available on the main page. For assistance, call 1-866-OUR-VOTE.'
    };

    res.json({ success: true, data: textContent });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to load content' } });
  }
});

/** GET /api/accessibility/high-contrast — High contrast config */
router.get('/high-contrast', (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: true,
      colors: {
        background: '#000000',
        text: '#FFFFFF',
        primary: '#FFD700',
        accent: '#00FF7F',
        danger: '#FF4444',
        border: '#FFFFFF'
      }
    }
  });
});

module.exports = router;
