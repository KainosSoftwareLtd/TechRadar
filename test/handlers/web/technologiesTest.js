var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var technology = require('../../../dao/technology.js');
var usedThisTechDao = require('../../../dao/usedThisTechnology.js');
var projectsDao = require('../../../dao/projects.js');
var webTechnologies = require('../../../handlers/web/technologiesWebHandler.js');

describe("Technologies web handler", function() {
    var req, res, technologyFromDb;

    beforeEach(function() {
        res = {};
        res.render = sinon.spy();
        res.redirect = sinon.spy();
        req = {
            user: { id: 111 },
            params: { id: 222 },
            flash: sinon.spy()
        };
        req.checkParams = function () {}; // this method normally comes from express middleware
        req.validationErrors = function () {}; // this method normally comes from express middleware
        technologyFromDb = {id: 345, name: "Tech name"};

        sinon.stub(technology, 'getById', function(userId, num, cb){
            cb(technologyFromDb);
        });

        sinon.stub(req, 'checkParams').returns({ 
            isInt: sinon.stub()
        });

        sinon.stub(req, 'validationErrors').returns(false);

    });

    afterEach(function() {
        technology.getById.restore();
        req.validationErrors.restore();
    });

    describe("listTechnologies", function() {
        it("should render list technologies page", function() {
            webTechnologies.listTechnologies(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('listTechnologies'); 
        });
    });
    
    describe("search", function() {
        it("should render search technologies page", function() {
            webTechnologies.search(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('searchTechnologies');
        });
    });
    
    describe("add", function() {
        it("should render add technology page", function() {
            webTechnologies.add(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('addTechnology');
        });
    });
    
    describe("edit", function() {
        it("should render edit technology page", function() {
            webTechnologies.edit(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('editTechnology');
        });

        it("should NOT render edit technology page if no technology was found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });
             
            webTechnologies.edit(req, res);

            sinon.assert.notCalled(res.render);
        });
        
        it("should NOT render edit technology page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.edit(req, res);

            sinon.assert.notCalled(res.render);

        });

        it("should redirect to the error page if validation failed", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });

            webTechnologies.edit(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.edit(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should pass the technology object to the rendered view", function() {
            webTechnologies.edit(req, res);

            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });
    });
    
    describe("getVersions", function() {
        it("should render edit versions page", function() {
            webTechnologies.getVersions(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('editVersions');
        });
        
        it("should NOT render editVersions page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getVersions(req, res);

            sinon.assert.notCalled(res.render);
        });

        it("should redirect to the error page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getVersions(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });

            webTechnologies.getVersions(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should pass the technology object to the rendered view", function() {
            webTechnologies.getVersions(req, res);

            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });

    });
    describe("getTechnology", function() {
        it("should render technology page", function() {
            webTechnologies.getTechnology(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('technology');
        });

        it("should NOT render technology page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getTechnology(req, res);

            sinon.assert.notCalled(res.render);
        });
        
        it("should redirect to the error page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getTechnology(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });

            webTechnologies.getTechnology(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should pass the technology object to the rendered view", function() {
            webTechnologies.getTechnology(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });
    });
    
    describe("getUsers", function() {
        var testUsers = [{name: "User1"}, {name: "User2"}];
        beforeEach(function() {
            sinon.stub(usedThisTechDao, 'getUsersForTechnology', function(userId, num, cb){
                cb(testUsers);
            });
        });

        afterEach(function() {
            usedThisTechDao.getUsersForTechnology.restore();
        });

        it("should render technologyUsers page", function() {
            webTechnologies.getUsers(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('technologyUsers');
        });

        it("should NOT render technologyUsers page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getUsers(req, res);

            sinon.assert.notCalled(res.render);
        });

        it("should NOT render technologyUsers page if no technology was found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });
             
            webTechnologies.getUsers(req, res);

            sinon.assert.notCalled(res.render);
        });
        
        it("should redirect to the error page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getUsers(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });

            webTechnologies.getUsers(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });
        
        it("should pass the technology object to the rendered view", function() {
            webTechnologies.getUsers(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });
        
        it("should get users of technology from usedThis DAO", function() {
            webTechnologies.getUsers(req, res);

            sinon.assert.calledOnce(usedThisTechDao.getUsersForTechnology);
        });

        it("should pass users of technology to the renderer", function() {
            webTechnologies.getUsers(req, res);

            expect(res.render.args[0][1]).to.contain({techUsers: testUsers});
        });
    });

    describe("getStatusHistory", function() {
        it("should render status history page", function() {
            webTechnologies.getStatusHistory(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('statushistory');
        });

        it("should NOT render status history page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getStatusHistory(req, res);

            sinon.assert.notCalled(res.render);
        });

        it("should redirect to the error page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getStatusHistory(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });

            webTechnologies.getStatusHistory(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should pass the technology object to the rendered view", function() {
            webTechnologies.getStatusHistory(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });
    });

    describe("getVotes", function() {
        it("should render vote history page", function() {
            webTechnologies.getVotes(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('votehistory');
        });

        it("should NOT render vote history page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getVotes(req, res);

            sinon.assert.notCalled(res.render);
        });

        it("should redirect to the error page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.getVotes(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });

            webTechnologies.getVotes(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should pass the technology object to the rendered view", function() {
            webTechnologies.getVotes(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });
    });

    describe("updateStatus", function() {
        it("should render updateStatus page", function() {
            webTechnologies.updateStatus(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('updateStatus');
        });

        it("should NOT render updateStatus page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.updateStatus(req, res);

            sinon.assert.notCalled(res.render);
        });

        it("should redirect to the error page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.updateStatus(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });

            webTechnologies.updateStatus(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should pass the technology object to the rendered view", function() {
            webTechnologies.updateStatus(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });
    });

    describe("addProject", function() {
        beforeEach(function() {
            sinon.stub(projectsDao, 'getAllForTechnology', function(techid, cb){
                cb({});
            });
            sinon.stub(projectsDao, 'getAll', function(cb){
                cb({filter: sinon.stub()});
            });
        });

        afterEach(function() {
            projectsDao.getAllForTechnology.restore();
            projectsDao.getAll.restore();
        });

        it("should render addProject page", function() {
            webTechnologies.addProject(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][0]).that.is.a('string').to.contain('addProject');
        });

        it("should NOT render addProject page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.addProject(req, res);

            sinon.assert.notCalled(res.render);
        });

        it("should redirect to the error page if validation failed", function() {
            req.validationErrors.restore(); // get rid of the default stub created in beforeEach()
            sinon.stub(req, 'validationErrors').returns(['error']);

            webTechnologies.addProject(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should redirect to the error page if technology was not found", function() {
            technology.getById.restore(); // get rid of the default stub created in beforeEach(){...}
            sinon.stub(technology, 'getById', function(userId, num, cb){
                cb(null /* missing technology object */);
            });
            
            webTechnologies.addProject(req, res);

            sinon.assert.calledOnce(res.redirect);
            expect(res.redirect.args[0][0]).to.contain('error');
        });

        it("should pass the technology object to the rendered view", function() {
            webTechnologies.addProject(req, res);

            sinon.assert.calledOnce(res.render);
            expect(res.render.args[0][1]).to.contain({'technology': technologyFromDb});
        });

        it("should call projects DAO", function() {
            webTechnologies.addProject(req, res);

            sinon.assert.calledOnce(projectsDao.getAllForTechnology);
            sinon.assert.calledOnce(projectsDao.getAll);
        });
    });
});