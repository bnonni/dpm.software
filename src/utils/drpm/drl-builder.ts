import { DRPM_DWN_URL, DRL_PROTOCOL_PARAM } from '../../config.js';
import { Logger } from '../logger.js';
import { BaseDrl, DrlQuery } from '../types.js';

export class DrlBuilder {
  baseDrl: string;
  path: string = '';
  query: string = '';

  static base64urlEncode(data: any) {
    return Buffer.from(data).toString('base64url');
  }

  constructor({ endpoint, did }: BaseDrl) {
    if(!did) throw new Error('DID reqired to build DRL');
    if(!endpoint) Logger.warn('No DWN Endpoint Found! Using the default endpoint is not recommended.');
    this.baseDrl = `${endpoint ?? DRPM_DWN_URL}/${did}/${DRL_PROTOCOL_PARAM}`;
  }

  // Start building with base DRL
  static create({ endpoint, did }: BaseDrl): DrlBuilder {
    return new DrlBuilder({ endpoint, did });
  }

  // Add a package to the DRL path
  addPackage(): DrlBuilder {
    this.path = `${this.baseDrl}/package`;
    return this;
  }

  addPackageRelease(): DrlBuilder {
    this.addPackage();
    this.path = `${this.path}/release`;
    return this;
  }

  // Add query parameters (name and version)
  addQuery({ name, version }: DrlQuery): DrlBuilder {
    this.query = `?filter.tags.name=${name}&filter.tags.version=${version}`;
    return this;
  }

  // Build and return the final DRL
  build(): string {
    return `${this.path}${this.query}`;
  }

  // Build and return the final DRL
  buildPackageDrl({ name, version }: DrlQuery): string {
    if (!this.baseDrl) throw new Error('Base DRL not set');
    this.addPackage();
    return this.addQuery({ name, version }).build();
  }

  // Build and return the final DRL
  buildPackageReleaseDrl({ name, version }: DrlQuery): string {
    if (!this.baseDrl) throw new Error('Base DRL not set');
    this.addPackageRelease();
    return this.addQuery({ name, version }).build();
  }
}