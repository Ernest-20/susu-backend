// middlewares/validator.js
//
// A reusable middleware FACTORY — a function that returns a middleware
// function, pre-configured for whichever Joi schema you pass in.
// This means one file can validate register, login, or any future route,
// instead of writing separate validation code for each.

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      // details[0].message gives a human-readable reason, e.g.
      // "\"password\" length must be at least 8 characters long"
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    next(); // validation passed — continue to the actual controller
  };
}

module.exports = validate;