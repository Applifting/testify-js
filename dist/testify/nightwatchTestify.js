"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var testify_1 = require("./testify");
/**
 * Testify imbues with Nightwatch browser API to perform expectations.
 */
var NightwatchTestify = /** @class */ (function () {
    function NightwatchTestify(testifyBaseUrl, browser) {
        this.testify = new testify_1.Testify(testifyBaseUrl);
        this.browser = browser;
    }
    NightwatchTestify.prototype.getTestCase = function (name) {
        return new NightwatchTestCase(name, this.testify.baseUrl, this.browser);
    };
    return NightwatchTestify;
}());
exports.NightwatchTestify = NightwatchTestify;
var NightwatchTestCase = /** @class */ (function () {
    function NightwatchTestCase(name, baseUrl, browser) {
        this.testCase = new testify_1.TestCase(name, baseUrl);
        this.browser = browser;
    }
    NightwatchTestCase.prototype.start = function (callback) {
        if (callback === void 0) { callback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.browser.perform(function (browser, done) {
                    _this.testCase.start().then(function (data) {
                        if (callback) {
                            callback(data);
                        }
                        browser.assert.equal(data.status, 200, _this.testCase.name + " - STARTED");
                        done();
                    }).catch(function (data) {
                        console.log(data);
                        if (data.response) {
                            browser.assert.equal(data.response.status, 200, "Test case start request failed: " + _this.testCase.name);
                        }
                        else {
                            browser.assert.ok(false, "Test case start request failed: " + _this.testCase.name);
                        }
                        done();
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    NightwatchTestCase.prototype.statement = function (name, callback) {
        if (callback === void 0) { callback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.browser.perform(function (browser, done) {
                    _this.testCase.statement(name).then(function (data) {
                        if (callback) {
                            callback(data);
                        }
                        browser.assert.equal(data.status, 200);
                        done();
                    }).catch(function (data) {
                        console.log(data);
                        if (data.response) {
                            browser.assert.equal(data.response.status, 200, "Statement failed: " + _this.testCase.name + "::" + name);
                        }
                        else {
                            browser.assert.ok(false, "Statement failed failed: " + _this.testCase.name + "::" + name);
                        }
                        done();
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    NightwatchTestCase.prototype.end = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.browser.perform(function (browser, done) {
                    _this.testCase.end().then(function (data) {
                        browser.assert.equal(data.status, 200);
                        done();
                    }).catch(function (data) {
                        console.log(data);
                        if (data.response) {
                            browser.assert.equal(data.response.status, 200, "End failed: " + _this.testCase.name);
                        }
                        else {
                            browser.assert.ok(false, "End failed failed: " + _this.testCase.name);
                        }
                        done();
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    return NightwatchTestCase;
}());
exports.NightwatchTestCase = NightwatchTestCase;
//# sourceMappingURL=nightwatchTestify.js.map