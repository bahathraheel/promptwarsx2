/**
 * reCAPTCHA Enterprise verification middleware.
 * Graceful fallback: skips verification if service unavailable.
 */

async function verifyRecaptcha(req, res, next) {
  if (process.env.ENABLE_RECAPTCHA !== 'true') {
    return next();
  }

  const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'];

  if (!token) {
    return res.status(400).json({
      success: false,
      error: { code: 'RECAPTCHA_MISSING', message: 'reCAPTCHA token is required' }
    });
  }

  try {
    const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
    const client = new RecaptchaEnterpriseServiceClient();
    const projectId = process.env.RECAPTCHA_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

    const [response] = await client.createAssessment({
      parent: `projects/${projectId}`,
      assessment: {
        event: {
          token,
          siteKey: process.env.RECAPTCHA_SITE_KEY,
          expectedAction: 'SUBMIT'
        }
      }
    });

    if (!response.tokenProperties.valid) {
      return res.status(403).json({
        success: false,
        error: { code: 'RECAPTCHA_INVALID', message: 'reCAPTCHA verification failed' }
      });
    }

    if (response.riskAnalysis.score < 0.5) {
      return res.status(403).json({
        success: false,
        error: { code: 'RECAPTCHA_LOW_SCORE', message: 'Request blocked by bot protection' }
      });
    }

    req.recaptchaScore = response.riskAnalysis.score;
    next();
  } catch (error) {
    console.warn('[reCAPTCHA] Verification failed, allowing request:', error.message);
    next(); // Graceful fallback
  }
}

module.exports = { verifyRecaptcha };
