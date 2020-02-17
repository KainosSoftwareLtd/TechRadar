'use strict';

const tag = require('../../dao/tag.js');
const sanitizer = require('sanitize-html');
const apiutils = require('../../utils/apiUtils.js');
const tagValidator = require('../../shared/validators/tagValidator.js');

const TagsApiHandler = function () {
};

TagsApiHandler.getTags = function (req, res) {
    tag.getAll()
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));

};

TagsApiHandler.getAllWithOptionalProjectId = function (req, res) {
    const projectId = sanitizer(req.params.projectId);
    tag.getAllWithOptionalProjectId(projectId)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));

};

TagsApiHandler.getForProject = function (req, res) {
    const projectId = sanitizer(req.params.projectId);
    tag.getAllForProject(projectId)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
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

    tag.add(tagName)
        .then(result => apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

TagsApiHandler.deleteTags = function (req, res) {
    const tagIds = req.body.tags;

    tag.delete(tagIds)
        .then(result => {
            apiutils.handleResultSet(res, result, null);
        })
        .catch(error => {
            apiutils.sendErrorResponse(res, error);
        });
};

TagsApiHandler.reassignTagsToProject = function (req, res) {
    const tagIds = req.body.tags;
    const projectId = sanitizer(req.params.projectId);

    tag.reassignToProject(projectId, tagIds)
        .then(result => {
            apiutils.handleResultSet(res, result, null);
        })
        .catch(error => {
            apiutils.sendErrorResponse(res, error);
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

    tag.update(tagId, tagName)
        .then(result => {
            apiutils.handleResultSet(res, result, null);
        })
        .catch(error => {
            apiutils.sendErrorResponse(res, error);
        });
};

module.exports = TagsApiHandler;
