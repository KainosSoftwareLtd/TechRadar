'use strict';

const sanitizer = require('sanitize-html');
const apiutils = require('../../utils/apiUtils.js');
const versionsDao = require('../../dao/softwareVersions.js');
const {check, validationResult} = require('express-validator');

const SoftwareVersionsApiHandler = function () {
};

/**
 * Get all SoftwareVersions
 */
SoftwareVersionsApiHandler.getAllVersionsForTechnology = function (req, res) {
    const techId = sanitizer(req.params.technology);
    versionsDao.getAllForTechnology(techId)
        .then(result => apiutils.sendResultAsJson(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

SoftwareVersionsApiHandler.addVersion = function (req, res) {
    const techId = sanitizer(req.body.technology);
    const name = sanitizer(req.body.name.trim());

    versionsDao.add(techId, name)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

SoftwareVersionsApiHandler.updateVersion = function (req, res) {
    const versionId = sanitizer(req.body.version);
    const name = sanitizer(req.body.name.trim());

    check('version', 'Invalid version ID').isInt();
    check('name', 'Empty name').notEmpty();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        apiutils.handleResultSet(res, errors);
        return;
    }

    versionsDao.update(versionId, name)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

SoftwareVersionsApiHandler.deleteVersions = function (req, res) {
    const versions = req.body.versions;

    versionsDao.delete(versions)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

module.exports = SoftwareVersionsApiHandler;
