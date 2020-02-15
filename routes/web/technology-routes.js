'use strict';
/**
 *  All routes under /technology
 */
const logger = require('../../winstonLogger')(module);
const express = require('express');
const router = express.Router();

const handler = require('../../handlers/web/technologiesWebHandler');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const security = require('../../utils/security.js');

/**
 * List all the technologies
 */
router.get('/list', security.isAuthenticatedAdmin, handler.listTechnologies);

/**
 * Show the technology search page
 */
router.get('/search', security.isAuthenticated, jsonParser, handler.search);

/**
 * Add a new technology
 */
router.get('/add', security.canEdit, handler.add);

/**
 * Edit a technology
 */
router.get('/:id/edit', security.canEdit, handler.edit);

/**
 * Edit the software versions for a technology
 */
router.get('/:id/versions', security.canEdit, handler.getVersions);

/**
 * Show the status history for a technology
 */
router.get('/:id/statushistory', security.isAuthenticated, handler.getStatusHistory);

/**
 * Show the vote history for a technology
 */
router.get('/:id/votehistory', security.isAuthenticated, handler.getVotes);

/**
 * Show all of the status updates for a technology
 */
router.get('/:id/updatestatus', security.isAuthenticatedAdmin, handler.updateStatus);

/**
 * Show the projects for a specified technology
 */
router.get('/:id/projects', security.isAuthenticated, handler.addProject);

/**
 * Show the users of a specified technology
 */
router.get('/:id/users', security.isAuthenticated, handler.getUsers);

/**
 * Show a specific technology by id
 */
router.get('/:id', security.isAuthenticated, handler.getTechnology);


module.exports = router;