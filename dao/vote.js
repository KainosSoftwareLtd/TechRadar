'use strict';

const database = require('../utils/dbConnection.js');

const Vote = function () {
};

/**
 * Get all the votes for a technology
 * @param techId ID of the technology
 * @param limit Maximum number of results to return (null==all)
 */
Vote.getVotesForTechnology = function (techId, limit=null) {
    let sql = `SELECT to_char(v.date, 'DD/MM/YY') as date,t.name as technology,s.name as status, u.username 
        FROM votes v
        INNER JOIN technologies t on v.technology=t.id 
        INNER JOIN status s on v.status=s.id 
        INNER JOIN users u on v.userid=u.id 
        WHERE v.technology=$1
        ORDER BY v.date desc limit $2`;

    const params = [techId, limit];
    return database.query( sql, params);
};

/**
 * Get a count of votes in the last month for each technology where the vots is different to the current status
 */
Vote.getVotesInLastMonthDifferentFromStatus = function () {
    const  sql = `SELECT t.name as name, v.status AS status_id, count(t.id) as total 
        FROM votes v
        JOIN technologies t on v.technology=t.id
        LEFT JOIN tech_status_link tsl on v.technology=tsl.technologyid 
        WHERE (
            (tsl.date = (select max(date) from tech_status_link tsl2 where tsl.technologyid=tsl2.technologyid)
        AND v.status!=coalesce(tsl.statusid,0) )
        OR tsl.technologyid IS NULL )
        AND ( v.date between (now()-INTERVAL '3 MONTH') and now() )
        GROUP BY t.id, t.name, v.status`;

    return database.query(sql,[]);
};

/**
 * Get the number of votes for each status for each technology
 * @param techId ID of technology
 */
Vote.getTotalVotesForTechnologyStatus = function (techId) {
    const sql = `SELECT technologies.name as Technology, status.name as status, COUNT(status.name) AS count 
        FROM votes 
        INNER JOIN technologies on technologies.id=votes.technology 
        INNER JOIN status on status.id=votes.status 
        GROUP BY technologies.name,votes.technology, status.name 
        HAVING votes.technology=$1 
        ORDER BY technologies.name, count desc`;

    return database.query( sql, [techId]);
};


/**
 * Get the number of votes for all technologies.  This is used by the dashboard
 */
Vote.getVotesForAllTechnologies = function () {
    const sql = `SELECT count(v.id), s.name as status, t.name as technology
        FROM votes v
        LEFT JOIN technologies t on t.id=v.technology
        LEFT JOIN status s on s.id=v.status
        GROUP BY t.id, s.id
        ORDER BY t.name,s.name`;

    return database.query(sql,[]);
};

/**
 * Get the number of votes for all technologies.  This is used by the dashboard
 */
Vote.getVotesPerUserCount = function () {
    const sql = `SELECT u.username username, count(v.id) total 
        FROM votes v 
        JOIN users u ON v.userid=u.id
        GROUP BY username 
        ORDER BY total desc limit 10`;

    return database.query(sql,[]);
};

/**
 * Add a vote for a technology
 * PostgreSQL doesn't have an upsert until 9.5 so do a delete then insert for now
 * @param technology ID of technology
 * @param status ID of status
 * @param userId ID if the user voting
 */
Vote.add = function (technology, status, userId) {
    const params = [technology,status, userId];
    const sql = `INSERT INTO votes ( technology, status, userid ) values ($1, $2, $3)
                    ON CONFLICT("technology", "userid") DO UPDATE 
                    SET technology=$1,status=$2 RETURNING id`;

    return database.insertOrUpdate(sql, params)
        .then( result => {
            return result.rows[0].id
        })
};

module.exports = Vote;