'use strict';

const projects = require('../../dao/projects');
const technology = require('../../dao/technology');
const apiutils = require('../../utils/apiUtils.js');
const sanitizer = require('sanitize-html');
const projectValidator = require('../../shared/validators/projectValidator.js');
const {check, validationResult} = require('express-validator');

const ProjectsApiHandler = function () {
};


ProjectsApiHandler.getProjects = function (req, res) {

    projects.getAll()
        .then(result => apiutils.sendResultAsJson(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

ProjectsApiHandler.getProjectsForTag = function (req, res) {
    const tagId = sanitizer(req.params.tagId);

    projects.getAllForTag(tagId)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

ProjectsApiHandler.addProject = function (req, res) {

    const projectName = sanitizer(req.body.projectname.trim());
    const projectDescription = sanitizer(req.body.description);

    const validationResult = projectValidator.validateProjectName(projectName);
    if (!validationResult.valid) {
        apiutils.sendErrorResponse(res, validationResult.message);
        return;
    }

    projects.add(projectName, projectDescription)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};


ProjectsApiHandler.deleteProject = function (req, res) {
    const data = req.body.id;

    projects.delete(data)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));

};

ProjectsApiHandler.removeTechnologiesFromProject = function (req, res) {
    const linkIds = req.body.links;

    projects.removeTechnologiesFromProject(linkIds)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

ProjectsApiHandler.updateTechnologyVersion = function (req, res) {
    const versionId = sanitizer(req.body.version);
    const linkId = sanitizer(req.params.linkId);

    check('linkId', 'Invalid technology-project link ID').isInt();
    check('version', 'Invalid version ID').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        apiutils.sendErrorResponse(res, errors);
        return;
    }

    projects.updateTechnologyVersion(versionId, linkId)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

ProjectsApiHandler.getTechnologiesForProject = function (req, res) {
    const projectId = sanitizer(req.params.projectId);

    technology.getAllForProject(projectId)
        .then(result => apiutils.sendResultAsJson(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};


ProjectsApiHandler.addTechnologyToProject = function (req, res) {
    const projectId = sanitizer(req.params.projectId);
    const technologyIds = req.body.technologies;
    const versionIds = req.body.versions;

    projects.addTechnologies(projectId, technologyIds, versionIds)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};


ProjectsApiHandler.updateProject = function (req, res) {
    projects.update(
        req.body.projectId,
        sanitizer(req.body.projectname.trim()),
        sanitizer(req.body.description))
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

module.exports = ProjectsApiHandler;
