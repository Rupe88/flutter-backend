

module.exports = (err, req, res, next) => {
    // Set default status code to 500 if it is not set
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      
    });
};
