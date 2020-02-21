'use strict';
const logger = require('../../winstonLogger')(module);

const projects = require('../../dao/projects');
const tags = require('../../dao/tag');
const technology = require('../../dao/technology');
const _ = require('underscore');
const {check, validationResult} = require('express-validator');

const ProjectsWebHandler = function () {
};

ProjectsWebHandler.add = function (req, res) {
    res.render('pages/admin/addProject', {user: req.user});
};

ProjectsWebHandler.reassignTags = function (req, res) {
    check('projectId', 'Invalid project id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    let theProject;
    projects.findById(req.params.projectId)
        .then(project => {
            theProject = project;
            return tags.getAllWithOptionalProjectId(req.params.projectId);
        })
        .then(tags => {
            res.render('pages/reassignTags', {user: req.user, tags: tags, project: theProject});
        })
        .catch(error => {
            res.redirect('/error');
        });
};

ProjectsWebHandler.editTags = function (req, res) {
    tags.getAll()
        .then(tags => {
            res.render('pages/editTags', {user: req.user, tags: tags});
        })
        .catch(error => {
            res.redirect('/error');
        });
};

ProjectsWebHandler.edit = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId)
        .then(project => {
            res.render('pages/admin/editProject', {user: req.user, project: project});
        })
        .catch(error => {
            res.redirect('/error');
        });
};

ProjectsWebHandler.addTechnology = function (req, res) {
    check('projectId', 'Invalid project id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId)
        .then(project => {
            res.render('pages/addTechnologyToProject', {user: req.user, project: project});
        })
        .catch(error => {
            res.redirect('/error');
        })
};

ProjectsWebHandler.removeTechnology = function (req, res) {
    check('projectId', 'Invalid project id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId)
        .then(project => {
            res.render('pages/removeTechnologyFromProject', {user: req.user, project: project});
        })
        .catch(error => {
            res.redirect('/error');
        });

};

ProjectsWebHandler.showRadar = function (req, res) {
    check('projectId', 'Invalid project id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error( "Error showing project radar : ",{message: errors} );
        res.redirect('/error');
        return;
    }

    let theProject;
    let theTechnology;
    projects.findById(req.params.projectId)
        .then(project => {
            theProject = project;
            return technology.getAllForProject(project.id)
        })
        .then(technologies => {
            theTechnology = technologies;
            return tags.getAllForProject(theProject.id);
        })
        .then(tags => {
            // groups technologies by status into the following structure:
            // [{ status: key, technologies: [technologies where status==key]}]
            const technologiesInGroups = _.chain(theTechnology).groupBy('status')
                .map(function (technologies, key) {
                    return {
                        status: key,
                        technologies: technologies
                    };
                }).value();

            res.render('pages/projectRadar', {
                user: req.user,
                project: theProject,
                technologies: theTechnology, // used by radar.js
                technologiesInGroups: technologiesInGroups,
                tags: tags
            })
        })
        .catch(error => {
            res.redirect('/error');
        });
};

ProjectsWebHandler.list = function (req, res) {
    // check if a project name parameter has been specified
    let name = req.query.name;

    if (name === undefined) {
        res.render('pages/searchProjects', {user: req.user});
    } else {
        name = decodeURI(name);

        projects.findByName(name)
            .then(project => {
                res.redirect('/projects/' + project.id)
            })
            .catch(error => {
                res.redirect('/error');
            })
    }
};

ProjectsWebHandler.listForTag = function (req, res) {
    let tagId = req.params.tagId;

    tags.getById(tagId)
        .then(tag => {
            res.render('pages/searchProjectsByTag', {user: req.user, tag: tag});
        })
        .catch(error => {
            res.redirect('/error');
        });
};

module.exports = ProjectsWebHandler;
