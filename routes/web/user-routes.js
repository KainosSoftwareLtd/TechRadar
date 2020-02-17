'use strict';
/**
 *  All routes under /category
 */
const express = require('express');
const router = express.Router();

const handler = require('../../handlers/web/usersWebHandler');
const security = require('../../utils/security');

// Users page
router.get('/list', security.isAuthenticatedAdmin, handler.list);

// Add new user page
router.get('/add', security.isAuthenticatedAdmin, handler.add);

// Edit the current users profile page
router.get('/profile', security.isAuthenticated, handler.editProfile);

// Edit specific user page
router.get('/:userId/edit', security.isAuthenticatedAdmin, handler.editUser);

module.exports = router;