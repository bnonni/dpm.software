import { Web5 } from '@web5/api';
import dpm from '../../src/utils/protocol.js';

const password = 'correct horse battery staple';
const dwnEndpoints = ['http://localhost:3000'];

const { web5, did } = await Web5.connect({
  password,
  sync             : '30s',
  techPreview      : { dwnEndpoints },
  didCreateOptions : { dwnEndpoints }
});
console.log('Connected to Web5 => did', did);
console.log('Connected to Web5 => agentDid', web5.agent.agentDid.uri);

const dwn = web5.dwn;

async function configure(){
  const { status, protocol = null } = await dwn.protocols.configure({message: { definition: dpm }});
  console.log('protocols.configure => status', status);
  console.log('protocols.configure => protocol', protocol);


  if (!protocol) {
    console.error('protocols.configure => protocol is null => status', status);
    throw new Error('Failed to configure protocol');
  }
  const { status: send } = await protocol.send(did);
  console.log('protocol.send => status', send);
}

async function query(){
  const { status, protocols = [] } = await dwn.protocols.query({
    message : { filter: { protocol: dpm.protocol } }
  });
  console.log('protocols.query => status', status);

  if (!protocols.length) {
    console.error('protocols.query => no protocols => status', status);
    throw new Error('Failed to query protocols');
  }
  await Promise.all(protocols.map(async protocol => {
    const json = protocol.toJSON();
    console.log('protocols.configure => protocol', json);
    console.log('protocols.configure => protocol.descriptor', json.descriptor);
  }));
}

console.log('process.argv', process.argv);
const command = process.argv.slice(2);
if (command.includes('configure')) {
  console.log('Configuring protocol');
  await configure();
} else {
  console.log('Querying protocols');
  await query();
}