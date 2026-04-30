/**
 * Google Cloud Monitoring service for ELITE ELECTION.
 * Custom metrics and health monitoring.
 */

async function writeMetric(metricType, value, labels = {}) {
  try {
    const monitoring = require("@google-cloud/monitoring");
    const client = new monitoring.MetricServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;

    const dataPoint = {
      interval: { endTime: { seconds: Math.floor(Date.now() / 1000) } },
      value: { doubleValue: value },
    };

    const timeSeriesData = {
      metric: {
        type: `custom.googleapis.com/elite-election/${metricType}`,
        labels,
      },
      resource: { type: "global", labels: { project_id: projectId } },
      points: [dataPoint],
    };

    await client.createTimeSeries({
      name: `projects/${projectId}`,
      timeSeries: [timeSeriesData],
    });

    return { success: true };
  } catch (error) {
    console.warn("[Monitoring] Metric write failed:", error.message);
    return { success: false };
  }
}

module.exports = { writeMetric };
