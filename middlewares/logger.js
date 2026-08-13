// middlewares/logger.js
//
// Logs every request AND how long it took to respond — useful for
// spotting slow endpoints as the app grows.

function logger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // "finish" fires once Express has sent the full response back.
  // We log AFTER the response, so we can include how long it took.
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

module.exports = logger;