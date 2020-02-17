'use strict';

const apiUtils = require('../../utils/apiUtils');

const projects = require('../../dao/projects');
const votes = require('../../dao/vote');
const technologies = require('../../dao/technology');
const comments = require('../../dao/comments');
const sanitizer = require('sanitize-html');

const DashboardApiHandler = function () {
};

/**
 * Get all
 */
DashboardApiHandler.getTechnologyForProject = function (req, res) {
    const projectId = req.params.project;

    projects.getTechForProject(projectId)
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

DashboardApiHandler.getVotesForAllTechnologies = function (req, res) {
    votes.getVotesForAllTechnologies()
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

DashboardApiHandler.getVotesDifferentFromStatus = function (req, res) {
    votes.getVotesInLastMonthDifferentFromStatus()
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

DashboardApiHandler.getMostUsedTechnologies = function (req, res) {
    technologies.getMostUsedTechnologies()
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

DashboardApiHandler.getVotesPerUserCount = function (req, res) {
    votes.getVotesPerUserCount()
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

DashboardApiHandler.getCommentsPerTechnology = function (req, res) {
    comments.getTotalNumberCommentsForTechnologies()
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

DashboardApiHandler.getTechnologiesWithUsersCount = function (req, res) {
    const limit = sanitizer(req.query.limit);
    technologies.getTechnologiesWithUserCounts(limit)
        .then(result => apiUtils.sendResultAsJson(res, result))
        .catch(error => apiUtils.sendErrorResponse(res, error));
};

module.exports = DashboardApiHandler;