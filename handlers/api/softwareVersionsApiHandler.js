const sanitizer = require('sanitize-html');
const apiutils = require('./apiUtils.js');
const versionsDao = require('../../dao/softwareVersions.js');
const {check, validationResult} = require('express-validator');

const SoftwareVersionsApiHandler = function () {
};

/**
 * Get all SoftwareVersions
 */
SoftwareVersionsApiHandler.getAllVersionsForTechnology = function (req, res) {
    const techId = sanitizer(req.params.technology);
    versionsDao.getAllForTechnology(techId, function (result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};

SoftwareVersionsApiHandler.addVersion = function (req, res) {
    const techId = sanitizer(req.body.technology);
    const name = sanitizer(req.body.name.trim());

    versionsDao.add(techId, name, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    })
};

SoftwareVersionsApiHandler.updateVersion = function (req, res) {
    const versionId = sanitizer(req.body.version);
    const name = sanitizer(req.body.name.trim());

    check('version', 'Invalid version ID').isInt();
    check('name', 'Empty name').notEmpty();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.end(JSON.stringify({success: false, error: errors}));
        return;
    }

    versionsDao.update(versionId, name, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    })
};

SoftwareVersionsApiHandler.deleteVersions = function (req, res) {
    const versions = req.body.versions;

    versionsDao.delete(versions, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    })
};

module.exports = SoftwareVersionsApiHandler;
