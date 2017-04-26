var cache = require('../../dao/cache.js');
var users = require('../../dao/users');
var technology = require('../../dao/technology');
var _ = require('underscore');

var CategoriesWebHandler = function () {
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

    var cname = decodeURI(req.params.category);
    technology.getAllForCategory(cname.toLowerCase(), function (values) {

        if (values == null || values.length === 0) {
            req.flash("danger", "No technologies found for category " + cname);
            res.redirect('/error');
            return;
        }

        // groups technologies by status into the following structure: 
        // [{ status: key, technologies: [technologies where status==key]}]
        var technologiesInGroups = _.chain(values).groupBy('status')
            .map(function(technologies, key) {
                return {
                    status: key,
                    technologies: technologies
                };
            }).value();

        var category = cache.getCategory(cname);

        res.render('pages/categoryRadar', {
            category: category,
            technologies: values, // used by radar.js
            technologiesInGroups: technologiesInGroups,
            user: req.user
        });
    });
};

module.exports = CategoriesWebHandler;