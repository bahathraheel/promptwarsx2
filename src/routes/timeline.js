/**
 * Election timeline routes for ELITE ELECTION.
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function loadTimeline() {
  const dataPath = path.join(__dirname, '..', '..', 'data', 'election-data.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw);
  return { timeline: data.timeline, resources: data.resources };
}

/** GET /api/timeline — Get election timeline */
router.get('/', (req, res) => {
  const { timeline, resources } = loadTimeline();

  // Enrich with computed status
  const now = new Date();
  const enriched = Object.entries(timeline).map(([key, dateStr]) => {
    const date = new Date(dateStr);
    const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return {
      event: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      key,
      date: dateStr,
      daysUntil,
      status: daysUntil < 0 ? 'past' : daysUntil === 0 ? 'today' : daysUntil <= 7 ? 'upcoming' : 'future',
      isPast: daysUntil < 0
    };
  });

  res.json({ success: true, data: { events: enriched, resources } });
});

module.exports = router;
