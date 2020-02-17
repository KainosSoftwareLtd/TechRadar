'use strict';

const database = require('../utils/dbConnection.js');

const Projects = function () {
};

/**
 * Get all the projects with their tags
 */
Projects.getAll = function () {
    const sql = `SELECT p.*, string_agg(t.id::character varying, ', ') AS tags
                 FROM projects AS p
                          LEFT OUTER JOIN tag_project_link tpl ON tpl.projectid = p.id
                          LEFT OUTER JOIN tags t ON tpl.tagid = t.id
                 GROUP BY p.id,p.name
                 ORDER BY p.name ASC`;

    return database.query(sql, null);
};

/**
 * Get a project by ID
 * @param id ID of the project to get
 */
Projects.findById = function (id) {
    const sql = "SELECT *" +
        " FROM projects " +
        " where projects.id=$1 ";

    return database.query(sql, [id])
        .then(results => {
            if (results.length === 0) {
                throw new Error("No project found");
            } else {
                return results[0];
            }
        })
};

/**
 * Get a project by it's name
 * @param name Name of the project to get
 */
Projects.findByName = function (name) {
    const sql = `SELECT *
                 FROM projects
                 WHERE lower(projects.name) = lower($1)`;

    return database.query(sql, [name])
        .then(results => {
            if (results.length === 0) {
                throw new Error("No project found");
            } else {
                return results[0];
            }
        });
};

/**
 * Add multiple technologies to a project
 *
 * @param projectId Project ID
 * @param technologyIds Array of Technology IDs
 * @param softwareVersionIds Array of Version IDs - its indexes(placement) should correspond to those in technologyIds
 */
Projects.addTechnologies = function (projectId, technologyIds, softwareVersionIds) {
    let sql = "INSERT INTO technology_project_link (technologyid, projectid, software_version_id) VALUES ";

    const numRows = technologyIds.length;
    for (let i = 0; i < numRows; i++) {
        const optionalVersionId = getOptionalVersionId(softwareVersionIds[i]);
        sql += " ( $" + (i + 1) + "," + projectId + optionalVersionId + ")";
        if (i != numRows - 1) {
            sql += ",";
        }
    }

    return database.insertOrUpdate(sql, technologyIds);
};

/**
 * Delete a set of technologies using their ID numbers
 * @param ids
 */
Projects.removeTechnologiesFromProject = function (ids) {
    return database.deleteByIds("technology_project_link", ids);
};

/**
 * Changes the version assigned to a technology used in a project
 * @param versionId corresponds to the software_version_id column
 * @param linkId id of a technology_project_link record
 */
Projects.updateTechnologyVersion = function (versionId, linkId) {

    const params = [versionId, linkId];
    const sql = `UPDATE technology_project_link
                 SET software_version_id =
                         COALESCE(
                                 (SELECT $1::integer
                                  WHERE NOT EXISTS(SELECT 1
                                                   FROM technology_project_link
                                                   WHERE software_version_id = $1
                                                     AND projectid =
                                                       -- look for duplicates only in the same project
                                                         (SELECT projectid FROM technology_project_link WHERE id = $2))),
                             -- use the original value if the nested SELECT finds a duplicate 
                                 software_version_id)
                 WHERE id = $2`;

    return database.insertOrUpdate(sql, params);
};

/**
 * Add a new project
 * @param name Name of the project to add
 * @param description Description of the project
 */
Projects.add = function (name, description) {
    const sql = "INSERT INTO projects ( name, description ) values ( $1 , $2 ) returning id";

    return database.insertOrUpdate(sql, [name, description])
        .then(result => {
            return result.rows[0].id;
        });
};

/**
 * Delete a set of projects using their ID numbers
 */
Projects.delete = function (ids) {
    return database.deleteByIds("projects", ids);
};

/**
 * Update project data
 */
Projects.update = function (id, name, description) {
    const sql = "UPDATE projects SET name=$1, description=$2 where id=$3";
    return database.insertOrUpdate(sql, [name, description, id]);
};

/**
 * Get all projects linked to a given technology
 *
 * @technologyId ID of the technology to get the projects for
 */
Projects.getAllForTechnology = function (technologyId) {
    const sql =
            `SELECT DISTINCT p.*
             from projects p
                      INNER JOIN technology_project_link tpl on p.id = tpl.projectid
             where tpl.technologyid = $1
             ORDER BY p.name ASC`;

    return database.query(sql, [technologyId]);
};

/**
 * Get all projects linked to a given tag
 *
 * @tagId ID of the tag to get the projects for
 */
Projects.getAllForTag = function (tagId) {
    const sql =
        `WITH projects_containing_tag AS (
            SELECT p.* FROM projects p
            INNER JOIN tag_project_link tpl  
            ON tpl.tagid=$1 AND tpl.projectid=p.id	
        )
        SELECT pct.*, string_agg(t.id::character varying, ', ') AS tags 
        FROM projects_containing_tag AS pct
        INNER JOIN tag_project_link tpl ON tpl.projectid=pct.id
        INNER JOIN tags t ON tpl.tagid=t.id
        GROUP BY pct.id, pct.name, pct.description;`;

    return database.query(sql, [tagId]);
};

/**
 * Get all of the technologies used by each project
 */
Projects.getTechForProject = function (id) {
    const sql =
            `SELECT p.name as project, t.name as technology
             FROM technology_project_link tpl
                      JOIN projects p on tpl.projectid = p.id
                      JOIN technologies t on tpl.technologyid = t.id
             WHERE p.id = $1;`;

    return database.query(sql, [id]);
};

/**
 * Checks whether versionId can be used in an SQL query,
 * if not - replaces the value with a null
 * @param {string} versionId - value that will be verified
 * @returns ", null" or ", {integer}"
 */
function getOptionalVersionId(versionId) {
    let optionalVersionId = ", null";
    if (isInt(versionId)) {
        optionalVersionId = "," + versionId;
    }
    return optionalVersionId;
}

function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) === value &&
        !isNaN(parseInt(value, 10));
}

module.exports = Projects;
