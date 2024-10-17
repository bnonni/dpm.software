import  { Request } from 'express';
import { DPK_VERSION_PREFIXES } from '../../config.js';

export class DrgRouteUtils {
  static isPrefixed(semver: string): boolean {
    return DPK_VERSION_PREFIXES.some(prefix => semver.startsWith(prefix));
  }

  static findPrefix(prefixed: string): { version: string, prefix: string } {
    const prefix = DPK_VERSION_PREFIXES.find(prefix => prefixed.startsWith(prefix));
    return !prefix
      ? { version: prefixed, prefix: '' }
      : { version: prefixed.slice(prefix.length), prefix };
  }

  static checkReqParams(params: Request['params']): string[][] {
    return Object.entries(params).filter(([k, v]) => !v && k);
  }
}