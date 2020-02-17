const cache = require('../../dao/cache.js');
const technology = require('../../dao/technology');
const _ = require('underscore');

const CategoriesWebHandler = function () {
};

/**
 * Get all categories
 */
CategoriesWebHandler.listCategories = function (req, res) {
    res.render('pages/admin/listCategories', {user: req.user});
};

CategoriesWebHandler.addCategory = function (req, res) {
    res.render('pages/admin/addCategory', {user: req.user});
};

CategoriesWebHandler.technologiesForCategory = function (req, res) {

    const cname = decodeURI(req.params.category);
    technology.getAllForCategory(cname.toLowerCase())
        .then(values => {

            // groups technologies by status into the following structure:
            // [{ status: key, technologies: [technologies where status==key]}]
            const technologiesInGroups = _.chain(values).groupBy('status')
                .map(function (technologies, key) {
                    return {
                        status: key,
                        technologies: technologies
                    };
                }).value();

            const category = cache.getCategory(cname);

            res.render('pages/categoryRadar', {
                category: category,
                technologies: values, // used by radar.js
                technologiesInGroups: technologiesInGroups,
                user: req.user
            });
        })
        .catch(error => {
            res.redirect('/error')
        });
};

module.exports = CategoriesWebHandler;