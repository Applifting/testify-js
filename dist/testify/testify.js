"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/// <reference path="../../typings/index.d.ts" />
const axios = require('axios');
var pathUtil = require('path');
var Rx = require('rx');
var assert = require('assert');
var hashDir = require('./hashDirectory');
var crypto = require('crypto');
const shell = require('shelljs');
class Testify {
    constructor(testifyBaseUrl) {
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
    startLocalServerIfNotRunning() {
        this.compileFrontendIfNeeded();
        return new Promise((resolve) => {
            this.isStarted().then((started) => {
                if (started) {
                    console.log("✅ App Server is already running on ", this.baseUrl);
                    resolve(true);
                }
                else {
                    console.log("⏳ App Server is not running - starting a new one");
                    this.serverHandle = shell.exec(this.startLocalServerCmd, { async: true });
                    this.isStarted(30000, true).then((isStarted) => {
                        resolve(isStarted);
                    });
                }
            });
        });
    }
    shutdownLocalServerIfRunning() {
        if (this.serverHandle != null) {
            this.serverHandle.kill();
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(false);
        }
    }
    isStarted(timeout = 1000, keepTryingUntilTimeout = false) {
        var start = clock();
        var isChecking = false;
        if (keepTryingUntilTimeout) {
            //return Rx.Observable.fromPromise(this.isStartedInternal(timeout))
            return Rx.Observable.create(observer => {
                this.isStartedInternal(timeout, start).then((isRunning) => {
                    observer.onNext(isRunning);
                    observer.onCompleted();
                });
            }).delay(20).map((value) => {
                if ((clock() - start) < timeout && value == false) {
                    throw new Error('error!');
                }
                return value;
            }).retry().take(1).toPromise();
        }
        else {
            return this.isStartedInternal(timeout, start);
        }
    }
    getTestCase(name) {
        return new TestCase(name, this.baseUrl);
    }
    get isOnLocalhost() {
        if (this.baseUrl.indexOf('localhost') !== -1) {
            return true;
        }
        if (this.baseUrl.indexOf('127.0.0.1') !== -1) {
            return true;
        }
        return false;
    }
    isStartedInternal(timeout, startMsec) {
        return axios.get(this.baseUrl + '/check', {
            timeout: timeout
        }).then(function () {
            console.log('✅  Made contact with server-side Testify within ' + (clock() - startMsec) + 'ms 👌');
            return true;
        }).catch(function (error) {
            return false;
        });
    }
    compileFrontendIfNeeded() {
        if (this.compileFrontendCmd && this.frontendDir) {
            var startMsec = clock();
            console.log(`Frontend checksums:`);
            var pathsToCheck = [];
            if (this.frontendChecksumPaths) {
                pathsToCheck = this.frontendChecksumPaths.map((path) => {
                    return pathUtil.join(this.frontendDir, path);
                });
            }
            else {
                pathsToCheck.push(this.frontendDir);
            }
            var finalChecksumPayload = "";
            pathsToCheck.forEach((path) => {
                var hashed = hashDir.sync(path);
                finalChecksumPayload = finalChecksumPayload + `[${path}:${hashed}]`;
                console.log(`${path} => ${hashed}`);
            });
            var finalChecksum = checksum(finalChecksumPayload);
            console.log(`FINAL: ${finalChecksum}`);
            var checksumPath = pathUtil.join(shell.tempdir(), `testify.${finalChecksum}.checksum`);
            if (this.fontendDoNotRecompile == true && shell.test('-e', checksumPath)) {
                console.log(`✅  Skipping FE compilation. Matching checksum found. (${(clock() - startMsec)} ms)`);
            }
            else {
                console.log('🛠 Compiling frontend:');
                var result = shell.exec(`cd ${this.frontendDir} && ${this.compileFrontendCmd}`);
                if (result.code === 0) {
                    console.log(`✅  Frontend compiled in ${(clock() - startMsec)} ms`);
                    shell.touch(checksumPath);
                    console.log(`✅  written ${checksumPath}`);
                }
                else {
                    console.log('❌  compilation failed :-(');
                }
            }
        }
        else {
            console.log('❗ Will not comppile frontend - compileFrontendCmd or frontendDir not set');
        }
    }
}
exports.Testify = Testify;
class TestCase {
    constructor(name, baseUrl) {
        this.name = name;
        this.baseUrl = baseUrl;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return axios.post(this.baseUrl + "/cases/" + this.name);
        });
    }
    statement(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios.post(this.baseUrl + "/cases/" + this.name + "/statements/" + name);
        });
    }
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            return axios.delete(this.baseUrl + "/cases/" + this.name);
        });
    }
}
exports.TestCase = TestCase;
function clock() {
    var end = process.hrtime();
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}
function checksum(str, algorithm = null, encoding = null) {
    return crypto
        .createHash(algorithm || 'sha1')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}
