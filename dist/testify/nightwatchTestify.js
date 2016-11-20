"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const testify_1 = require('./testify');
/**
 * Testify imbues with Nightwatch browser API to perform expectations.
 */
class NightwatchTestify {
    constructor(testifyBaseUrl, browser) {
        this.testify = new testify_1.Testify(testifyBaseUrl);
        this.browser = browser;
    }
    getTestCase(name) {
        return new NightwatchTestCase(name, this.testify.baseUrl, this.browser);
    }
}
exports.NightwatchTestify = NightwatchTestify;
class NightwatchTestCase {
    constructor(name, baseUrl, browser) {
        this.testCase = new testify_1.TestCase(name, baseUrl);
        this.browser = browser;
    }
    start(callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser.perform((browser, done) => {
                this.testCase.start().then((data) => {
                    if (callback) {
                        callback(data);
                    }
                    browser.assert.equal(data.status, 200, this.testCase.name + " - STARTED");
                    done();
                }).catch((data) => {
                    console.log(data);
                    if (data.response) {
                        browser.assert.equal(data.response.status, 200, "Test case start request failed: " + this.testCase.name);
                    }
                    else {
                        browser.assert.ok(false, "Test case start request failed: " + this.testCase.name);
                    }
                    done();
                });
            });
        });
    }
    statement(name, callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser.perform((browser, done) => {
                this.testCase.statement(name).then((data) => {
                    if (callback) {
                        callback(data);
                    }
                    browser.assert.equal(data.status, 200);
                    done();
                }).catch((data) => {
                    console.log(data);
                    if (data.response) {
                        browser.assert.equal(data.response.status, 200, "Statement failed: " + this.testCase.name + "::" + name);
                    }
                    else {
                        browser.assert.ok(false, "Statement failed failed: " + this.testCase.name + "::" + name);
                    }
                    done();
                });
            });
        });
    }
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser.perform((browser, done) => {
                this.testCase.end().then((data) => {
                    browser.assert.equal(data.status, 200);
                    done();
                }).catch((data) => {
                    console.log(data);
                    if (data.response) {
                        browser.assert.equal(data.response.status, 200, "Statement failed: " + this.testCase.name + "::" + name);
                    }
                    else {
                        browser.assert.ok(false, "Statement failed failed: " + this.testCase.name + "::" + name);
                    }
                    done();
                });
            });
        });
    }
}
exports.NightwatchTestCase = NightwatchTestCase;
