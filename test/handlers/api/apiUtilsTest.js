var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var apiUtils = require('../../../handlers/api/apiUtils.js');


describe("apiUtils", function() {
    describe("handleResultSet", function() {
        var res, result, error;

        beforeEach(function() {
            result = res = error = {};
            res.end = sinon.spy();
            res.writeHead = sinon.spy();

            result = "test result";
        });

        it("should respond with success true when result present", function() {
            apiUtils.handleResultSet(res, result, error);

            sinon.assert.calledOnce(res.writeHead);
            sinon.assert.calledOnce(res.end);
            expect(res.end.args[0][0]).to.be.a('string');
            expect(JSON.parse(res.end.args[0][0])).to.be.an('object');
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("result", result);
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("success", true);
        });

        it("should respond with success false when no result", function() {
            result = null;
            error = "test error";

            apiUtils.handleResultSet(res, result, error);

            sinon.assert.calledOnce(res.writeHead);
            sinon.assert.calledOnce(res.end);
            expect(res.end.args[0][0]).to.be.a('string');
            expect(JSON.parse(res.end.args[0][0])).to.be.an('object');
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("error", error);
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("success", false);
        });
    });

    describe("handleResultWithFlash", function() {
        var req, res, result, error;

        beforeEach(function() {
            result = res = error = {};
            res.end = sinon.spy();
            res.writeHead = sinon.spy();
            req = {
                flash: sinon.spy()
            };

            result = "test result";
        });

        it("should respond with success true when result present", function() {
            apiUtils.handleResultWithFlash(req, res, result, error);

            sinon.assert.calledOnce(res.writeHead);
            sinon.assert.calledOnce(res.end);
            expect(res.end.args[0][0]).to.be.a('string');
            expect(JSON.parse(res.end.args[0][0])).to.be.an('object');
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("result", result);
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("success", true);
        });

        it("should create a flash success message by default", function() {
            apiUtils.handleResultWithFlash(req, res, result, error);

            sinon.assert.calledTwice(req.flash);
            expect(req.flash.args[0][0]).that.is.a('string').to.equal("success");
        });

        it("should not create a flash success message when suppressSuccessFlash is true", function() {
            apiUtils.handleResultWithFlash(req, res, result, error, true);

            sinon.assert.calledOnce(req.flash);
            expect(req.flash.args[0][0]).to.be.undefined;
        });

        it("should respond with success false when no result", function() {
            result = null;
            error = "test error";

            apiUtils.handleResultWithFlash(req, res, result, error);

            sinon.assert.calledOnce(res.writeHead);
            sinon.assert.calledOnce(res.end);
            expect(res.end.args[0][0]).to.be.a('string');
            expect(JSON.parse(res.end.args[0][0])).to.be.an('object');
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("error", error);
            expect(JSON.parse(res.end.args[0][0])).to.have.a.property("success", false);
        });

        it("should create a flash danger message on error", function() {
            result = null;
            error = "test error";
            apiUtils.handleResultWithFlash(req, res, result, error);

            sinon.assert.calledTwice(req.flash);
            expect(req.flash.args[0][0]).that.is.a('string').to.equal("danger");
            expect(req.flash.args[0][1]).that.is.a('string').to.equal(error);
        });
    });
});
