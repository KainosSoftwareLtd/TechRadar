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
    var name = sanitizer(req.body.name.trim());

    versionsDao.add(techId, name, function (result, error) {
        apiutils.handleResultWithFlash(req, res, result, error);
    })
};

SoftwareVersionsApiHandler.updateVersion = function (req, res) {
    var versionId = sanitizer(req.body.version);
    var name = sanitizer(req.body.name.trim());

    req.checkBody('version', 'Invalid version ID').isInt();
    req.checkBody('name', 'Empty name').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
        apiutils.handleResultWithFlash(req, res, null, errors, false, true);
        return;
    }

    versionsDao.update(versionId, name, function (result, error) {
        apiutils.handleResultWithFlash(req, res, result, error);
    })
};

SoftwareVersionsApiHandler.deleteVersions = function (req, res) {
    var versions = req.body.versions;

    versionsDao.delete(versions, function (result, error) {
        apiutils.handleResultWithFlash(req, res, result, error);
    })
};

module.exports = SoftwareVersionsApiHandler;
