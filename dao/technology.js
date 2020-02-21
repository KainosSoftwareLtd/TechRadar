'use strict';

const database = require('../utils/dbConnection.js');


const Technology = function () {
};

/**
 * Add a new technology
 * @param name Name of the technology
 * @param website Website for the technology
 * @param category Category ID for the technology
 * @param description Textual description of the technology
 * @param licence Type of licence
 * @param licenceLink Link to more licence info
 * @returns Promise with ID of the row created
 */
Technology.add = function (name, website, category, description, licence, licenceLink) {
    const sql = `INSERT INTO technologies (name, website, category, description, licence, licencelink)
                 values ($1, $2, $3, $4, $5, $6)
                 returning id`;
    const params = [name, website, category, description, licence, licenceLink];

    return database.insertOrUpdate(sql, params)
        .then(results => {
            return results.rows[0].id;
        })
};

/**
 * Add a new technology
 * @param id ID of the technology
 * @param name Name of the technology
 * @param website Website for the technology
 * @param category Category ID for the technology
 * @param description Textual description of the technology
 * @param licence Type of licence
 * @param licenceLink Link to more licence info
 * @returns Promise
 */
Technology.update = function (id, name, website, category, description, licence, licenceLink) {
    const sql = `UPDATE technologies
                 SET name=$1,
                     website=$2,
                     category=$3,
                     description=$4,
                     licence=$6,
                     licencelink=$7
                 WHERE id = $5`;
    const params = [name, website, category, description, id, licence, licenceLink];

    return database.insertOrUpdate(sql, params);
};

/**
 * Delete a set of technologies using their ID numbers
 * @param ids
 */
Technology.delete = function (ids) {
    return database.deleteByIds("technologies", ids);
};

/**
 * Update the status for a technology
 * @param technology Technology ID
 * @param status Status ID
 * @param reason Reason for the change
 * @param userId UserID making the change
 */
Technology.updateStatus = function (technology, status, reason, userId) {
    const sql = `INSERT INTO tech_status_link (technologyid, statusid, userid, reason)
                 VALUES ($1, $2, $3, $4)
                 returning id`;
    const params = [technology, status, userId, reason];

    return database.insertOrUpdate(sql, params)
        .then(results => {
            return results.rows[0].id;
        });
};

/**
 * Get a specific technology using its ID
 * @param userId id of the user performing the query
 * @param id ID of the technology
 */
Technology.getById = function (userId, id) {
    const sql = `SELECT t.*,
                        s.name         as statusName,
                        s.id           as status,
                        c.name         as categoryName,
                        COALESCE(
                                (select s2.name
                                 from votes v
                                          JOIN STATUS s2 on s2.id = v.status
                                 WHERE userid = $1
                                   AND technology = t.id
                                 order by date desc
                                 limit 1),
                                'TBD') as vote
                 FROM technologies t
                          INNER JOIN categories c on t.category = c.id
                          LEFT OUTER JOIN status s on s.id =
                                                      COALESCE((select statusid
                                                                from tech_status_link
                                                                where technologyid = t.id
                                                                order by date desc
                                                                limit 1), 0)
                 WHERE t.id = $2`;

    const params = [userId, id];

    return database.query(sql, params)
        .then(results => {
            if (results.length !== 1) {
                throw new Error("Failed to find technology for id ${id}");
            } else {
                return results[0];
            }
        });
};

/**
 * Get all technologies
 */
Technology.getAll = function (userId) {
    const sql = `SELECT t.id,
                        t.name          as name,
                        t.website       as website,
                        t.description,
                        t.licence,
                        t.licencelink,
                        s.name          as status,
                        c.name          as category,
                        COALESCE((select s2.name
                                  from votes v
                                           join status s2 on s2.id = v.status
                                  where userid = $1
                                    and technology = t.id
                                  order by date desc
                                  limit 1),
                                 'TBD') as vote
                 FROM technologies t
                          INNER JOIN categories c on t.category = c.id
                          LEFT OUTER JOIN status s on s.id =
                                                      COALESCE((select statusid
                                                                from tech_status_link
                                                                where technologyid = t.id
                                                                order by date desc
                                                                limit 1), 0)`;


    return database.query(sql, [userId]);
};

/**
 * Selects technologies with names, category IDs, status IDs and the number of users
 * @param {integer} [limit=40] Maximum number of records to return (max: 40)
 */
Technology.getTechnologiesWithUserCounts = function (limit) {
    if (!(limit > 0) && !(limit < 40)) {
        limit = 40;
    }
    const params = [limit];
    const sql = `
        SELECT t.name, t.category, s.id AS status_id, COUNT(used.*) count
        FROM technologies AS t
                 INNER JOIN used_this_technology used
                            ON used.technology = t.id
                 LEFT OUTER JOIN status s on s.id =
                                             COALESCE((select statusid
                                                       from tech_status_link
                                                       WHERE technologyid = t.id
                                                       ORDER BY date DESC
                                                       LIMIT 1), 0)
        GROUP BY t.id, s.id
        ORDER BY count DESC
        LIMIT $1`;

    return database.query(sql, params);
};

