
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var tagsDao = require('../../../dao/tag.js');
var apiTags = require('../../../handlers/api/tagsApiHandler.js');
var apiutils = require('../../../handlers/api/apiUtils.js');
var tagValidator = require('../../../shared/validators/tagValidator.js');

describe("Tags api handler", function() {
    var req, res, apiUtilsSpy, testData, testError;

    beforeEach(function() {
        req = res = {};
        req.flash = sinon.spy();
        res.end = sinon.spy();
        res.writeHead = sinon.spy();     
        apiUtilsSpy = sinon.stub(apiutils, 'handleResultWithFlash');
        testData = 'results';
        testError = 'error';
    });

    afterEach(function() {
        apiutils.handleResultWithFlash.restore();
    });

    describe("getTags", function() {
        var getTagsSpy;

        beforeEach(function() {
            getTagsSpy = sinon.stub(tagsDao, 'getAll', function(done) {
                done(testData, testError);
            });
        });

        afterEach(function() {
            tagsDao.getAll.restore();
        });

        it("should call getAll() from tags DAO", function() {
            apiTags.getTags(req, res);

            sinon.assert.calledOnce(tagsDao.getAll);
        });

        it("should pass the results to the API handler", function() {
            apiTags.getTags(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[2]).to.equal(testData);
        });

        it("should pass the errors to the API handler", function() {
            apiTags.getTags(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[3]).to.equal(testError);
        });
    });

    describe("getAllWithOptionalProjectId", function() {
        var getAllWithOptionalProjectIdSpy;
        var req = {params: {projectId: '52345532'}};
        var res = {};
        
        beforeEach(function() {
            getAllWithOptionalProjectIdSpy = sinon.stub(tagsDao, 'getAllWithOptionalProjectId', function(projectId, done) {
                done(testData, testError);
            });
        });

        afterEach(function() {
            tagsDao.getAllWithOptionalProjectId.restore();
        });

        it("should call getAllWithOptionalProjectId() from tags DAO with proper data", function() {
            apiTags.getAllWithOptionalProjectId(req, res);
            sinon.assert.calledOnce(tagsDao.getAllWithOptionalProjectId);
        });

        it("should pass the results to the API handler", function() {
            apiTags.getAllWithOptionalProjectId(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[2]).to.equal(testData);
        });

        it("should pass the errors to the API handler", function() {
            apiTags.getAllWithOptionalProjectId(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[3]).to.equal(testError);
        });
    });

    describe("getForProject", function() {
        var getForProjectSpy;
        var req = {params: {projectId: '52345532'}};
        var res = {};
        
        beforeEach(function() {
            getForProjectSpy = sinon.stub(tagsDao, 'getAllForProject', function(projectId, done) {
                done(testData, testError);
            });
        });

        afterEach(function() {
            tagsDao.getAllForProject.restore();
        });

        it("should call getForProject() from tags DAO", function() {
            apiTags.getForProject(req, res);
            sinon.assert.calledOnce(tagsDao.getAllForProject);
        });

        it("should pass the results to the API handler", function() {
            apiTags.getForProject(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[2]).to.equal(testData);
        });

        it("should pass the errors to the API handler", function() {
            apiTags.getForProject(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[3]).to.equal(testError);
        });
    });

    describe("addTag", function() {
        var addSpy;
        var req = {body: {name: 'Tag name'}};
        var app = {};
        var res = {
            writeHead: function() {},
            end: function() {}
        };

        beforeEach(function() {
            addSpy = sinon.stub(tagsDao, 'add', function(tagName, done) {
                done(testData, testError);
            });
        });

        afterEach(function() {
            tagsDao.add.restore();
        });

        it("should call add() from tags DAO with proper data", function() {
            apiTags.addTag(req, res);

            sinon.assert.calledOnce(tagsDao.add);
            expect(addSpy.getCalls()[0].args[0]).to.equal(req.body.name);
        });

        it("should trim whitespace on both ends of a name", function() {
            req.body.name = "    whitespace test      ";
            apiTags.addTag(req, res);

            sinon.assert.calledOnce(tagsDao.add);
            expect(addSpy.getCalls()[0].args[0]).to.equal("whitespace test");
        });

        it("should pass the results to the API handler", function() {
            apiTags.addTag(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[2]).to.equal(testData);
        });

        it("should pass the errors to the API handler", function() {
            apiTags.addTag(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[3]).to.equal(testError);
        });

        it("should NOT call add() from tags DAO when validation fails", function() {
            sinon.stub(tagValidator, 'validateTagName').returns({valid: false});
            
            apiTags.addTag(req, res);

            sinon.assert.notCalled(tagsDao.add);

            tagValidator.validateTagName.restore();
        });

        it("should call add() from tags DAO when validation passes", function() {
            sinon.stub(tagValidator, 'validateTagName').returns({valid: true});

            apiTags.addTag(req, res);

            sinon.assert.calledOnce(tagsDao.add);

            tagValidator.validateTagName.restore();
        });
    });

    describe("deleteTags", function() {
        var deleteTagsSpy;
        var req = {body: {tags: [1, 22, 333]}};

        beforeEach(function() {
            deleteTagsSpy = sinon.stub(tagsDao, 'delete', function(tagIds, done) {
                done(testData, testError);
            });
        });

        afterEach(function() {
            tagsDao.delete.restore();
        });

        it("should call delete() from tags DAO with proper data", function() {
            apiTags.deleteTags(req, res);

            sinon.assert.calledOnce(tagsDao.delete);
            expect(deleteTagsSpy.getCalls()[0].args[0]).to.equal(req.body.tags);
        });
        
        it("should pass the results to the API handler", function() {
            apiTags.deleteTags(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[2]).to.equal(testData);
        });

        it("should pass the errors to the API handler", function() {
            apiTags.deleteTags(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[3]).to.equal(testError);
        });
    });

    describe("reassignToProject", function() {
        var reassignToProjectSpy;
        var req = {
            body: {tags: [1, 22, 333]},
            params: {projectId: '53452'}
        };

        beforeEach(function() {
            reassignToProjectSpy = sinon.stub(tagsDao, 'reassignToProject', function(projectId, tagIds, done) {
                done(testData, testError);
            });
        });

        afterEach(function() {
            tagsDao.reassignToProject.restore();
        });

        it("should call reassignToProject() from tags DAO with proper data", function() {
            apiTags.reassignTagsToProject(req, res);

            sinon.assert.calledOnce(tagsDao.reassignToProject);
            expect(reassignToProjectSpy.getCalls()[0].args[0]).to.equal(req.params.projectId);
            expect(reassignToProjectSpy.getCalls()[0].args[1]).to.equal(req.body.tags);
        });

        it("should pass the results to the API handler", function() {
            apiTags.reassignTagsToProject(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[2]).to.equal(testData);
        });

        it("should pass the errors to the API handler", function() {
            apiTags.reassignTagsToProject(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[3]).to.equal(testError);
        });

    });

    describe("updateTag", function() {
        var updateSpy;
        var req = {body: {tag: '2345354', name: 'Tag name'}};
        var app = {};
        var res = {
            writeHead: function() {},
            end: function() {}
        };

        beforeEach(function() {
            updateSpy = sinon.stub(tagsDao, 'update', function(tagId, tagName, done) {
                done(testData, testError);
            });
        });

        afterEach(function() {
            tagsDao.update.restore();
        });

        it("should call update() from tags DAO with proper data", function() {
            apiTags.updateTag(req, res);

            sinon.assert.calledOnce(tagsDao.update);
            expect(updateSpy.getCalls()[0].args[0]).to.equal(req.body.tag);
            expect(updateSpy.getCalls()[0].args[1]).to.equal(req.body.name);
        });

        it("should trim whitespace on both ends of a name", function() {
            req.body.name = "   whitespace test     ";
            apiTags.updateTag(req, res);

            sinon.assert.calledOnce(tagsDao.update);
            expect(updateSpy.getCalls()[0].args[1]).to.equal("whitespace test");
        });


        it("should pass the results to the API handler", function() {
            apiTags.updateTag(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[2]).to.equal(testData);
        });

        it("should pass the errors to the API handler", function() {
            apiTags.updateTag(req, res);

            expect(apiUtilsSpy.getCalls()[0].args[3]).to.equal(testError);
        });

        it("should NOT call update() from tags DAO when validation fails", function() {
            sinon.stub(tagValidator, 'validateTagName').returns({valid: false});
            
            apiTags.updateTag(req, res);

            sinon.assert.notCalled(tagsDao.update);

            tagValidator.validateTagName.restore();
        });

        it("should call update() from tags DAO when validation passes", function() {
            sinon.stub(tagValidator, 'validateTagName').returns({valid: true});

            apiTags.updateTag(req, res);

            sinon.assert.calledOnce(tagsDao.update);

            tagValidator.validateTagName.restore();
        });
    });
});
