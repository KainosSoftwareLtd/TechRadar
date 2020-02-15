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

    projects.findById(req.params.projectId, function (error, project) {
        if (error) {
            res.redirect('/error');
            return;
        }
        tags.getAllWithOptionalProjectId(req.params.projectId, function (tags, tagsError) {
            if (tagsError) {
                res.redirect('/error');
            } else {
                res.render('pages/reassignTags', {user: req.user, tags: tags, project: project});
            }
        });
    });
};

ProjectsWebHandler.editTags = function (req, res) {
    tags.getAll(function (tags) {
        res.render('pages/editTags', {user: req.user, tags: tags});
    });
};

ProjectsWebHandler.edit = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId, function (error, project) {
        if (error) {
            res.redirect('/error');
        } else {
            res.render('pages/admin/editProject', {user: req.user, project: project});
        }
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

    projects.findById(req.params.projectId, function (error, project) {
        if (error) {
            res.redirect('/error');
        } else {
            res.render('pages/addTechnologyToProject', {user: req.user, project: project});
        }
    });
};

ProjectsWebHandler.removeTechnology = function (req, res) {
    check('projectId', 'Invalid project id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId, function (error, project) {
        if (error) {
            res.redirect('/error');
        } else {
            res.render('pages/removeTechnologyFromProject', {user: req.user, project: project});
        }
    });
};

ProjectsWebHandler.showRadar = function (req, res) {
    check('projectId', 'Invalid project id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId, function (error, project) {
        if (error) {
            res.redirect('/error');
        } else {
            technology.getAllForProject(project.id, function (error, technologies) {
                if (error) {
                    res.redirect('/error');
                } else {
                    tags.getAllForProject(project.id, function(tags, tagsError) {
                        if(tagsError){
                            res.redirect('/error');
                        } else {
                            // groups technologies by status into the following structure: 
                            // [{ status: key, technologies: [technologies where status==key]}]
                            const technologiesInGroups = _.chain(technologies).groupBy('status')
                                .map(function(technologies, key) {
                                    return {
                                        status: key,
                                        technologies: technologies
                                    };
                                }).value();
                                
                            res.render('pages/projectRadar', {
                                user: req.user,
                                project: project,
                                technologies: technologies, // used by radar.js
                                technologiesInGroups: technologiesInGroups,
                                tags: tags
                            });
                        }
                    });
                }
            });
        }
    });
};

ProjectsWebHandler.list = function (req, res) {
    // check if a project name parameter has been specified
    let name = req.query.name;

    if( name===undefined) {
        res.render('pages/searchProjects', {user: req.user});
    } else {
        name = decodeURI(name);

        projects.findByName( name , function( error , project ) {
            if (error) {
                res.redirect('/error');
            } else {
                res.redirect('/project/' + project.id)
            }
        })
    }
};

ProjectsWebHandler.listForTag = function (req, res) {
    let tagId = req.params.tagId;

    tags.getById(tagId, function(tag, error) {
        if(error) {
            res.redirect('/error');
        } else {
            res.render('pages/searchProjectsByTag', {user: req.user, tag: tag});
        }
    });
};

module.exports = ProjectsWebHandler;
