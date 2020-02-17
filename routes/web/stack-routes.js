'use strict';
/**
 *  All routes under /stacks
 */
const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const security = require('../../utils/security');

/**
 * Stack builder - WIP
 */
router.get('/list', security.isAuthenticated, function (req, res) {
    res.render('pages/listStacks', {user: req.user});
});

router.get('/add', security.isAuthenticated, function (req, res) {
    res.render('pages/addStack', {user: req.user});
});


module.exports = router;