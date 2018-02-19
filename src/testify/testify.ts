import axios from 'axios'
var pathUtil = require('path');
var Rx = require('rx');
var assert = require('assert');
var hashDir = require('./hashDirectory');
var crypto = require('crypto');
import * as shell from 'shelljs'
export class Testify{
    /**
     * Base url of the server under the test. It should point to URL where testify is mounted.
     */
    public baseUrl : string;

    /**
     * Command that is used to start local server.
     */
    public startLocalServerCmd : string = null;


    /**
     * Frontend directory
     */
    public frontendDir : string = null;

    /**
     * Command used for compiling the frontend. Relative to frontend directory.
     */
    public compileFrontendCmd : string = null;

    /**
     * Paths to files/directories relative to frontend directory which should be used for checksum computation
     */
    public frontendChecksumPaths : [string] = null;

    /**
     * Do not recompile the frontend if the checksum of source files matches. Defaults to true;
     */
    public fontendDoNotRecompile = true;

    private serverHandle : any;

    constructor(testifyBaseUrl : string){
        this.baseUrl = testifyBaseUrl;
    }


    startLocalServerIfNotRunning() : Promise<boolean>{

        this.compileFrontendIfNeeded();

        return new Promise((resolve)=>{
            this.isStarted().then((started : boolean) => {
                if(started){
                    console.log("✅ App Server is already running on ", this.baseUrl);
                    resolve(true);
                }else{
                    console.log("⏳ App Server is not running - starting a new one");
                    this.serverHandle = shell.exec(this.startLocalServerCmd,{async:true});
                    this.isStarted(30000,true).then((isStarted) => {
                        resolve(isStarted);
                    });
                }
            });
        });

    }

    shutdownLocalServerIfRunning() : Promise<boolean>{
        if (this.serverHandle != null){
            this.serverHandle.kill();
            return Promise.resolve(true);
        }else{
            return Promise.resolve(false);
        }
    }

    isStarted(timeout=1000, keepTryingUntilTimeout : boolean = false) : Promise<boolean>{
        var start = clock();
        var isChecking = false;
        if(keepTryingUntilTimeout){
            //return Rx.Observable.fromPromise(this.isStartedInternal(timeout))
            return Rx.Observable.create(observer => {
                this.isStartedInternal(timeout,start).then((isRunning)=>{
                    observer.onNext(isRunning);
                    observer.onCompleted();
                });
            }).delay(20).map((value) => {
                if((clock() - start) < timeout && value == false){
                    throw new Error('error!');
                }
                return value;
             }).retry().take(1).toPromise();
        }
        else{
            return this.isStartedInternal(timeout,start);
        }
    }

    getTestCase(name) : TestCase{
        return new TestCase(name,this.baseUrl);
    }

    get isOnLocalhost():boolean{
        if(this.baseUrl.indexOf('localhost') !== -1){
            return true;
        }
        if(this.baseUrl.indexOf('127.0.0.1') !== -1){
            return true;
        }
        return false;
    }

    private isStartedInternal(timeout:number, startMsec : number) : Promise<boolean>{
        return axios.get(this.baseUrl+'/check',{
            timeout: timeout
        }).then(function(){
            console.log('✅  Made contact with server-side Testify within ' + (clock()-startMsec) +'ms 👌');
            return true;
        }).catch(function(error){
            return false;
        }) as Promise<boolean>;
    }

    private compileFrontendIfNeeded(){
        if(this.compileFrontendCmd && this.frontendDir){
            var startMsec = clock();
            console.log(`Frontend checksums:`)
            var pathsToCheck : string[] = [];
            if(this.frontendChecksumPaths){
                pathsToCheck = this.frontendChecksumPaths.map((path)=>{
                    return pathUtil.join(this.frontendDir,path);
                });
            }else{
                pathsToCheck.push(this.frontendDir);
            }
            var finalChecksumPayload = "";
            pathsToCheck.forEach((path)=>{
                var hashed = hashDir.sync(path);
                finalChecksumPayload = finalChecksumPayload + `[${path}:${hashed}]`;
                console.log(`${path} => ${hashed}`);

            });
            var finalChecksum = checksum(finalChecksumPayload);
            console.log(`FINAL: ${finalChecksum}`);
            var checksumPath = pathUtil.join(shell.tempdir(),`testify.${finalChecksum}.checksum`)
            if(this.fontendDoNotRecompile == true && shell.test('-e',checksumPath)){
                console.log(`✅  Skipping FE compilation. Matching checksum found. (${(clock()-startMsec)} ms)`);
            }else{
                console.log('🛠 Compiling frontend:');
                var result = shell.exec(`cd ${this.frontendDir} && ${this.compileFrontendCmd}`);
                if(result.code === 0){
                    console.log(`✅  Frontend compiled in ${(clock()-startMsec)} ms`);
                    shell.touch(checksumPath);
                    console.log(`✅  written ${checksumPath}`);
                }else{
                    console.log('❌  compilation failed :-(');
                }
            }
        }else{
            console.log('❗ Will not comppile frontend - compileFrontendCmd or frontendDir not set');
        }
    }





}

export class TestCase{
    baseUrl : string;
    public name : string;

    constructor(name,baseUrl){
        this.name = name;
        this.baseUrl = baseUrl;
    }

    async start() : Promise<any> {
        return axios.post(this.baseUrl+"/cases/"+this.name);
    }

    async statement(name) : Promise<any>{
        return axios.post(this.baseUrl+"/cases/"+this.name+"/statements/"+name);
    }

    async end() : Promise<any>{
        return axios.delete(this.baseUrl+"/cases/"+this.name);
    }
}


function clock() : number {
    var end = process.hrtime();
    return Math.round((end[0]*1000) + (end[1]/1000000));
}

function checksum (str, algorithm = null, encoding = null) {
    return crypto
        .createHash(algorithm || 'sha1')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}