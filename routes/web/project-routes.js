'use strict';
/**
 *  All routes under /project
 */
const express = require('express');
const router = express.Router();

const handler = require('../../handlers/web/projectsWebHandler');
const security = require('../../utils/security.js');

//  List projects page
router.get('/list', security.isAuthenticated, handler.list);

// Add new project page
router.get('/add', security.canEdit, handler.add);

// Edit all tags
router.get('/tags/edit', security.isAuthenticated, handler.editTags);

// List projects page for a tag
router.get('/tags/:tagId', security.isAuthenticated, handler.listForTag);

// Add new Technology to the project
router.get('/:projectId/technology/add', security.canEdit, handler.addTechnology);

// Add new Technology to the project
router.get('/:projectId/technology/remove', security.canEdit, handler.removeTechnology);

// Edit project page
router.get('/:projectId/edit', security.isAuthenticatedAdmin, handler.edit);

// Show project tags
router.get('/:projectId/tags', security.isAuthenticated, handler.reassignTags);

// Show project radar page
router.get('/:projectId', security.isAuthenticated, handler.showRadar);





module.exports = router;