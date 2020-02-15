const pg = require('pg');
const dbhelper = require('../utils/dbhelper.js');

const Tag = function () {
};

/**
 * Add a new tag
 * @param name Tag's name
 * @param done Function to call when stored
 * @returns ID of the row created
 */
Tag.add = function (name, done) {
    const sql = "INSERT INTO tags (name) values ($1) returning id";

    dbhelper.insert(sql, [name],
        function (result) {
            done(result.rows[0].id);
        },
        function (error) {
            console.log(error);
            done(null, error);
        });
};

/**
 * Update a tag
 * @param tagId Tag's ID
 * @param name Tag's name
 * @param done Function to call when stored
 * @returns ID of the row created
 */
Tag.update = function (tagId, name, done) {
    const params = [tagId, name];
    const sql = "UPDATE tags SET name=$2 WHERE id=$1"; 

    dbhelper.insert(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.log(error);
            done(null, error);
        });
};

/**
 * Delete all links of tags with a project
 * @param {Number} projectId ID of the project from which the tags will be detached
 * @param done
 */
Tag.detachAllFromProject = function (projectId, done) {
    const sql = "DELETE FROM tag_project_link WHERE projectid=$1";

    dbhelper.query(sql, [projectId],
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(null, error);
        });
};

/**
 * Attach a set of tags to a project
 * @param {Number} projectId ID of the project to which the tags will be attached
 * @param {Number[]} tagIds IDs of tag-project links
 * @param done
 */
Tag.attachToProject = function (projectId, tagIds, done) {
    let sql = `INSERT INTO tag_project_link(tagid, projectid) VALUES`;

    const params = [projectId];
    params.push.apply(params, tagIds);

    const placeholderPairs = tagIds.map(function(tagId, index) {
        // gives us (tagId, projectId) placeholders to insert after the VALUES statement
        return "($" + (index + 2) + ", $1)"; // tagId placeholders start from $2
    });

    sql += " " + placeholderPairs.join();

    dbhelper.query(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(null, error);
        });
};

/**
 * Delete a set of tags using their ID numbers
 * @param ids
 * @param done
 */
Tag.delete = function (ids, done) {

    const params = [];
    for (const i = 1; i <= ids.length; i++) {
        params.push('$' + i);
    }

    const sql = "DELETE FROM tags WHERE id IN (" + params.join(',') + "  )";

    dbhelper.query(sql, ids,
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(null, error);
        });
};

/**
 * Get all tags
 * @param done Function to call with the results
 */
Tag.getAll = function (done) {
    dbhelper.getAllFromTable("tags", done);
};

/**
 * Get all tags for a project
 * @param {Number} projectId ID of the project
 * @param done Function to call with the results
 */
Tag.getAllForProject = function (projectId, done) {
    const sql = `SELECT * FROM tag_project_link tpl
        INNER JOIN tags t ON t.id=tpl.tagid 
        WHERE projectid=$1`;

    dbhelper.query(sql, [projectId],
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null, error);
    });
};

/**
 * Get tag by its ID
 * @param {Number} tagId ID of the tag
 * @param done Function to call with the results
 */
Tag.getById = function (tagId, done) {
    const sql = `SELECT * FROM tags WHERE id=$1;`;

    dbhelper.query(sql, [tagId],
        function (results) {
            done(results[0]);
        },
        function (error) {
            console.error(error);
            done(null, error);
    });
};

/**
 * Get all tags and indicate which tags belong to the project
 * @param {Number} projectId ID of the project
 * @param done Function to call with the results
 */
Tag.getAllWithOptionalProjectId = function (projectId, done) {
    // If a tag doesn't belong to the project, the projectid field is empty
    const sql = `SELECT t.*, tpl.projectid, tpl.id AS linkid FROM tags t
        LEFT JOIN tag_project_link tpl ON tpl.tagid=t.id AND tpl.projectid=$1
        ORDER BY projectid, name`;

    dbhelper.query(sql, [projectId],
        function (results) {
            done(results);
        },
        function (error) {
            console.error(error);
            done(null, error);
    });
};

/**
 * Attaches selected tags to a project, detaches all other tags.
 * @param {Number} projectId ID of the project to which the tags will be reassigned
 */
Tag.reassignToProject = function (projectId, tagIds, done) {
    Tag.detachAllFromProject(projectId, function(results) {
        if(tagIds.length > 0) {
            Tag.attachToProject(projectId, tagIds, done);
        } else {
            done(results, null);
        }
    });
};

module.exports = Tag;
