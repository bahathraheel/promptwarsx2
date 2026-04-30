/**
 * Cloud Logging structured logger for ELITE ELECTION.
 */

async function writeStructuredLog(severity, message, payload = {}) {
  if (process.env.ENABLE_CLOUD_LOGGING !== "true") {
    console.log(`[${severity}] ${message}`, payload);
    return;
  }

  try {
    const { Logging } = require("@google-cloud/logging");
    const logging = new Logging({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    const log = logging.log("elite-election");

    const metadata = {
      resource: { type: "cloud_run_revision" },
      severity,
    };

    const entry = log.entry(metadata, {
      message,
      ...payload,
      timestamp: new Date().toISOString(),
    });
    await log.write(entry);
  } catch (error) {
    console.log(`[${severity}] ${message}`, payload);
  }
}

module.exports = { writeStructuredLog };
