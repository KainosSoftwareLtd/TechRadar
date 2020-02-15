const handler = require('../../handlers/web/commentsWebHandler');
const security = require('../../utils/security');

const CommentRoutes = function () {
};

CommentRoutes.createRoutes = function (self) {

    /**
     * Add a new comment for technology
     */
    self.app.get('/comments/add/:id', security.canAddComments, handler.add);

    /**
     * Update a comment for technology
     */
    self.app.get('/comments/update/:commentId', security.canAddComments, handler.update);

    /**
     * Get Comments for a technology
     */
    self.app.get('/comments/:technologyId/:page', security.isAuthenticated, handler.commentsForTechnology);

};


module.exports = CommentRoutes;