# Testify-js

A client side of a strongly opinionated e2e framework for executing test cases on a remote server.

It allows you to:

* Start yout server and make sure it is running
* Compile your front-end code only when you really need to
* Start server side test-cases and make sure that the database seeding and assertions completed
* Execute assertion statements on the server side anytime during your test suite

This library is intended to be used with [**NightWatch.js**](http://nightwatchjs.org/) and [**testify-rails**](https://github.com/Applifting/testify-rails) but it can be used separately.

The library is written in TypeScript.

# Instalation

Install library into your project by using yarn and typing:

```bash
yarn add testify-js
```

You can then import the `Testify` and `NightwatchTestify` class as follows:

```javascript
import {Testify, NightwatchTestify} from 'testify-js'
```

# Configuration

Please see the following `globals.ts` of Nightwatch how to configure the library:

```TypeScript

import {NightwatchBrowser} from 'nightwatch'
import {Testify, NightwatchTestify} from 'testify-js'
var selenium = require('selenium-download');
var settings = {

    'default' : {
        'launch_url' : 'http://localhost:5000'
    },

    before: function(done){
        //Create a new instance of testify, point it to the testify endpoint
        var testify = new Testify(this.launch_url+'/testify');
        // Optional configuration for starting the server
        testify.startLocalServerCmd = 'foreman start -f "../Procfile.e2e"';
        // Optional configuration for compiling the frontend
        testify.compileFrontendCmd = 'npm run build:production';
        testify.frontendDir = "../client";
        testify.frontendChecksumPaths = ["app","package.json"];
        //Save the testify instance into NightWatch globals
        this.testify = testify;
        //Start the server & compile the frontend if we are on the localhost
        if(testify.isOnLocalhost){
            testify.startLocalServerIfNotRunning().then((isRunning)=>{
                done();
            })
        }else{
            done();
        }
    },

    after: function(done){
        //Shutdown the server if it was started by testify
        (this.testify as Testify).shutdownLocalServerIfRunning().then(()=>{
            done();
        })

    },

    beforeEach: function(browser, done) {
        //Inject Testify with the Nightwatch BrowserAPI for making assertions
        browser.globals.testify = new NightwatchTestify(browser.globals.testify.baseUrl,browser);
        done();
    }
}

export = settings;

```

# Usage

You can then use testify to start test cases and evaluate statements on server side as follows:
```TypeScript
    export = {
        'It sets up a test case' : function(browser : NightwatchBrowser){
            var testify = browser.globals.testify as NightwatchTestify;
            //Will block until the test case starts and will report failure if something goes wrong
            testify.getTestCase("MyTestCase").start();
            browser.expect('#some').to.be.visibe
        },

        'It can execute statement' : function(browser : NightwatchBrowser){
            var testify = browser.globals.testify as NightwatchTestify;
            //Statements can be executed at any time. Will report failure if the code on the server fails.
            testify.getTestCase("MyTestCase").statement('ensure_user_is_present');
        }


    }
```



