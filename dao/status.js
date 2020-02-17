'use strict';

const database = require('../utils/dbConnection.js');

const Status = function () {
};

/**
 * Get all the Status values
 */
Status.getAll = function () {
    const sql = "SELECT * FROM status ORDER BY id ASC";
    return database.query( sql, []);
};

/**
 * Get the history of status changes for the specified technology
 * @param technologyId ID of the technology to get history for
 * @param limit The maximum number of results to return (or null for all)
 */
Status.getHistoryForTechnology = function( technologyId , limit=null)
{
    const sql = `SELECT s.name, tsl.reason as reason , u.username, to_char(tsl.date, 'DD/MM/YY') as date  
        FROM tech_status_link tsl
        JOIN STATUS s on tsl.statusid=s.id 
        JOIN users u on u.id=tsl.userid
        WHERE tsl.technologyid=$1
        ORDER BY tsl.date DESC
        LIMIT $2`;

    const params = [technologyId,limit];
    return database.query( sql, params);
};

module.exports = Status;