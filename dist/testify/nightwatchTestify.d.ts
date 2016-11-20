import { TestCase } from './testify';
import { NightWatchBrowser } from 'nightwatch';
/**
 * Testify imbues with Nightwatch browser API to perform expectations.
 */
export declare class NightwatchTestify {
    private testify;
    private browser;
    constructor(testifyBaseUrl: string, browser: NightWatchBrowser);
    getTestCase(name: any): NightwatchTestCase;
}
export declare class NightwatchTestCase {
    testCase: TestCase;
    browser: NightWatchBrowser;
    constructor(name: any, baseUrl: any, browser: any);
    start(callback?: (data: any) => void): Promise<void>;
    statement(name: any, callback?: (data: any) => void): Promise<void>;
    end(): Promise<void>;
}
