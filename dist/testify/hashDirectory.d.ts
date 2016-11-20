/**
 *
 */
declare var Q: any;
declare var fs: any;
declare var path: any;
declare var crypt: any;
declare function hashdirectory(dir: any, callback: any): any;
declare function hashdirectorySync(dir: any): any;
declare var stat: any;
declare function hashDirectoryItem(filepath: any): any;
declare function hashDirectoryItemSync(filepath: any): any;
declare var readdir: any;
declare function hashDirectory(filepath: any): any;
declare function hashDirectorySync(filepath: any): any;
declare function hashFile(filepath: any, stats: any): any;
declare function hashFileSync(filepath: any, stats: any): {
    type: string;
    path: any;
    name: any;
    hash: any;
    mode: string;
};
