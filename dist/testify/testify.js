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
var axios_1 = require("axios");
var pathUtil = require('path');
var Rx = require('rx');
var assert = require('assert');
var hashDir = require('./hashDirectory');
var crypto = require('crypto');
var shell = require("shelljs");
var Testify = /** @class */ (function () {
    function Testify(testifyBaseUrl) {
        /**
         * Command that is used to start local server.
         */
        this.startLocalServerCmd = null;
        /**
         * Frontend directory
         */
        this.frontendDir = null;
        /**
         * Command used for compiling the frontend. Relative to frontend directory.
         */
        this.compileFrontendCmd = null;
        /**
         * Paths to files/directories relative to frontend directory which should be used for checksum computation
         */
        this.frontendChecksumPaths = null;
        /**
         * Do not recompile the frontend if the checksum of source files matches. Defaults to true;
         */
        this.fontendDoNotRecompile = true;
        this.baseUrl = testifyBaseUrl;
    }
    Testify.prototype.startLocalServerIfNotRunning = function () {
        var _this = this;
        this.compileFrontendIfNeeded();
        return new Promise(function (resolve) {
            _this.isStarted().then(function (started) {
                if (started) {
                    console.log("✅ App Server is already running on ", _this.baseUrl);
                    resolve(true);
                }
                else {
                    console.log("⏳ App Server is not running - starting a new one");
                    _this.serverHandle = shell.exec(_this.startLocalServerCmd, { async: true });
                    _this.isStarted(30000, true).then(function (isStarted) {
                        resolve(isStarted);
                    });
                }
            });
        });
    };
    Testify.prototype.shutdownLocalServerIfRunning = function () {
        if (this.serverHandle != null) {
            this.serverHandle.kill();
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(false);
        }
    };
    Testify.prototype.isStarted = function (timeout, keepTryingUntilTimeout) {
        var _this = this;
        if (timeout === void 0) { timeout = 1000; }
        if (keepTryingUntilTimeout === void 0) { keepTryingUntilTimeout = false; }
        var start = clock();
        var isChecking = false;
        if (keepTryingUntilTimeout) {
            //return Rx.Observable.fromPromise(this.isStartedInternal(timeout))
            return Rx.Observable.create(function (observer) {
                _this.isStartedInternal(timeout, start).then(function (isRunning) {
                    observer.onNext(isRunning);
                    observer.onCompleted();
                });
            }).delay(20).map(function (value) {
                if ((clock() - start) < timeout && value == false) {
                    throw new Error('error!');
                }
                return value;
            }).retry().take(1).toPromise();
        }
        else {
            return this.isStartedInternal(timeout, start);
        }
    };
    Testify.prototype.getTestCase = function (name) {
        return new TestCase(name, this.baseUrl);
    };
    Object.defineProperty(Testify.prototype, "isOnLocalhost", {
        get: function () {
            if (this.baseUrl.indexOf('localhost') !== -1) {
                return true;
            }
            if (this.baseUrl.indexOf('127.0.0.1') !== -1) {
                return true;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Testify.prototype.isStartedInternal = function (timeout, startMsec) {
        return axios_1.default.get(this.baseUrl + '/check', {
            timeout: timeout
        }).then(function () {
            console.log('✅  Made contact with server-side Testify within ' + (clock() - startMsec) + 'ms 👌');
            return true;
        }).catch(function (error) {
            return false;
        });
    };
    Testify.prototype.compileFrontendIfNeeded = function () {
        var _this = this;
        if (this.compileFrontendCmd && this.frontendDir) {
            var startMsec = clock();
            console.log("Frontend checksums:");
            var pathsToCheck = [];
            if (this.frontendChecksumPaths) {
                pathsToCheck = this.frontendChecksumPaths.map(function (path) {
                    return pathUtil.join(_this.frontendDir, path);
                });
            }
            else {
                pathsToCheck.push(this.frontendDir);
            }
            var finalChecksumPayload = "";
            pathsToCheck.forEach(function (path) {
                var hashed = hashDir.sync(path);
                finalChecksumPayload = finalChecksumPayload + ("[" + path + ":" + hashed + "]");
                console.log(path + " => " + hashed);
            });
            var finalChecksum = checksum(finalChecksumPayload);
            console.log("FINAL: " + finalChecksum);
            var checksumPath = pathUtil.join(shell.tempdir(), "testify." + finalChecksum + ".checksum");
            if (this.fontendDoNotRecompile == true && shell.test('-e', checksumPath)) {
                console.log("\u2705  Skipping FE compilation. Matching checksum found. (" + (clock() - startMsec) + " ms)");
            }
            else {
                console.log('🛠 Compiling frontend:');
                var result = shell.exec("cd " + this.frontendDir + " && " + this.compileFrontendCmd);
                if (result.code === 0) {
                    console.log("\u2705  Frontend compiled in " + (clock() - startMsec) + " ms");
                    shell.touch(checksumPath);
                    console.log("\u2705  written " + checksumPath);
                }
                else {
                    console.log('❌  compilation failed :-(');
                }
            }
        }
        else {
            console.log('❗ Will not comppile frontend - compileFrontendCmd or frontendDir not set');
        }
    };
    return Testify;
}());
exports.Testify = Testify;
var TestCase = /** @class */ (function () {
    function TestCase(name, baseUrl) {
        this.name = name;
        this.baseUrl = baseUrl;
    }
    TestCase.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, axios_1.default.post(this.baseUrl + "/cases/" + this.name)];
            });
        });
    };
    TestCase.prototype.statement = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, axios_1.default.post(this.baseUrl + "/cases/" + this.name + "/statements/" + name)];
            });
        });
    };
    TestCase.prototype.end = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, axios_1.default.delete(this.baseUrl + "/cases/" + this.name)];
            });
        });
    };
    return TestCase;
}());
exports.TestCase = TestCase;
function clock() {
    var end = process.hrtime();
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}
function checksum(str, algorithm, encoding) {
    if (algorithm === void 0) { algorithm = null; }
    if (encoding === void 0) { encoding = null; }
    return crypto
        .createHash(algorithm || 'sha1')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}
//# sourceMappingURL=testify.js.map