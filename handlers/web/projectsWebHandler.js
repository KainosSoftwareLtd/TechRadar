var projects = require('../../dao/projects');
var tags = require('../../dao/tag');
var technology = require('../../dao/technology');
var _ = require('underscore');

var ProjectsWebHandler = function () {
};

ProjectsWebHandler.add = function (req, res) {
    res.render('pages/admin/addProject', {user: req.user});
};

ProjectsWebHandler.reassignTags = function (req, res) {
    req.checkParams('projectId', 'Invalid project id').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
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
                req.flash("danger", "Error while retrieving project tags for project id: " + req.params.projectId);
                res.redirect('/error');
                return;
            } else {
                res.render('pages/reassignTags', {
                    user: req.user,
                    tags: tags,
                    project: project,
                    messages: req.flash()
                });
            }
        });
    });
};

ProjectsWebHandler.editTags = function (req, res) {
    tags.getAll(function (tags) {
        res.render('pages/editTags', {
            user: req.user,
            tags: tags,
            messages: req.flash()
        });
    });
};

ProjectsWebHandler.edit = function (req, res) {
    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId, function (error, project) {
        if (error) {
            res.redirect('/error');
            return;
        } else {
            res.render('pages/admin/editProject', {user: req.user, project: project});
        }
    });
};

ProjectsWebHandler.addTechnology = function (req, res) {
    req.checkParams('projectId', 'Invalid project id').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
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
    req.checkParams('projectId', 'Invalid project id').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
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
    req.checkParams('projectId', 'Invalid project id').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
        res.redirect('/error');
        return;
    }

    projects.findById(req.params.projectId, function (error, project) {

        if (error) {
            res.redirect('/error');
            return;
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
                            var technologiesInGroups = _.chain(technologies).groupBy('status')
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
    var name = req.query.name;

    if(name == undefined) {
        res.render('pages/searchProjects', {user: req.user});
    } else {
        name = decodeURI(name);

        projects.findByName(name , function(error, project) {
            if (error) {
                res.redirect('/error');
            } else {
                res.redirect('/project/' + project.id)
            }
        })
    }

};

ProjectsWebHandler.listForTag = function (req, res) {

    var tagId = req.params.tagId;

    tags.getById(tagId, function(tag, error) {
        if(error) {
            res.redirect('/error');
        } else {
            res.render('pages/searchProjectsByTag', {user: req.user, tag: tag});
        }
    });
};

module.exports = ProjectsWebHandler;
