const technology = require('../../dao/technology');
const status = require('../../dao/status');
const votes = require('../../dao/vote');
const usedThisVotes = require('../../dao/usedThisTechnology');
const project = require('../../dao/projects');
const cache = require('../../dao/cache');

const apiutils = require('./apiUtils');
const sanitizer = require('sanitize-html');
const technologyValidator = require('../../shared/validators/technologyValidator');


const TechnologyApiHandler = function () {
};

TechnologyApiHandler.addVote = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const statusName = sanitizer(req.body.statusname);
    const userId = sanitizer(req.user.id);

    const status = cache.getStatus( statusName );
    const statusValue = status.id;

    votes.add(tech, statusValue, userId, function (result, error) {
        res.writeHead(200, {"Content-Type": "application/json"});
        if (error != null) {
            res.end(JSON.stringify({success: false, error: error}));
        } else {
            res.end(JSON.stringify({success: true, vote: result}));
        }
    });
};

TechnologyApiHandler.addUsedThisTechnologyVote = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const daysAgo = sanitizer(req.body.daysAgo);
    const userId = sanitizer(req.user.id);

    usedThisVotes.add(tech, daysAgo, userId, function (result, error) {
        res.writeHead(200, {"Content-Type": "application/json"});
        if (error != null) {
            res.end(JSON.stringify({success: false, error: error}));
        } else {
            res.end(JSON.stringify({success: true, vote: result}));
        }
    });
};

TechnologyApiHandler.getTechnologies = function (req, res) {
    const search = req.query.search;

    if (search == null) {
        technology.getAll(req.user.id, function (result) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(result));
        })

    } else {
        technology.search(sanitizer(search), function (result) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(result));
        })
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
        res.writeHead(200, {"Content-Type": "application/json"});
        const data = {};
        data.error = validationResult.message;
        data.success = false;
        res.end(JSON.stringify(data));
        return;
    }

    technology.add(
        technologyName,
        technologyWebsite,
        sanitizer(req.body.technologyCategory),
        sanitizer(req.body.technologyDescription),
        sanitizer(req.body.technologyLicence),
        technologyLicenceLink,
        function (result, error) {
            apiutils.handleResultSet(res, result, error);
        });
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
        res.writeHead(200, {"Content-Type": "application/json"});
        const data = {};
        data.error = validationResult.message;
        data.success = false;
        res.end(JSON.stringify(data));
        return;
    }
    
    technology.update(
        techid,
        technologyName,
        technologyWebsite,
        sanitizer(req.body.category),
        sanitizer(req.body.description),
        sanitizer(req.body.technologyLicence),
        technologyLicenceLink,

        function (result, error) {
            apiutils.handleResultSet(res, result, error);
        });
};

TechnologyApiHandler.deleteTechnology = function (req, res) {
    const data = req.body.id;

    technology.delete(data, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    })
};


TechnologyApiHandler.getVotes = function (req, res) {
    const techid = sanitizer(req.params.technology);
    const limit = sanitizer(req.query.limit);

    votes.getVotesForTechnology(techid, limit, function (result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};

TechnologyApiHandler.getStatusHistory = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const limit = sanitizer(req.query.limit);

    status.getHistoryForTechnology(tech, limit, function (result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    })

};

TechnologyApiHandler.getVoteHistory = function (req, res) {
    const tech = sanitizer(req.params.technology);
    const limit = sanitizer(req.query.limit);

    votes.getVotesForTechnology(tech, limit, function (result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    })
};

TechnologyApiHandler.getVoteTotals = function (req, res) {
    const tech = sanitizer(req.params.technology);
    votes.getTotalVotesForTechnologyStatus(tech, function (result) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    })

};

TechnologyApiHandler.updateStatus = function (req, res) {
    const status = sanitizer(req.body.statusvalue);
    const reason = sanitizer(req.body.reason);
    const tech = sanitizer(req.params.technology);

    technology.updateStatus(tech, status, reason, req.user.id, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

TechnologyApiHandler.addProject = function (req, res) {
    const projectId = sanitizer(req.body.project);
    const technologyId = sanitizer(req.params.technology);
    const versionId = sanitizer(req.body.version);

    technology.addProject(technologyId, projectId, versionId, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

TechnologyApiHandler.getUsersCountInLastDays = function (req, res) {
    const technologyId = sanitizer(req.params.technology);
    let daysAgo;
    if(typeof req.query.daysAgo != "undefined"){
        daysAgo = sanitizer(req.query.daysAgo);
    }

    usedThisVotes.getUsersCountInLastDays(technologyId, daysAgo, function (result, error) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};

TechnologyApiHandler.getUsers = function (req, res) {
    const technologyId = sanitizer(req.params.technology);
    let limit; // getUsersForTechnology can handle undefined limit
    if(typeof req.query.limit != "undefined"){
        limit = sanitizer(req.query.limit);
    }

    usedThisVotes.getUsersForTechnology(technologyId, limit, function (result, error) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};

TechnologyApiHandler.getProjects = function (req, res) {
    const technologyId = sanitizer(req.params.technology);

    project.getAllForTechnology(technologyId, function (result, error) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};

TechnologyApiHandler.removeProject = function (req, res) {
    const technologyId = sanitizer(req.params.technology);
    const projectIds = req.body.projects;

    technology.removeProjects(technologyId, projectIds, function (result, error) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(result));
    });
};


module.exports = TechnologyApiHandler;
