'use strict';
/**
 *  All routes under /category
 */
const logger = require('../../winstonLogger')(module);
const express = require('express');
const router = express.Router();

const handler = require('../../handlers/web/categoriesWebHandler.js');
const security = require('../../utils/security.js');

/**
 * List categories
 */
router.get('/list', security.isAuthenticatedAdmin, handler.listCategories);

/**
 * Add new category page
 */
router.get('/add', security.isAuthenticatedAdmin, handler.addCategory);

/**
 * Get all technologies for for category
 */
router.get('/:category/technologies', security.isAuthenticated, handler.technologiesForCategory);


module.exports = router;