class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  if (req.path.startsWith('/api/')) {
    return res.status(statusCode).json({ error: message });
  }

  res.status(statusCode).render('error', {
    title: `Error ${statusCode}`,
    statusCode,
    message,
    layout: false
  });
}

function notFoundHandler(req, res) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(404).render('error', {
    title: 'Page Not Found',
    statusCode: 404,
    message: 'The page you are looking for does not exist.',
    layout: false
  });
}

module.exports = { AppError, NotFoundError, ValidationError, errorHandler, notFoundHandler };
