'use strict';
/**
 *  Main routes for the Application
 */
const logger = require('../../winstonLogger')(module);
const express = require('express');
const router = express.Router();

const technology = require('../../dao/technology.js');
const passport = require('passport');
const security = require('../../utils/security');
const {check, validationResult} = require('express-validator');

// Index page
router.get('/', security.isAuthenticated,
    function (req, res) {
        const url = req.session.redirect_to;
        if (url !== undefined) {
            delete req.session.redirect_to;
            res.redirect(url);
        } else {
            res.render('pages/index', {user: req.user});
        }
    });

// Error page
router.get('/error',
    function (req, res) {
        if (req.isAuthenticated()) {
            res.render('pages/errorLoggedIn', {user: req.user});
        } else {
            res.render('pages/error');
        }
    });

// Login page
router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        const messages = req.flash('error');
        res.render('pages/login', {messages: messages});
    }
});

// Sign up page
router.get('/signup', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('pages/signup');
    }
});

// MI dashboard
router.get('/dashboard', security.isAuthenticated, function (req, res) {
    res.render('pages/dashboards/dashboard', {user: req.user});
});

// Not yet used
router.get('/mindmap/project/:project', security.isAuthenticated, function (req, res) {
    check('project', 'Invalid project name').isAlpha();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error("Error : ", errors);
        res.redirect('/error');
        return;
    }

    const pid = req.params.project;
    technology.getAllForProject(pid)
        .then( result=> {
            res.render('pages/dashboards/mindmap', {user: req.user, data: result})
        })
        .catch(error=> {
            logger.error("Error : ", errors);
            res.redirect('/error');
        })
});

// POST for login credentials
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


// Azure AD Login
router.get('/loginAzureAD',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    }
);

// Azure AD return URL
router.post('/auth/openid/return',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    }
);

// Logout
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        req.logOut();
        res.redirect('/login');
    });
});

// GET /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/openid/return',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    }
);

module.exports = router;
