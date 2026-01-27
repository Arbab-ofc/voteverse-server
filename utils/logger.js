const formatLog = (tag, level, args) => {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}]`, `[${tag}]`, `[${level}]`, ...args];
};

export const initLogger = ({ tag = "voteverse-server" } = {}) => {
  if (globalThis.__vvLoggerInit) return;
  globalThis.__vvLoggerInit = true;

  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug ? console.debug : console.log,
  };

  console.log = (...args) => original.log(...formatLog(tag, "INFO", args));
  console.info = (...args) => original.info(...formatLog(tag, "INFO", args));
  console.warn = (...args) => original.warn(...formatLog(tag, "WARN", args));
  console.error = (...args) => original.error(...formatLog(tag, "ERROR", args));
  console.debug = (...args) => original.debug(...formatLog(tag, "DEBUG", args));

  return {
    debug: (...args) => original.debug(...formatLog(tag, "DEBUG", args)),
    info: (...args) => original.info(...formatLog(tag, "INFO", args)),
    warn: (...args) => original.warn(...formatLog(tag, "WARN", args)),
    error: (...args) => original.error(...formatLog(tag, "ERROR", args)),
  };
};
