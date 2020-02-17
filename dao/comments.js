'use strict';

const database = require('../utils/dbConnection.js');

const DEFAULT_PAGE_SIZE = 10;

/**
 * Database routines for 'Comments'
 */
const Comments = function () {
};

Comments.getById = function(commentId) {
    const sql = `SELECT * FROM comments WHERE id=$1`;

    return database.query( sql, [commentId])
        .then( results => {
            if (results.length !== 1) {
                return null;
            } else {
                return results[0];
            }
        });
};

/**
 * Update a comment
 * @param commentId ID of the comment that will be modified 
 * @param text Comment text to add
 * @param software_version_id ID of the version of technology related to this comment
 */
Comments.update = function (commentId, text, software_version_id) {
    const params = [commentId, text];
    let versionColumn = "";

    // add the optional software_version_id param if it's not empty
    if(software_version_id != null && software_version_id.length > 0) {
        versionColumn = ", software_version_id=$3";
        params.push(software_version_id);
    }

    const sql = `UPDATE comments SET text=$2 ${versionColumn} WHERE id=$1`;

    return database.insertOrUpdate( sql,params);
};

/**
 * Get a pge of comments for the given technology
 *
 * @param technology ID of the technology to get comments for
 * @param pageNum Page number
 * @param pageSize Max amount of comments to be returned
 */
Comments.getForTechnology = function (technology, pageNum, pageSize) {
    const sql = `SELECT comments.*, users.displayName, 
        users.username, users.avatar, software_versions.name AS version
        FROM comments 
        LEFT OUTER JOIN software_versions ON comments.software_version_id=software_versions.id
        INNER JOIN users ON comments.userid=users.id
        WHERE comments.technology=$1
        ORDER BY date DESC
        LIMIT $2 OFFSET $3`;

    const limit = pageSize || DEFAULT_PAGE_SIZE;
    const offset = pageNum ? pageNum * limit : 0;

    return database.query( sql, [technology, limit, offset]);
};

/**
 * Get comment count for the given technology
 *
 * @param technologyId ID of the technology to get comment count for
 */
Comments.getCountForTechnology = function (technologyId) {
    const sql = "SELECT count(*) FROM comments where technology=$1";

    return database.query( sql, [technologyId])
        .then (results=>{
            return results[0];
        });
};

/**
 * Get the number of comments for each technology
 */
Comments.getTotalNumberCommentsForTechnologies = function () {
    const sql = `select count(*) total, t.name technology, s.id AS status_id
        FROM comments c
        JOIN technologies t on c.technology=t.id 
        -- status_id is used by dashboard graphs
        LEFT OUTER JOIN status s on s.id =
            COALESCE( (select statusid from tech_status_link 
                WHERE technologyid=t.id
                ORDER BY date DESC LIMIT 1),0)
        GROUP BY t.name, s.id 
        ORDER BY total DESC limit 10`;

    return database.query(sql, []);
};


/**
 * Add a new comment
 * @param technology Technology ID that the comment should be added to
 * @param text Comment text to add
 * @param userId User ID adding the comment
 * @param software_version_id ID of the version of technology related to this comment
 * @param software_version_id ID of the version of technology related to this comment
 */
Comments.add = function (technology, text, userId, software_version_id) {
    const params = [technology, text, userId];
    let versionColumn = "";
    let versionParam = "";

    // add the optional software_version_id param if it's not empty
    if(software_version_id != null && software_version_id.length > 0) {
        versionColumn = ", software_version_id";
        versionParam = ", $4";
        params.push(software_version_id);
    }

    const sql = `INSERT INTO comments ( technology , text , userid ${versionColumn}  ) 
                 VALUES ( $1 , $2 , $3 ${versionParam} ) RETURNING id`;

    return database.insertOrUpdate( sql, params)
        .then( result=>{
            return result.rows[0].id;
        });
};

/**
 * Delete a set of comments using their ID numbers
 * @param ids
 */
Comments.delete = function (ids) {
    return database.deleteByIds( "comments", ids);
};

module.exports = Comments;