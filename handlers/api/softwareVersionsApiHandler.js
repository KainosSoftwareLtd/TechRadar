var sanitizer = require('sanitize-html');
var apiutils = require('./apiUtils.js');
var versionsDao = require('../../dao/softwareVersions.js');

var SoftwareVersionsApiHandler = function () {
};

/**
 * Get all SoftwareVersions
 */
SoftwareVersionsApiHandler.getAllVersionsForTechnology = function (req, res) {
    var techId = sanitizer(req.params.technology);
    versionsDao.getAllForTechnology(techId, function (result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};

SoftwareVersionsApiHandler.addVersion = function (req, res) {
    var techId = sanitizer(req.body.technology);
    var name = sanitizer(req.body.name);

    versionsDao.add(techId, name, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    })
};

module.exports = SoftwareVersionsApiHandler;