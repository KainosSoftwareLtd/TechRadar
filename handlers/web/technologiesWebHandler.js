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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num, function (value) {
        if (value == null || value.length === 0 || value.length > 1) {
            res.redirect('/error');
        } else {

            const statuses = cache.getStatuses();
            res.render('pages/editTechnology',
                {
                    technology: value,
                    user: req.user,
                    statuses: statuses
                });
        }
    });
};

TechnologiesWebHandler.getVersions = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num, function (value) {
        if (value == null || value.length === 0 || value.length > 1) {
            res.redirect('/error');
        } else {

            res.render('pages/editVersions',
                {
                    technology: value,
                    user: req.user
                });
        }
    });
};

TechnologiesWebHandler.getTechnology = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num, function (value) {
        if (value == null || value.length === 0 || value.length > 1) {
            res.redirect('/error');
        } else {
            const statuses = cache.getStatuses();
            const usedThisOptions = cache.getUsedThisTechOptions();
            res.render('pages/technology',
                {
                    technology: value,
                    user: req.user,
                    statuses: statuses,
                    usedThisOptions: usedThisOptions
                });
        }
    });
};

TechnologiesWebHandler.getUsers = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num, function (value) {
        usedThis.getUsersForTechnology(num, null, function (users) {
            if (value == null || value.length === 0 || value.length > 1) {
                res.redirect('/error');
            } else {
                res.render('pages/technologyUsers',
                    {
                        technology: value,
                        user: req.user,
                        techUsers: users
                    });
            }
        });
    });
};

TechnologiesWebHandler.getStatusHistory = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const techid = req.params.id;
    technology.getById(req.user.id, techid, function (value) {

        if (value == null || value.length === 0) {
            res.redirect('/error');
        }

        res.render('pages/statushistory',
            {
                technology: value,
                user: req.user
            });
    });
};

TechnologiesWebHandler.getVotes = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const techid = req.params.id;
    technology.getById(req.user.id, techid, function (value) {

        if (value == null || value.length === 0) {
            res.redirect('/error');
            return;
        }

        res.render('pages/votehistory',
            {
                technology: value,
                user: req.user
            });
    });
};

TechnologiesWebHandler.updateStatus = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const techid = req.params.id;
    technology.getById(req.user.id, techid, function (value) {
        if (value == null || value.length === 0) {
            res.redirect('/error');
        }

        const statuses = cache.getStatuses();
        res.render('pages/updateStatus',
            {
                technology: value,
                user: req.user,
                statuses: statuses
            });
    });
};

TechnologiesWebHandler.addProject = function (req, res) {
    check('id', 'Invalid technology id').isInt();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const techid = req.params.id;
    technology.getById(req.user.id, techid, function (technology) {
        if (technology === null) {
            res.redirect('/error');
        } else {
            project.getAllForTechnology(techid, function (linkedProjects) {

                project.getAll(function (allProjects) {
                    res.render('pages/addProjectToTechnology',
                        {
                            technology: technology,
                            user: req.user,
                            unassignedProjects: allProjects.filter(function (e) {
                                return linkedProjects.map(function (linkedEl) {
                                    return linkedEl.id
                                }).indexOf(e.id) === -1;
                            })
                        });
                });
            });
        }
    });
};

module.exports = TechnologiesWebHandler;