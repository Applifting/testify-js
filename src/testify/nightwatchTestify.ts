import {Testify,TestCase} from './testify'
import {NightwatchBrowser} from 'nightwatch'

/**
 * Testify imbues with Nightwatch browser API to perform expectations.
 */
export class NightwatchTestify{

    private testify : Testify;
    private browser : NightwatchBrowser;

    constructor(testifyBaseUrl : string, browser : NightwatchBrowser){
        this.testify = new Testify(testifyBaseUrl);
        this.browser = browser;
    }


   getTestCase(name) : NightwatchTestCase{
        return new NightwatchTestCase(name,this.testify.baseUrl,this.browser);
    }
}


export class NightwatchTestCase{
    testCase : TestCase;
    browser : NightwatchBrowser;

    constructor(name,baseUrl,browser){
        this.testCase = new TestCase(name,baseUrl);
        this.browser = browser;
    }

    async start(callback : (data:any)=>void = null){
        this.browser.perform((browser,done) => {
            this.testCase.start().then((data) =>{
                if(callback){
                    callback(data);
                }
                (browser as any).assert.equal(data.status,200, this.testCase.name + " - STARTED");
                done();
            }).catch((data) => {
                console.log(data);
                if(data.response){
                    (browser as any).assert.equal(data.response.status,200,"Test case start request failed: "+ this.testCase.name);
                }else{
                    browser.assert.ok(false,"Test case start request failed: "+ this.testCase.name);
                }
                done();
            });
        });
    }

    async statement(name, callback : (data:any)=>void = null){
        this.browser.perform((browser,done) => {
            this.testCase.statement(name).then((data) =>{
                if(callback){
                    callback(data);
                }
                (browser as any).assert.equal(data.status,200);
                done();
            }).catch((data) => {
                console.log(data);
                if(data.response){
                    (browser as any).assert.equal(data.response.status,200,"Statement failed: "+ this.testCase.name+ "::" + name);
                }else{
                    browser.assert.ok(false,"Statement failed failed: "+ this.testCase.name + "::" + name);
                }
                done();
            });
        });
    }

    async end(){
        this.browser.perform((browser,done) => {
            this.testCase.end().then((data) =>{
                (browser as any).assert.equal(data.status,200);
                done();
            }).catch((data) => {
                console.log(data);
                if(data.response){
                    (browser as any).assert.equal(data.response.status,200,"End failed: "+ this.testCase.name);
                }else{
                    browser.assert.ok(false,"End failed failed: "+ this.testCase.name);
                }
                done();
            });
        });
    }

}