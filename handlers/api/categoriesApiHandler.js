'use strict';

const cache = require('../../dao/cache.js');
const category = require('../../dao/category.js');
const sanitizer = require('sanitize-html');
const apiutils = require('../../utils/apiUtils.js');

const CategoriesApiHandler = function () {
};

/**
 * Get all categories
 */
CategoriesApiHandler.getCategories = function (req, res) {
    category.getAll()
        .then(result => apiutils.sendResultAsJson(res,result))
        .catch(error => apiutils.sendErrorResponse(res,error));
};

CategoriesApiHandler.addCategory = function (app) {
    return function (req, res) {
        category.add(sanitizer(req.body.name.trim()), sanitizer(req.body.description))
            .then(result => {
                cache.refresh(app);
                apiutils.handleResultSet(res, result, null);
            })
            .catch(error => apiutils.handleResultSet(res, null, error));
    }
};

CategoriesApiHandler.deleteCategories = function (app) {
    return function (req, res) {
        const data = req.body.id;

        category.delete(data)
            .then(result => {
                cache.refresh(app);
                apiutils.handleResultSet(res, result, null);
            })
            .catch(error => apiutils.handleResultSet(res, null, error));
    }
};

module.exports = CategoriesApiHandler;
