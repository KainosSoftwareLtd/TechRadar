'use strict';

const logger = require('../winstonLogger')(module);
const Url = require('url');
const pg = require('pg');

/**
 * Standard database operations and management
 */
class DBConnection {

    constructor () {
        pg.defaults.poolSize = 20;

        const config = DBConnection.getConnectionConfig();

        logger.info('creating db pool');
        try {
            this._pool = new pg.Pool(config);
        } catch ( ex) {
            logger.info("Error creating DB pool");
        }

        this._pool.on('error', function (err, client) {
            logger.error("Database Pool Error : %s", err);
        });
    }

    /**
     * Return the DB Pool for other modules to use
     * This is primarily for the express session to share
     * @returns {Pool}
     */
    getPool() {
        return this._pool;
    }

    /**
     * Perform a select query operation
     * @param sql Statement to perform
     * @param parameters Parameters for the query
     */
    query (sql, parameters) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._pool.query(sql, parameters, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.rows);
                }
            });
        });
    };

    /**
     * Perform a number of SQL queries in a single DB transaction
     * @param sqlArray
     * @param parameterArray
     * @returns {Promise<[]>}
     */
    async queryInTransaction (sqlArray, parameterArray) {
        const client = await this._pool.connect();

        let results = [];
        try {
            await client.query('BEGIN')

            let result = undefined;
            for (let index in sqlArray) {
                logger.info("executing : %s %s", sqlArray[ index ], parameterArray[ index ]);

                let parameters = parameterArray[ index ];
                if (typeof parameters === "function") {
                    parameters = parameters(result.rows);
                }

                result = await client.query(sqlArray[ index ], parameters);

                results.push(result);
            }

            await client.query('COMMIT')
        } catch (e) {
            logger.error("Execption caught ROlling back");
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release();
        }
        return results;
    };

    /**
     * Perform an insertOrUpdate operation on the database
     * @param sql Statement to perform
     * @param parameters Parameters for the query
     */
    insertOrUpdate (sql, parameters) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._pool.query(sql, parameters, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Wrapper around delete function to delete by a set of ids
     * @param tableName
     * @param ids array of IDS to delete
     * @param done function to call on completion
     */
    deleteByIds (tableName, ids ) {

        let params = [];
        let sql=undefined;

        if( ids.length>1) {
            for (let i = 1; i <= ids.length; i++) {
                params.push('$' + i);
            }

            sql = "DELETE FROM " + tableName + " WHERE id IN (" + params.join(',') + "  )";

        } else {
            sql = "DELETE FROM " + tableName + " WHERE id=$1";
        }

        return this.query(sql, ids);
    };

    /**
     * Shortcut to perform a SELECT * FROM {table}
     * @param tableName Name of the table
     * @param order column to order the results on
     * @returns {Promise<unknown>}
     */
    getAllFromTable (tableName, order) {
        let sql = "SELECT * FROM " + tableName;
        let params = [];

        if (order !== null) {
            sql = sql + " ORDER BY $1";
            params.push(order);
        }

        return this.query(sql, params);
    };

    /**
     * Environments like Heroku provide a connection string, I have found this can cause problems
     * when trying to enforce SSL.  So I decode it if it exists and create a manual configuration
     * object otherwise assume that the individual environment variables are defined.
     *
     * Note : A DATABASE_URL will override individual env variables
     */
    static getConnectionConfig () {
        let connectionStr = process.env.DATABASE_URL;

        if (undefined === connectionStr) {
            logger.log("warn", "DATABASE_URL NOT found - Using individual env variables");
            let config = {
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                database: process.env.PGDATABASE
            };

            if( process.env.SSLMODE != 'false') {
                config.ssl = { require: true, rejectUnauthorized: false };
            }

            return config;
        } else {
            logger.info("DATABASE_URL found")

            const { parse } = require('pg-connection-string');


            let config = parse(connectionStr)
            if( process.env.SSLMODE != 'false') {
                config.ssl = { require: true, rejectUnauthorized: false };
            }

            return config;
        }
    }

    static isInt (value) {
        return !isNaN(value) &&
            parseInt(Number(value)) == value &&
            !isNaN(parseInt(value, 10));
    };

}

const instance = new DBConnection();
Object.freeze(instance);

module.exports = instance;