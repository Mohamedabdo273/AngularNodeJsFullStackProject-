const httpStatusText = {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    426: "Upgrade Required",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    511: "Network Authentication Required"
};

function getStatusText(statusCode) {
    return httpStatusText[statusCode] || "Unknown Status Code";
}

function getStatusCategory(statusCode) {
    const category = Math.floor(statusCode / 100);
    switch (category) {
        case 1:
            return "Informational";
        case 2:
            return "Success";
        case 3:
            return "Redirection";
        case 4:
            return "Client Error";
        case 5:
            return "Server Error";
        default:
            return "Unknown Category";
    }
}

module.exports = {
    getStatusText,
    getStatusCategory,
    httpStatusText
};