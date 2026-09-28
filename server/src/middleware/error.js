function notFound(req, res) {
  res.status(404).json({
    message: 'Route not found'
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  // Multer: uploaded file exceeds configured size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'Uploaded file is too large'
    });
  }

  // Multer/file validation errors
  if (err.message === 'Unsupported file type') {
    return res.status(422).json({
      message: 'Unsupported file type'
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      message: 'Invalid request data',
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid resource identifier'
    });
  }

  // Duplicate MongoDB unique-index value
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'This resource already exists'
    });
  }

  // If headers were already sent, let Express handle it.
  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
}

module.exports = {
  notFound,
  errorHandler
};