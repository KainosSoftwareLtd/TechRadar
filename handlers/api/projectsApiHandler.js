const projects = require('../../dao/projects');
const technology = require('../../dao/technology');
const apiutils = require('./apiUtils.js');
const sanitizer = require('sanitize-html');
const projectValidator = require('../../shared/validators/projectValidator.js');
const {check, validationResult} = require('express-validator');

const ProjectsApiHandler = function () {
};


ProjectsApiHandler.getProjects = function (req, res) {

    projects.getAll(function (result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};

ProjectsApiHandler.getProjectsForTag = function (req, res) {
    const tagId = sanitizer(req.params.tagId);

    projects.getAllForTag(tagId, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

ProjectsApiHandler.addProject = function (req, res) {

    const projectName = sanitizer(req.body.projectname.trim());
    const projectDescription = sanitizer(req.body.description);

    const validationResult = projectValidator.validateProjectName(projectName);
    if (!validationResult.valid) {
        res.writeHead(200, {"Content-Type": "application/json"});
        const data = {};
        data.error = validationResult.message;
        data.success = false;
        res.end(JSON.stringify(data));
        return;
    }

    projects.add(
        projectName,
        projectDescription,

        function (result, error) {
            apiutils.handleResultSet(res, result, error);
        });

};


ProjectsApiHandler.deleteProject = function (req, res) {
    const data = req.body.id;

    projects.delete(data, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    })
};

ProjectsApiHandler.deleteTechnologiesFromProject = function (req, res) {
    const linkIds = req.body.links;

    projects.deleteTechnologies(linkIds, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

ProjectsApiHandler.updateTechnologyVersion = function (req, res) {
    const versionId = sanitizer(req.body.version);
    const linkId = sanitizer(req.params.linkId);
    
    check('linkId', 'Invalid technology-project link ID').isInt();
    check('version', 'Invalid version ID').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.end(JSON.stringify({success: false, error: errors}));
        return;
    }

    projects.updateTechnologyVersion(versionId, linkId, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

ProjectsApiHandler.getTechnologiesForProject = function (req, res) {
    const projectId = sanitizer(req.params.projectId);

    technology.getAllForProject(projectId, function (error, result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};


ProjectsApiHandler.addTechnologyToProject = function (req, res) {
    const projectId = sanitizer(req.params.projectId);
    const technologyIds = req.body.technologies;
    const versionIds = req.body.versions;

    projects.addTechnologies(projectId, technologyIds, versionIds, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};


ProjectsApiHandler.updateProject = function (req, res) {
    projects.update(
        req.body.projectId,
        sanitizer(req.body.projectname.trim()),
        sanitizer(req.body.description), function (result, error) {
            apiutils.handleResultSet(res, result, error);
        });

};

module.exports = ProjectsApiHandler;
