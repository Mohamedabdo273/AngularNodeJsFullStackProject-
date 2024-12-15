const httpStatusText = require('./httpStatusText');

function successResponse(res, statusCode, message, data) {
    const response = {
        status: statusCode,
        message: httpStatusText.getStatusText(statusCode) + ": " + message,
        category: httpStatusText.getStatusCategory(statusCode)
    };
    if (data !== undefined) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
}

module.exports = successResponse;