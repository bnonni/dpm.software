import { readFile } from 'fs/promises';
import { join } from 'path';
import dwn from './utils/drpm/drpm-protocol.js';
import { DrlBuilder } from './utils/drpm/drl-builder.js';

export const CWD = process.cwd();
export const HOME = process.env.HOME;
export const DRPM_PORT = process.env.DRPM_DRG_PORT_DEFAULT || process.env.PORT || 2092;
export const DRPM_HOME = process.env.DRPM_HOME || `${HOME}/.drpm`;
export const DRG_HOSTNAME = process.env.DRPM_DRG_HOSTNAME || 'local.drg.drpm.tools';
export const DRPM_DWN_URL = 'https://dwn.drpm.tools/';
export const DRG_URL = process.env.DRPM_DRG_URL || `http://${DRG_HOSTNAME}`;
export const DRG_PREFIX = process.env.DRPM_DRG_PREFIX || 'drg:registry';
export const DPK_PREFIX = process.env.DRPM_DPK_PREFIX || 'dpk:registry';

export const GLOBAL_NPMRC_FILE = process.env.GLOBAL_NPMRC_FILE || `${HOME}/.npmrc`;
export const LOCAL_NPMRC_FILE = process.env.LOCAL_NPMRC_FILE || `${CWD}/.npmrc`;
export const GLOBAL_DRPMRC_FILE = process.env.GLOBAL_DRPMRC_FILE || `${DRPM_HOME}/.drpmrc`;
export const LOCAL_DRPMRC_FILE = process.env.LOCAL_DRPMRC_FILE || `${CWD}/.drpmrc`;

export const NPMRC_PREFIXES = process.env.DRPM_NPMRC_PREFIXES || [
  `@${DRG_PREFIX}=${DRG_URL}`,
  `${DRG_PREFIX}=${DRG_URL}`,
  `@${DPK_PREFIX}=${DRG_URL}`,
  `${DPK_PREFIX}=${DRG_URL}`
];
export const DRG_DIR = process.env.DRPM_DRG_DIR || join(DRPM_HOME, `@drg`);
export const REGISTRYD_PID_FILE_NAME = 'registryd.pid';
export const REGISTRYD_PID_FILE_PATH = join(DRPM_HOME, REGISTRYD_PID_FILE_NAME);
export const REGISTRYD_PID = await readFile(REGISTRYD_PID_FILE_PATH, 'utf8') ?? process.ppid ?? 0;
export const DRPM_PROTOCOL_B64URL = DrlBuilder.base64urlEncode(dwn.protocol);
export const DRL_PROTOCOL_PARAM = `read/protocols/${DRPM_PROTOCOL_B64URL}`;
export const DPK_VERSION_PREFIXES = ['~', '^', '<', '>', '<=', '>=', '=', '-', '@'];

export default {
  CWD,
  HOME,
  DRPM_PORT,
  DRPM_HOME,
  DRG_HOSTNAME,
  DRPM_DWN_URL,
  DRG_URL,
  GLOBAL_NPMRC_FILE,
  LOCAL_NPMRC_FILE,
  GLOBAL_DRPMRC_FILE,
  LOCAL_DRPMRC_FILE,
  REGISTRYD_PID,
  REGISTRYD_PID_FILE_PATH,
  REGISTRYD_PID_FILE_NAME,
  DRG_DIR,
  DRPM_PROTOCOL_B64URL,
  DRL_PROTOCOL_PARAM,
  NPMRC_PREFIXES
};