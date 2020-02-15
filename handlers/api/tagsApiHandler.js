const tag = require('../../dao/tag.js');
const sanitizer = require('sanitize-html');
const apiutils = require('./apiUtils.js');
const tagValidator = require('../../shared/validators/tagValidator.js');

const TagsApiHandler = function () {
};

TagsApiHandler.getTags = function (req, res) {
    tag.getAll(function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

TagsApiHandler.getAllWithOptionalProjectId = function (req, res) {
    const projectId = sanitizer(req.params.projectId);
    tag.getAllWithOptionalProjectId(projectId, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

TagsApiHandler.getForProject = function (req, res) {
    const projectId = sanitizer(req.params.projectId);
    tag.getAllForProject(projectId, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

TagsApiHandler.addTag = function (req, res) {
    const tagName = sanitizer(req.body.name.trim());

    const validationResult = tagValidator.validateTagName(tagName);
    if (!validationResult.valid) {
        res.writeHead(200, {"Content-Type": "application/json"});
        const data = {};
        data.error = validationResult.message;
        data.success = false;
        res.end(JSON.stringify(data));
        return;
    }

    tag.add(
        tagName,
        function (result, error) {
            apiutils.handleResultSet(res, result, error);
    });
};

TagsApiHandler.deleteTags = function (req, res) {
    const tagIds = req.body.tags;

    tag.delete(tagIds, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

TagsApiHandler.reassignTagsToProject = function (req, res) {
    const tagIds = req.body.tags;
    const projectId = sanitizer(req.params.projectId);

    tag.reassignToProject(projectId, tagIds, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

TagsApiHandler.updateTag = function (req, res) {
    const tagId = sanitizer(req.body.tag);
    const tagName = sanitizer(req.body.name.trim());

    const validationResult = tagValidator.validateTagName(tagName);
    if (!validationResult.valid) {
        res.writeHead(200, {"Content-Type": "application/json"});
        const data = {};
        data.error = validationResult.message;
        data.success = false;
        res.end(JSON.stringify(data));
        return;
    }

    tag.update(tagId, tagName, function (result, error) {
        apiutils.handleResultSet(res, result, error);
    });
};

module.exports = TagsApiHandler;
