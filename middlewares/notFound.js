// middlewares/notFound.js
//
// Catches any request to a URL that doesn't match ANY route we've defined
// (e.g. a typo like /api/plnas instead of /api/plans). Without this,
// Express would just hang or return a generic, unhelpful HTML error page.

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;