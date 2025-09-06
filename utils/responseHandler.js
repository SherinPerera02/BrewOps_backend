const responseHandler = {
  success: (res, message = "Success", data = null, statusCode = 200) => {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      if (Array.isArray(data)) {
        response.count = data.length;
      }
      response.data = data;
    }

    return res.status(statusCode).json(response);
  },

  error: (
    res,
    message = "Internal Server Error",
    statusCode = 500,
    error = null
  ) => {
    const response = {
      success: false,
      message,
    };

    if (error && process.env.NODE_ENV !== "production") {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  },

  validationError: (res, errors) => {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  },

  notFound: (res, message = "Resource not found") => {
    return res.status(404).json({
      success: false,
      message,
    });
  },

  unauthorized: (res, message = "Not authorized") => {
    return res.status(401).json({
      success: false,
      message,
    });
  },

  forbidden: (res, message = "Access forbidden") => {
    return res.status(403).json({
      success: false,
      message,
    });
  },
};

export default responseHandler;
