#!/bin/env node
/**
 * Tech-radar Application
 */

// Load in the environment variables
require('dotenv').config({path: 'process.env'});

// Setup the console logging format
require('console-stamp')(console, '[ddd mmm dd HH:MM:ss]]');

// Logger setup
const logger = require('./winstonLogger')(module);

// Express
const database = require('./utils/dbConnection');
const express = require('express');
const helmet = require('helmet');
const express_enforces_ssl = require('express-enforces-ssl');
const helpers = require('express-helpers')();
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const bodyParser = require('body-parser');

// Caching to remove some frequent db operations
const cache = require('./dao/cache.js');

// Authentication
const users = require('./dao/users');
const passport = require('passport');
require('./utils/passport.js');


// Load the routes for the web Application and API REST services
const routes = require('./routes/web/routes.js');
const technologyRoutes = require('./routes/web/technology-routes');
const stackRoutes = require('./routes/web/stack-routes');
const categoryRoutes = require('./routes/web/category-routes');
const projectRoutes = require('./routes/web/project-routes');
const userRoutes = require('./routes/web/user-routes');
const commentRoutes = require('./routes/web/comment-routes');

// Load the API routes
const apiStack = require('./routes/api/api-stacks-routes.js');
const apiTechnologies = require('./routes/api/api-technology-routes.js');
const apiSoftwareVersions = require('./routes/api/api-software-versions-routes.js');
const apiUsers = require('./routes/api/api-users-routes.js');
const apiComments = require('./routes/api/api-comments-routes.js');
const apiProjects = require('./routes/api/api-projects-routes.js');
const apiCategories = require('./routes/api/api-categories-routes.js');
const apiDashboard = require('./routes/api/api-dashboard-routes.js');
const apiTags = require('./routes/api/api-tags-routes.js');


/**
 *  Define the application.
 */
const TechRadar = function () {

    //  Scope.
    const self = this;
    
    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.port = process.env.PORT || 8090;
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating Tech Radar ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        logger.info('Server stopped');
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        self.app = express();
        self.app.set('view engine', 'ejs');

        // Define helper functions
        self.app.locals.link_to = helpers.link_to;

        /*
        * Uses 7 out of 10 helmet middleware functions,
        * leaving out contentSecurityPolicy, hpkp, and noCache
        */
        self.app.use(helmet()); 

        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({
            extended: true
        }));

        self.app.use(flash());

        self.app.use(function(err, req, res, next) {
            logger.error('Fatal Error: %s', err.stack);
            res.status(500).send('A Fatal error has occurred');
        });

        // Setup the secret cookie key
        const cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
        const sess = {
            store: new pgSession({
                pool: database.getPool()
            }),
            resave: false,
            saveUninitialized: false,
            cookie: {},
            secret: cookie_key
        };
 
        if (self.app.get('env')  === 'production') {
            self.app.enable('trust proxy', 1); // trusts first proxy - Heroku load balancer
            logger.info('In production mode');
            self.app.use(express_enforces_ssl());
            sess.cookie.secure = true;
        }
 
        self.app.use(expressSession(sess));

        /**
         * Apply standard Content Security Policy headers to all responses
         */
        self.app.use(function (req, res, next) {
            res.setHeader(
                'Content-Security-Policy',
                "default-src *; img-src 'self' data: http://* https://* ; style-src 'self' http://* https://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
            );
            next();
        });

        // Setup the Google Analytics ID if defined
        self.app.locals.google_id = process.env.GOOGLE_ID || undefined;

        logger.info('GA ID: %s', self.app.locals.google_id);
        logger.info('Cookie key: %s', cookie_key);
        
        // Browser Cache
        const oneDay = 86400000;
        self.app.use('/', express.static('public', {maxAge: oneDay}));
        self.app.use('/shared', express.static('shared', {maxAge: oneDay}));

        // Initialize Passport and restore authentication state, if any, from the
        // session.
        self.app.use(passport.initialize());
        self.app.use(passport.session());
        
        
        // update the cache of static information from the DB
        cache.refresh(self.app);

        // Define the web routes
        self.app.use('/', routes);
        self.app.use('/technology', technologyRoutes);
        self.app.use('/category', categoryRoutes);
        self.app.use('/comments', commentRoutes);
        self.app.use('/projects', projectRoutes);
        self.app.use('/stacks', stackRoutes);
        self.app.use('/users',userRoutes);


        // // API routes
        apiStack.createRoutes(self);
        apiTechnologies.createRoutes(self);
        apiSoftwareVersions.createRoutes(self);
        apiUsers.createRoutes(self);
        apiComments.createRoutes(self);
        apiProjects.createRoutes(self);
        apiCategories.createRoutes(self);
        apiDashboard.createRoutes(self);
        apiTags.createRoutes(self);
    };

    /**
     *  Start the server
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, function () {
            logger.info('Server started on port %d', self.port);
        });
    };
};



/**
 *  main():  Main code.
 */
const radarApp = new TechRadar();
radarApp.initialize();
radarApp.start();