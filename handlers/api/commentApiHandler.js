var comments = require('../../dao/comments.js');
var apiutils = require('./apiUtils.js');
var sanitizer = require('sanitize-html');


var CommentApiHandler = function () {
};

CommentApiHandler.addComment = function (req, res) {

    comments.add(
        sanitizer(req.body.technology),
        sanitizer(req.body.comment),
        sanitizer(req.user.id),
        sanitizer(req.body.software_version_id),

        function (result, error) {
            apiutils.handleResultWithFlash(req, res, result, error);
        });
};

CommentApiHandler.updateComment = function (req, res) {
    comments.getById(sanitizer(req.body.commentId), function(comment) {
        // if not the owner of this comment and not an admin
        if (comment.userid !== req.user.id && req.user.role !== 0) {
            var error = "Only admins can edit comments created by other users";
            apiutils.handleResultWithFlash(req, res, false, error);
        } else {
            comments.update(
                sanitizer(req.body.commentId),
                sanitizer(req.body.comment),
                sanitizer(req.body.software_version_id),
                function(result, error) {
                    apiutils.handleResultWithFlash(req, res, result, error);
            });
        }
    });
};

CommentApiHandler.deleteComment = function (req, res) {
    var data = req.body.id;

    comments.delete(data, function (result, error) {
        apiutils.handleResultWithFlash(req, res, result, error);
    })
};

module.exports = CommentApiHandler;