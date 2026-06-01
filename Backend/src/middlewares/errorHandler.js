const errorHandler = (err, req, res, next) => {
    // Loguear el error para depuración en producción
    console.error('Error:', err.message);
    if (err.stack) console.error(err.stack);

    if (res.headersSent) {
      return next(err);
    }
  
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Error interno del servidor',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  module.exports = { errorHandler, notFound };
