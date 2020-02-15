const comments = require('../../dao/comments');
const technology = require('../../dao/technology');
const {check, validationResult} = require('express-validator');

const PAGE_SIZE = 10;

const CommentsWebHandler = function () {
};

CommentsWebHandler.add = function (req, res) {
    check('id', 'Invalid comment id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num, function (value) {
        res.render('pages/addComment', {technology: value, user: req.user});
    });
};

CommentsWebHandler.update = function (req, res) {
    check('commentId', 'Invalid comment id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
    } else {
        comments.getById(req.params.commentId, function (comment) {
            technology.getById(req.user.id, comment.technology, function (technology) {
                res.render('pages/updateComment', {technology: technology, user: req.user, comment: comment});
            });
        });
    }
};

CommentsWebHandler.commentsForTechnology = function (req, res) {
    check('technologyId', 'Invalid technology id').isInt();
    check('page', 'Invalid page number').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.redirect('/error');
        return;
    }

    const techid = req.params.technologyId;
    const pageNumber = req.params.page;
    comments.getForTechnology(techid, pageNumber, PAGE_SIZE, function (result, error) {
        comments.getCountForTechnology(techid, function (countData) {
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