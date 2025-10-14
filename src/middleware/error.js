function errorHandler(err, req, res, next) {
  console.error(err); // Always log the full error for debugging purposes

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error: " + err.message,
      errors: err.errors,
    });
  }

  // Handle Mongoose Duplicate Key Errors
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue);
    return res.status(409).json({
      message: `Conflict: An account with that ${field} already exists.`,
      field: field,
    });
  }

  // Generic fallback for other errors
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}

module.exports = { errorHandler };
