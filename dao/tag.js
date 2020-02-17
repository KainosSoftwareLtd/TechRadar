'use strict';

const database = require('../utils/dbConnection.js');

const Tag = function () {
};

/**
 * Add a new tag
 * @param name Tag's name
 * @returns Promise containing ID of the row created
 */
Tag.add = function (name) {
    const sql = "INSERT INTO tags (name) values ($1) returning id";

    return database.insertOrUpdate(sql, [name])
        .then(result => {
            return result.rows[0].id;
        });
};

/**
 * Update a tag
 * @param tagId Tag's ID
 * @param name Tag's name
 * @returns Promise containing ID of the row created
 */
Tag.update = function (tagId, name) {
    const params = [tagId, name];
    const sql = "UPDATE tags SET name=$2 WHERE id=$1";

    return database.insertOrUpdate(sql, params);
};

/**
 * Delete all links of tags with a project
 * @param {Number} projectId ID of the project from which the tags will be detached
 */
Tag.detachAllFromProject = function (projectId) {
    const sql = "DELETE FROM tag_project_link WHERE projectid=$1";

    return database.query(sql, [projectId]);
};

/**
 * Attach a set of tags to a project
 * @param {Number} projectId ID of the project to which the tags will be attached
 * @param {Number[]} tagIds IDs of tag-project links
 */
Tag.attachToProject = function (projectId, tagIds) {
    let sql = `INSERT INTO tag_project_link(tagid, projectid)
               VALUES`;

    const params = [projectId];
    params.push.apply(params, tagIds);

    const placeholderPairs = tagIds.map(function (tagId, index) {
        // gives us (tagId, projectId) placeholders to insert after the VALUES statement
        return "($" + (index + 2) + ", $1)"; // tagId placeholders start from $2
    });

    sql += " " + placeholderPairs.join();

    return database.insertOrUpdate(sql, params);
};

/**
 * Delete a set of tags using their ID numbers
 * @param ids
 */
Tag.delete = function (ids) {
    return database.deleteByIds("tags", ids);
};

/**
 * Get all tags
 */
Tag.getAll = function (done) {
    return database.getAllFromTable("tags");
};

/**
 * Get all tags for a project
 * @param {Number} projectId ID of the project
 */
Tag.getAllForProject = function (projectId) {
    const sql = `SELECT *
                 FROM tag_project_link tpl
                          INNER JOIN tags t ON t.id = tpl.tagid
                 WHERE projectid = $1`;

    return database.query(sql, [projectId]);
};

/**
 * Get tag by its ID
 * @param {Number} tagId ID of the tag
 */
Tag.getById = function (tagId) {
    const sql = `SELECT *
                 FROM tags
                 WHERE id = $1;`;

    return database.query(sql, [tagId])
        .then(results => {
            return results[0];
        });
};

/**
 * Get all tags and indicate which tags belong to the project
 * @param {Number} projectId ID of the project
 */
Tag.getAllWithOptionalProjectId = function (projectId) {
    // If a tag doesn't belong to the project, the projectId field is empty
    const sql = `SELECT t.*, tpl.projectid, tpl.id AS linkid
                 FROM tags t
                          LEFT JOIN tag_project_link tpl ON tpl.tagid = t.id AND tpl.projectid = $1
                 ORDER BY projectid, name`;

    return database.query( sql, [projectId]);
};

/**
 * Attaches selected tags to a project, detaches all other tags.
 * @param {Number} projectId ID of the project to which the tags will be reassigned
 */
Tag.reassignToProject = function (projectId, tagIds) {

    return Tag.detachAllFromProject(projectId)
        .then(results => {
            if (tagIds.length > 0) {
                return Tag.attachToProject(projectId, tagIds);
            } else {
                return results;
            }
        })
};

module.exports = Tag;
