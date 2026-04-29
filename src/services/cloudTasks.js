/**
 * Google Cloud Tasks service for ELITE ELECTION.
 * Queue background tasks for analytics and logging.
 */

async function createTask(queueName, payload, delaySeconds = 0) {
  try {
    const { CloudTasksClient } = require('@google-cloud/tasks');
    const client = new CloudTasksClient();
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.CLOUD_TASKS_LOCATION || 'us-central1';
    const parent = client.queuePath(project, location, queueName);

    const task = {
      httpRequest: {
        httpMethod: 'POST',
        url: `${process.env.SERVICE_URL || 'http://localhost:8080'}/api/internal/task`,
        headers: { 'Content-Type': 'application/json' },
        body: Buffer.from(JSON.stringify(payload)).toString('base64')
      }
    };

    if (delaySeconds > 0) {
      task.scheduleTime = {
        seconds: Math.floor(Date.now() / 1000) + delaySeconds
      };
    }

    const [response] = await client.createTask({ parent, task });
    return { name: response.name, success: true };
  } catch (error) {
    console.warn('[CloudTasks] Service unavailable, processing synchronously:', error.message);
    return { success: false, fallback: true };
  }
}

module.exports = { createTask };
