const { writeStructuredLog } = require("../../../src/services/logging");
const { Logging } = require("@google-cloud/logging");

jest.mock("@google-cloud/logging", () => {
  const mLog = {
    entry: jest.fn(),
    write: jest.fn()
  };
  const mLogging = {
    log: jest.fn(() => mLog)
  };
  return { Logging: jest.fn(() => mLogging) };
});

describe("Logging Service", () => {
  let log;

  beforeEach(() => {
    process.env.ENABLE_CLOUD_LOGGING = "true";
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    
    const { Logging } = require("@google-cloud/logging");
    const loggingClient = new Logging();
    log = loggingClient.log();
    log.entry.mockReset();
    log.write.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("falls back to console.log if ENABLE_CLOUD_LOGGING is not true", async () => {
    process.env.ENABLE_CLOUD_LOGGING = "false";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await writeStructuredLog("INFO", "Test message", { data: 123 });
    
    expect(consoleSpy).toHaveBeenCalledWith("[INFO] Test message", { data: 123 });
    expect(log.write).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("writes structured log to Cloud Logging", async () => {
    log.entry.mockReturnValue("mock-entry");
    log.write.mockResolvedValue();

    await writeStructuredLog("ERROR", "System failure", { code: 500 });
    
    expect(log.entry).toHaveBeenCalledWith(
      { resource: { type: "cloud_run_revision" }, severity: "ERROR" },
      expect.objectContaining({ message: "System failure", code: 500, timestamp: expect.any(String) })
    );
    expect(log.write).toHaveBeenCalledWith("mock-entry");
  });

  it("falls back to console.log if Cloud Logging throws an error", async () => {
    log.write.mockRejectedValue(new Error("API Error"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await writeStructuredLog("WARNING", "Slow query", { ms: 5000 });
    
    expect(consoleSpy).toHaveBeenCalledWith("[WARNING] Slow query", { ms: 5000 });

    consoleSpy.mockRestore();
  });
});
