// utils/catchAsync.js
//
// A wrapper function that catches errors from async route handlers
// automatically, so we don't need to write try/catch in every single
// controller function. If the wrapped function throws or rejects,
// catchAsync passes the error to next(), which sends it to errorHandler.
//
// BEFORE (what we've been writing):
//   async function getPlans(req, res, next) {
//     try {
//       ...
//     } catch (error) {
//       next(error);
//     }
//   }
//
// AFTER (with catchAsync):
//   const getPlans = catchAsync(async (req, res) => {
//     ...
//   });

function catchAsync(fn) {
  return (req, res, next) => {
    // Promise.resolve() ensures this works whether fn is async or not.
    // .catch(next) automatically forwards any error to Express's
    // error-handling middleware, same as manually calling next(error).
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;