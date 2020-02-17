
const logger = require('../winstonLogger')(module);

const ApiUtils = function () {
};

/**
 * Standard approach to returning results
 * @param res The response object
 * @param result The result returned from the
 */
ApiUtils.handleResultSet = function (res, result, error=null) {
    res.writeHead(200, {"Content-Type": "application/json"});

    const data = {};
    if (result) {
        data.result = result;
        data.success = true;
    } else {
        logger.error(error);

        data.error = error;
        data.success = false;
    }
    res.end(JSON.stringify(data));
};

/**
 * Standard approach to returning error results
 * @param res The response object
 */
ApiUtils.sendResultAsJson = function (res, result) {
    logger.debug(result);

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(result));
};

/**
 * Standard approach to returning error results
 * @param res The response object
 */
ApiUtils.sendErrorResponse = function (res, error) {
    logger.error(error);

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({success: false, error: error}));
};

module.exports = ApiUtils;