import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const paths=['vite.config.js'];
function visit(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())visit(p);else if(entry.isFile()&&/\.[cm]?js$/.test(p))paths.push(p);}}
for(const dir of ['src','scripts','tests'])visit(dir);
for(const path of paths.sort()){const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status!==0){process.stderr.write(result.stderr);process.exit(1);}}
console.log(`JavaScript syntax checked: ${paths.length} files.`);
