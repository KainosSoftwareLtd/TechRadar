'use strict';
const logger = require('../../winstonLogger')(module);
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
        logger.error(errors);
        res.redirect('/error');
        return;
    }

    const num = req.params.id;
    technology.getById(req.user.id, num)
        .then(technology => {
            res.render('pages/addComment', {technology: technology, user: req.user});
        })
        .catch(error => {
            logger.error(error);
            res.redirect('/error')
        })

};

CommentsWebHandler.update = function (req, res) {
    check('commentId', 'Invalid comment id').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error(errors);
        res.redirect('/error');
    } else {
        let theComment;

        comments.getById(req.params.commentId)
            .then(comment => {
                theComment = comment;
                return technology.getById(req.user.id, comment.technology);
            })
            .then(technology => {
                res.render('pages/updateComment', {technology: technology, user: req.user, comment: comment});
            })
            .catch(error => {
                logger.error(error);
                res.redirect('/error');
            })
    }
};

CommentsWebHandler.commentsForTechnology = function (req, res) {
    check('technologyId', 'Invalid technology id').isInt();
    check('page', 'Invalid page number').isInt();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error(errors);
        res.redirect('/error');
        return;
    }

    const techId = req.params.technologyId;
    const pageNumber = req.params.page;
    let returnedComments;
    comments.getForTechnology(techId, pageNumber, PAGE_SIZE)
        .then(result => {
            returnedComments = result;
            return comments.getCountForTechnology(techId);
        })
        .then(countData => {
            res.render('partials/comments', {
                comments: returnedComments,
                user: req.user,
                count: countData.count,
                pageSize: PAGE_SIZE,
                currentPage: pageNumber,
                technologyId: techId
            });
        })
        .catch(error => {
            logger.error(error);
            res.sendStatus(500);
        });
};

module.exports = CommentsWebHandler;