'use strict';
const logger = require('../../winstonLogger')(module);

const cache = require('../../dao/cache.js');
const project = require('../../dao/projects');
const technology = require('../../dao/technology');
const usedThis = require('../../dao/usedThisTechnology');
const {check, validationResult} = require('express-validator');


const TechnologiesWebHandler = function () {
};

TechnologiesWebHandler.listTechnologies = function (req, res) {
    res.render('pages/admin/listTechnologies', {user: req.user});
};

TechnologiesWebHandler.search = function (req, res) {
    res.render('pages/searchTechnologies', {user: req.user});
};

TechnologiesWebHandler.add = function (req, res) {
    res.render('pages/addTechnology', {categories: cache.getCategories(), user: req.user});
};

TechnologiesWebHandler.edit = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num)
        .then(technology => {
            const statuses = cache.getStatuses();
            res.render('pages/editTechnology',
                {
                    technology: technology,
                    user: req.user,
                    statuses: statuses
                });
        })
        .catch(errors => {
            logErrorAndRedirect(res, errors);
        });
};

TechnologiesWebHandler.getVersions = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num)
        .then(technology => {
            res.render('pages/editVersions',
                {
                    technology: technology,
                    user: req.user
                });
        })
        .catch(errors => {
            logErrorAndRedirect(res, errors);
        })
};

TechnologiesWebHandler.getTechnology = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num)
        .then(technology => {
            const statuses = cache.getStatuses();
            const usedThisOptions = cache.getUsedThisTechOptions();
            res.render('pages/technology',
                {
                    technology: technology,
                    user: req.user,
                    statuses: statuses,
                    usedThisOptions: usedThisOptions
                });
        })
        .catch(errors => {
            logErrorAndRedirect(res, errors);
        })
};

TechnologiesWebHandler.getUsers = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const num = req.params.id;
    let theTechnology;
    technology.getById(req.user.id, num)
        .then(technology => {
            theTechnology = technology;
            return usedThis.getUsersForTechnology(num, null);
        })
        .then(users => {
            res.render('pages/technologyUsers',
                {
                    technology: theTechnology,
                    user: req.user,
                    techUsers: users
                });
        })
        .catch(errors => {
            logErrorAndRedirect(res, errors);
        });
};

TechnologiesWebHandler.getStatusHistory = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const techId = req.params.id;
    technology.getById(req.user.id, techId)
        .then(technology => {
            res.render('pages/statushistory',
                {
                    technology: technology,
                    user: req.user
                });
        })
        .catch(errors => {
            logErrorAndRedirect(res, errors);
        });
};

TechnologiesWebHandler.getVotes = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const techId = req.params.id;
    technology.getById(req.user.id, techId)
        .then(technology => {
            res.render('pages/votehistory',
                {
                    technology: technology,
                    user: req.user
                });
        })
        .catch(errors => {
            logErrorAndRedirect(res, errors);
        });
};

TechnologiesWebHandler.updateStatus = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const techId = req.params.id;
    technology.getById(req.user.id, techId)
        .then(technology => {
            const statuses = cache.getStatuses();
            res.render('pages/updateStatus',
                {
                    technology: technology,
                    user: req.user,
                    statuses: statuses
                });
        })
        .catch(errors => {
            logErrorAndRedirect(res, errors);
        });
};

TechnologiesWebHandler.addProject = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    if (hasValidationErrorsLogAndRedirect(req, res)) {
        return;
    }

    const techId = req.params.id;
    let theLinkedProjects;
    let theTechnology;
    technology.getById(req.user.id, techId)
        .then(technology => {
            theTechnology = technology;
            return project.getAllForTechnology(techId);
        })
        .then(linkedProjects => {
            theLinkedProjects = linkedProjects;
            return project.getAll();
        })
        .then(allProjects => {
            res.render('pages/addProjectToTechnology',
                {
                    technology: theTechnology,
                    user: req.user,
                    unassignedProjects: allProjects.filter(function (e) {
                        return theLinkedProjects.map(function (linkedEl) {
                            return linkedEl.id
                        }).indexOf(e.id) === -1;
                    })
                });
        })
        .catch(error => {
            logErrorAndRedirect(res, error);
        });

};

function hasValidationErrorsLogAndRedirect(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logErrorAndRedirect(res, errors);
        return true;
    } else {
        return false;
    }
}

function logErrorAndRedirect(res, error) {
    logger.error(error);
    res.redirect('/error');
}

module.exports = TechnologiesWebHandler;