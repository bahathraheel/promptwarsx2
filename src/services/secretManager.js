/**
 * Google Secret Manager service for ELITE ELECTION.
 * Securely retrieves API keys and secrets.
 */

const secretCache = new Map();

async function getSecret(secretName) {
  if (secretCache.has(secretName)) return secretCache.get(secretName);

  try {
    const {
      SecretManagerServiceClient,
    } = require("@google-cloud/secret-manager");
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    const [version] = await client.accessSecretVersion({ name });
    const value = version.payload.data.toString("utf8");
    secretCache.set(secretName, value);
    return value;
  } catch (error) {
    console.warn(
      `[SecretManager] Could not retrieve ${secretName}:`,
      error.message,
    );
    return process.env[secretName] || null;
  }
}

function clearCache() {
  secretCache.clear();
}

module.exports = { getSecret, clearCache };
