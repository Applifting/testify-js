export declare class Testify {
    /**
     * Base url of the server under the test. It should point to URL where testify is mounted.
     */
    baseUrl: string;
    /**
     * Command that is used to start local server.
     */
    startLocalServerCmd: string;
    /**
     * Frontend directory
     */
    frontendDir: string;
    /**
     * Command used for compiling the frontend. Relative to frontend directory.
     */
    compileFrontendCmd: string;
    /**
     * Paths to files/directories relative to frontend directory which should be used for checksum computation
     */
    frontendChecksumPaths: [string];
    /**
     * Do not recompile the frontend if the checksum of source files matches. Defaults to true;
     */
    fontendDoNotRecompile: boolean;
    private serverHandle;
    constructor(testifyBaseUrl: string);
    startLocalServerIfNotRunning(): Promise<boolean>;
    shutdownLocalServerIfRunning(): Promise<boolean>;
    isStarted(timeout?: number, keepTryingUntilTimeout?: boolean): Promise<boolean>;
    getTestCase(name: any): TestCase;
    readonly isOnLocalhost: boolean;
    private isStartedInternal(timeout, startMsec);
    private compileFrontendIfNeeded();
}
export declare class TestCase {
    baseUrl: string;
    name: string;
    constructor(name: any, baseUrl: any);
    start(): Promise<any>;
    statement(name: any): Promise<any>;
    end(): Promise<any>;
}
