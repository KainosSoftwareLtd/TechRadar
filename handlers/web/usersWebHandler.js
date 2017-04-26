var users = require('../../dao/users');

var UsersWebHandler = function () {
};

UsersWebHandler.list = function (req, res) {
    res.render('pages/admin/user/listUsers', {
        user: req.user,
        messages: req.flash()
    });
};

UsersWebHandler.add = function (req, res) {
    res.render('pages/admin/user/addUser', {
        user: req.user,
        messages: req.flash()
    });
};

UsersWebHandler.editProfile = function (req, res) {
    res.render('pages/editProfile', {
        user: req.user,
        editUser: req.user,
        messages: req.flash()
    });
};

UsersWebHandler.editUser = function (req, res) {
    req.checkParams('userId', 'Invalid user id').isInt();

    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function(e) {
            req.flash("danger", e.msg);
        });

        res.redirect('/error');
        return;
    }

    users.findById(req.params.userId, function (error, editUser) {
        if (error || !editUser) {
            req.flash("danger", "Error while trying to retrieve user data");
            res.redirect('/error');
            return;
        } else {
            res.render('pages/admin/user/editUser', {
                user: req.user,
                editUser: editUser,
                messages: req.flash()
            });
        }
    });

};


module.exports = UsersWebHandler;