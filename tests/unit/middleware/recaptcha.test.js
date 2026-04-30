const { verifyRecaptcha } = require("../../../src/middleware/recaptcha");
const { RecaptchaEnterpriseServiceClient } = require("@google-cloud/recaptcha-enterprise");

jest.mock("@google-cloud/recaptcha-enterprise", () => {
  const mClient = {
    createAssessment: jest.fn()
  };
  return { RecaptchaEnterpriseServiceClient: jest.fn(() => mClient) };
});

describe("reCAPTCHA Middleware", () => {
  let req;
  let res;
  let next;
  let client;

  beforeEach(() => {
    req = {
      body: {},
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // reset env
    process.env.ENABLE_RECAPTCHA = "true";
    process.env.RECAPTCHA_PROJECT_ID = "test-project";
    process.env.RECAPTCHA_SITE_KEY = "test-site-key";
    
    const { RecaptchaEnterpriseServiceClient } = require("@google-cloud/recaptcha-enterprise");
    client = new RecaptchaEnterpriseServiceClient();
    client.createAssessment.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("skips verification if ENABLE_RECAPTCHA is not true", async () => {
    process.env.ENABLE_RECAPTCHA = "false";
    await verifyRecaptcha(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 if token is missing", async () => {
    await verifyRecaptcha(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: "RECAPTCHA_MISSING" })
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 if token is invalid", async () => {
    req.body.recaptchaToken = "bad-token";
    client.createAssessment.mockResolvedValue([{
      tokenProperties: { valid: false }
    }]);

    await verifyRecaptcha(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: "RECAPTCHA_INVALID" })
    }));
  });

  it("returns 403 if score is too low", async () => {
    req.body.recaptchaToken = "low-score-token";
    client.createAssessment.mockResolvedValue([{
      tokenProperties: { valid: true },
      riskAnalysis: { score: 0.2 } // below 0.5
    }]);

    await verifyRecaptcha(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: "RECAPTCHA_LOW_SCORE" })
    }));
  });

  it("calls next and sets score if token is valid and score is high", async () => {
    req.headers["x-recaptcha-token"] = "good-token";
    client.createAssessment.mockResolvedValue([{
      tokenProperties: { valid: true },
      riskAnalysis: { score: 0.9 }
    }]);

    await verifyRecaptcha(req, res, next);

    expect(req.recaptchaScore).toBe(0.9);
    expect(next).toHaveBeenCalled();
  });

  it("falls back gracefully and calls next if Google service throws an error", async () => {
    req.body.recaptchaToken = "token";
    client.createAssessment.mockRejectedValue(new Error("GCP Error"));

    // Suppress console.warn during this test
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await verifyRecaptcha(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[reCAPTCHA] Verification failed"),
      "GCP Error"
    );
    expect(next).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
