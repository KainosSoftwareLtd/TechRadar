/**
 * Migration runner, which loads process.env.prod vars via dotenv before running the migrations
 */
require('dotenv').config({path: 'process.env', silent: true});
const DBMigrate = require('db-migrate');

const migrateInstance = DBMigrate.getInstance();
migrateInstance.run();