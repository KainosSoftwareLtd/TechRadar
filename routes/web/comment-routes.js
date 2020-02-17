'use strict';
/**
 *  All routes under /comments
 */
const express = require('express');
const router = express.Router();

const handler = require('../../handlers/web/commentsWebHandler');
const security = require('../../utils/security');

// Add a new comment for technology
router.get('/add/:id', security.canAddComments, handler.add);

// Update a comment for technology
router.get('/update/:commentId', security.canAddComments, handler.update);

//Get Comments for a technology
router.get('/:technologyId/:page', security.isAuthenticated, handler.commentsForTechnology);

module.exports = router;