/**
 * Get all of the technologies in a category
 * @param cname Name of the category
 */
Technology.getAllForCategory = function (cname) {

    const sql =
            `SELECT row_number() over (order by s) as num,
                    t.id,
                    t.name                         as name,
                    t.website                      as website,
                    t.description,
                    t.licence,
                    t.licencelink,
                    s.name                         as status,
                    c.name                         as category
             FROM technologies t
                      INNER JOIN categories c on t.category = c.id
                      LEFT OUTER JOIN status s on s.id =
                                                  COALESCE((select statusid
                                                            from tech_status_link
                                                            where technologyid = t.id
                                                            order by date desc
                                                            limit 1), 0)
             WHERE LOWER(c.name) = $1
             ORDER BY status, t.name ASC`;

    return database.query(sql, [cname]);
};

/**
 * Get all of the technologies for a given project
 * @param id ID of the project
 */
Technology.getAllForProject = function (id) {
    // 'num' field has the same value for technologies with the same id
    const sql = `SELECT dense_rank() over (order by t.id) as num, t.*,
        row_number() over (order by s) AS row_num,
        s.name as status, ver.id AS versionid, ver.name AS version, tpl.id AS linkid
        FROM technologies t
        INNER JOIN technology_project_link tpl on t.id=tpl.technologyid
        LEFT OUTER JOIN software_versions ver on ver.id=tpl.software_version_id
        INNER JOIN projects p on p.id=tpl.projectid
        LEFT OUTER JOIN status s on s.id = 
           COALESCE( (select statusid from tech_status_link where technologyid=t.id order by date desc limit 1),0 )
        WHERE p.id=$1
        ORDER BY status, t.name ASC`;

    return database.query(sql, [id]);
};

/**
 * Search for technologies
 * @param value String to search for
 */
Technology.search = function (value) {

    const sql =
            `SELECT t.id,
                    t.name    as name,
                    t.website as website,
                    t.description,
                    t.licence,
                    t.licencelink,
                    s.name    as status,
                    c.name    as category
             FROM technologies t
                      INNER JOIN categories c on t.category = c.id
                      LEFT OUTER JOIN status s on s.id =
                                                  COALESCE((select statusid
                                                            from tech_status_link
                                                            where technologyid = t.id
                                                            order by date desc
                                                            limit 1), 0)
             WHERE t.name ILIKE $1`;

    return database.query(sql, ['%' + value + '%']);
};

/**
 * Add a project to a technology
 *
 * @param technologyId Technology ID
 * @param projectId Project ID
 * @param [versionId] Software version ID to associate with the technology
 */
Technology.addProject = function (technologyId, projectId, versionId) {
    const params = [technologyId, projectId];
    let optionalVersionPlaceholder = ", null";

    if (versionId) {
        params.push(versionId);
        optionalVersionPlaceholder = ", $3";
    }

    const sql = `INSERT INTO technology_project_link (technologyid, projectid, software_version_id)
        VALUES ($1, $2  ${optionalVersionPlaceholder} )`;

    return database.insertOrUpdate(sql, params);
};

/**
 * Remove projects from a technology
 *
 * @param technologyId Technology ID
 * @param projectIds Project IDs
 */
Technology.removeProjects = function (technologyId, projectIds) {
    const idPlaceholders = [];
    for (let i = 2; i <= projectIds.length + 1; i++) {
        idPlaceholders.push('$' + i);
    }

    const sql = `DELETE FROM technology_project_link
        WHERE technologyid = $1 
        and projectid IN ( ${idPlaceholders.join(',') } )`;

    let params = [technologyId];
    params = params.concat(projectIds);

    return database.query(sql, params);
};

Technology.getMostUsedTechnologies = function () {
    // status_id is used by dashboard graphs
    // SQL in COALESCE selects the most recent status id
    const sql = `WITH tech_in_projects AS (
        SELECT t.name, s.id AS status_id
        FROM technology_project_link tpl 
        JOIN technologies t on tpl.technologyid=t.id
        LEFT OUTER JOIN status s on s.id =
            COALESCE((SELECT statusid from tech_status_link 
                WHERE technologyid=t.id
                ORDER BY date DESC LIMIT 1),0
            )
        GROUP BY t.name, s.id, projectid
    )
            
    SELECT name, status_id, count(*) AS total
    FROM tech_in_projects
    GROUP BY name, status_id
    ORDER BY total DESC
    LIMIT 40;`;

    return database.query( sql, []);
};

module.exports = Technology;
