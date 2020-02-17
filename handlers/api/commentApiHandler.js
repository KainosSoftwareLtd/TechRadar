'use strict';

const comments = require('../../dao/comments.js');
const apiutils = require('../../utils/apiUtils.js');
const sanitizer = require('sanitize-html');

const CommentApiHandler = function () {
};

CommentApiHandler.addComment = function (req, res) {

    comments.add(   sanitizer(req.body.technology),
                    sanitizer(req.body.comment),
                    sanitizer(req.user.id),
                    sanitizer(req.body.software_version_id))
        .then(result =>apiutils.handleResultSet(res, result))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

CommentApiHandler.updateComment = function (req, res) {
    comments.getById(sanitizer(req.body.commentId))
        .then(comment => {
            // if not the owner of this comment and not an admin
            if (comment.userid !== req.user.id && req.user.role !== 0) {
                const error = "Only admins can edit comments created by other users";
                apiutils.handleResultSet(res, false, null);
            } else {
                comments.update(
                    sanitizer(req.body.commentId),
                    sanitizer(req.body.comment),
                    sanitizer(req.body.software_version_id))
                    .then(result => {
                        apiutils.handleResultSet(res, result, null);
                    })
            }
        })
        .catch(error => apiutils.sendErrorResponse(res, error));
};

CommentApiHandler.deleteComment = function (req, res) {
    const data = req.body.id;

    comments.delete(data)
        .then(result =>apiutils.handleResultSet(res, true))
        .catch(error => apiutils.sendErrorResponse(res, error));
};

module.exports = CommentApiHandler;