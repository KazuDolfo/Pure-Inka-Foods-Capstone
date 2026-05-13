/**
 * Manejador global de errores para la API.
 * Proporciona respuestas consistentes con códigos de estado HTTP adecuados.
 */
const errorHandler = (err, req, res, next) => {
    console.error('💥 Error detectado en el middleware:', err.message);
    
    // Si ya se envió una respuesta, no hacer nada más
    if (res.headersSent) {
      return next(err);
    }
  
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Error interno del servidor',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  };
  
  /**
   * Manejador para rutas no encontradas (404).
   */
  const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  module.exports = { errorHandler, notFound };
  