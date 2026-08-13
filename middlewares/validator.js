// middlewares/validator.js
//
// Updated to return ALL validation errors at once (not just the first one),
// which is more helpful for the frontend to show multiple field errors
// together, and matches how most real APIs behave.

function validate(schema) {
  return (req, res, next) => {
    // abortEarly: false tells Joi to collect EVERY validation error,
    // not stop at the first one it finds.
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // error.details is an array — map it into a clean, simple format
      // for the frontend to loop through and display next to each field.
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""), // strip Joi's quote marks for readability
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
}

module.exports = validate;