'use strict';
const logger = require('../../winstonLogger')(module);

const technology = require('../../dao/technology');
const status = require('../../dao/status');
const votes = require('../../dao/vote');
const usedThisVotes = require('../../dao/usedThisTechnology');
const project = require('../../dao/projects');
const cache = require('../../dao/cache');

const apiUtils = require('../../utils/apiUtils');
const sanitizer = require('sanitize-html');
const technologyValidator = require('../../shared/validators/technologyValidator');


const TechnologyApiHandler = function () {
};

// @todo This uses a custom error response ?  change to standard response
TechnologyApiHandler.addVote = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const statusName = sanitizer(req.body.statusname);
    const userId = sanitizer(req.user.id);

    const status = cache.getStatus(statusName);
    const statusValue = status.id;

    votes.add(tech, statusValue, userId)
        .then(result => apiUtils.handleResultSet(res, result))
        .catch(error => apiUtils.handleResultSet(res, null, error));
};

TechnologyApiHandler.addUsedThisTechnologyVote = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const daysAgo = sanitizer(req.body.daysAgo);
    const userId = sanitizer(req.user.id);

    usedThisVotes.add(tech, daysAgo, userId)
        .then(result => apiUtils.handleResultSet(res, result))
        .catch(errors => apiUtils.handleResultSet(res, null, errors));
};

TechnologyApiHandler.getTechnologies = function (req, res) {
    const search = req.query.search;

    if (search == null) {
        technology.getAll(req.user.id)
            .then(result => apiUtils.sendResultAsJson(res, result))
            .catch(error => apiUtils.sendErrorResponse(res, error));
    } else {
        technology.search(sanitizer(search))
            .then(result => apiUtils.sendResultAsJson(res, result))
            .catch(error => apiUtils.sendErrorResponse(res, error));
    }
};


TechnologyApiHandler.addTechnology = function (req, res) {
    const technologyName = sanitizer(req.body.technologyName.trim());
    const technologyWebsite = sanitizer(req.body.technologyWebsite);
    const technologyLicenceLink = sanitizer(req.body.technologyLicenceLink);

    let validationResult = technologyValidator.validateTechnologyName(technologyName);
    validationResult = validationResult.valid ? technologyValidator.validateTechnologyWebsite(technologyWebsite) : validationResult;
    validationResult = validationResult.valid ? technologyValidator.validateTechnologyLicenceWebsite(technologyLicenceLink) : validationResult;

    if (!validationResult.valid) {
        apiUtils.sendErrorResponse(res, validationResult.message);
        return;
    }

    technology.add(technologyName,
        technologyWebsite,
        sanitizer(req.body.technologyCategory),
        sanitizer(req.body.technologyDescription),
        sanitizer(req.body.technologyLicence),
        technologyLicenceLink)
        .then(result => apiUtils.handleResultSet(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

TechnologyApiHandler.updateTechnology = function (req, res) {
    const techid = sanitizer(req.params.technology);
    const technologyName = sanitizer(req.body.name.trim());
    const technologyWebsite = sanitizer(req.body.website);
    const technologyLicenceLink = sanitizer(req.body.technologyLicenceLink);

    let validationResult = technologyValidator.validateTechnologyName(technologyName);
    validationResult = validationResult.valid ? technologyValidator.validateTechnologyWebsite(technologyWebsite) : validationResult;
    validationResult = validationResult.valid ? technologyValidator.validateTechnologyLicenceWebsite(technologyLicenceLink) : validationResult;

    if (!validationResult.valid) {
        apiUtils.sendErrorResponse(res, validationResult.message);
        return;
    }

    technology.update(
        techid,
        technologyName,
        technologyWebsite,
        sanitizer(req.body.category),
        sanitizer(req.body.description),
        sanitizer(req.body.technologyLicence),
        technologyLicenceLink)
        .then(result => apiUtils.handleResultSet(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

TechnologyApiHandler.deleteTechnology = function (req, res) {
    const data = req.body.id;

    technology.delete(data)
        .then(result => apiUtils.handleResultSet(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};


TechnologyApiHandler.getVotes = function (req, res) {
    const techid = sanitizer(req.params.technology);
    const limit = sanitizer(req.query.limit);

    votes.getVotesForTechnology(techid, limit)
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

TechnologyApiHandler.getStatusHistory = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const limit = sanitizer(req.query.limit);

    status.getHistoryForTechnology(tech, limit)
        .then(results => apiUtils.sendResultAsJson(res, results))
        .catch(errors => apiUtils.sendErrorResponse(res, errors));
};

TechnologyApiHandler.getVoteHistory = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const limit = sanitizer(req.query.limit);

    votes.getVotesForTechnology(tech, limit)
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

TechnologyApiHandler.getVoteTotals = function (req, res) {
    const tech = sanitizer(req.params.technology);
    votes.getTotalVotesForTechnologyStatus(tech)
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

TechnologyApiHandler.updateStatus = function (req, res) {
    const status = sanitizer(req.body.statusvalue);
    const reason = sanitizer(req.body.reason);
    const tech = sanitizer(req.params.technology);

    technology.updateStatus(tech, status, reason, req.user.id)
        .then(result => apiUtils.handleResultSet(res, result))
        .catch(error => apiUtils.handleResultSet(res, null, error));
};

TechnologyApiHandler.addProject = function (req, res) {
    const projectId = sanitizer(req.body.project);
    const technologyId = sanitizer(req.params.technology);
    const versionId = sanitizer(req.body.version);

    technology.addProject(technologyId, projectId, versionId)
        .then(result => apiUtils.handleResultSet(res, result))
        .catch(error => apiUtils.handleResultSet(res, null, error));
};

TechnologyApiHandler.getUsersCountInLastDays = function (req, res) {
    const technologyId = sanitizer(req.params.technology);
    let daysAgo;
    if (typeof req.query.daysAgo != "undefined") {
        daysAgo = sanitizer(req.query.daysAgo);
    }

    usedThisVotes.getUsersCountInLastDays(technologyId, daysAgo)
        .then(results => apiUtils.sendResultAsJson(res, results))
        .catch(errors => apiUtils.sendErrorResponse(res, errors));
};

TechnologyApiHandler.getUsers = function (req, res) {
    const technologyId = sanitizer(req.params.technology);
    let limit; // getUsersForTechnology can handle undefined limit
    if (typeof req.query.limit != "undefined") {
        limit = sanitizer(req.query.limit);
    }

    usedThisVotes.getUsersForTechnology(technologyId, limit)
        .then(results => apiUtils.sendResultAsJson(res, results))
        .catch(errors => apiUtils.sendErrorResponse(res, errors));
};

TechnologyApiHandler.getProjects = function (req, res) {
    const technologyId = sanitizer(req.params.technology);

    project.getAllForTechnology(technologyId)
        .then(results => apiUtils.sendResultAsJson(res, results))
        .catch(errors => apiUtils.sendErrorResponse(res, errors));
};

TechnologyApiHandler.removeProject = function (req, res) {
    const technologyId = sanitizer(req.params.technology);
    const projectIds = req.body.projects;

    technology.removeProjects(technologyId, projectIds)
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

module.exports = TechnologyApiHandler;
