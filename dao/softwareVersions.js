'use strict';

const database = require('../utils/dbConnection.js');

const SoftwareVersions = function () {
};

/**
 * Get all versions that belong to a technology
 */
SoftwareVersions.getAllForTechnology = function (technology) {
    const sql = `SELECT sv.id, sv.name, sv.technology, COUNT(tpl.projectid) AS projects_count
                 from software_versions AS sv
                          LEFT OUTER JOIN technology_project_link tpl ON tpl.software_version_id = sv.id
                 WHERE sv.technology = $1
                 GROUP BY sv.id, sv.name, sv.technology`;

    return database.query(sql, [technology]);
};

/**
 * Add a new version that's assigned to a single technology
 */
SoftwareVersions.add = function (technology, name) {
    const sql = `INSERT INTO software_versions(technology, name)
                 VALUES ($1, $2)
                 RETURNING id`;

    return database.insertOrUpdate(sql, [technology, name]);
};

/**
 * Update a version
 * @param version ID of the version to update
 * @param name New name for this version
 */
SoftwareVersions.update = function (version, name) {
    const sql = `UPDATE software_versions
                 SET name=
                         COALESCE(
                                 (SELECT $2::varchar WHERE NOT EXISTS(SELECT 1 FROM software_versions WHERE name = $2)),
                             -- use the original name if the new name is a duplicate
                                 name)
                 WHERE id = $1`;

    return database.insertOrUpdate( sql, [version,name]);
};

/**
 * Remove a set of versions using their ID numbers
 * @param versions An array of version IDs
 */
SoftwareVersions.delete = function (versions) {
    return database.deleteByIds("software_versions", versions);
};

module.exports = SoftwareVersions;