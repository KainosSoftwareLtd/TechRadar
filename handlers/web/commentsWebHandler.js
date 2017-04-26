var comments = require('../../dao/comments');
var technology = require('../../dao/technology');

var PAGE_SIZE = 10;

var CommentsWebHandler = function () {
};

CommentsWebHandler.add = function (req, res) {
    req.checkParams('id', 'Invalid comment id').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
        res.redirect('/error');
        return;
    }

    var num = req.params.id;
    technology.getById(req.user.id, num, function (value) {
        res.render('pages/addComment', {technology: value, user: req.user});
    });
};

CommentsWebHandler.update = function (req, res) {
    req.checkParams('commentId', 'Invalid comment id').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
        res.redirect('/error');
        return;
    }

    comments.getById(req.params.commentId, function(comment) {
        technology.getById(req.user.id, comment.technology, function (technology) {
            res.render('pages/updateComment', {technology: technology, user: req.user, comment: comment});
        });
    });
};

CommentsWebHandler.commentsForTechnology = function (req, res) {
    req.checkParams('technologyId', 'Invalid technology id').isInt();
    req.checkParams('page', 'Invalid page number').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });
        res.redirect('/error');
        return;
    }

    var techid = req.params.technologyId;
    var pageNumber = req.params.page;
    comments.getForTechnology(techid, pageNumber, PAGE_SIZE, function (result, error) {
        if(error) {
            res.redirect('/error');
            return;
        }

        comments.getCountForTechnology(techid, function (countData, countError) {
            if(countError) {
                res.redirect('/error');
                return;
            }

            res.render('partials/comments', {
                comments: result,
                user: req.user,
                count: countData.count,
                pageSize: PAGE_SIZE,
                currentPage: pageNumber,
                technologyId: techid
            });
        });
    });
};

module.exports = CommentsWebHandler;