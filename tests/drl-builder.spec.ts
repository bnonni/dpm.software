import { DrlBuilder } from '../src/utils/drpm/drl-builder.js';

const path = process.argv.slice(2)?.[0];
const did = 'did:dht:8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo';
const name = 'tool5';
const version = '6.1.0';
const builder = DrlBuilder.create({ endpoint: 'http://localhost:3000', did });
const drl = path === 'package'
  ? builder.buildPackageDrl({ name, version })
  : builder.buildPackageReleaseDrl({ name, version });

console.log(drl);