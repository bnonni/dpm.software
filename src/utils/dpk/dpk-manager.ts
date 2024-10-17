import { DidDht, DidWeb, UniversalResolver } from '@web5/dids';
import { DRPM_DWN_URL } from '../../config.js';
import { DrlBuilder } from '../drpm/drl-builder.js';
import { ResponseUtils } from '../drpm/dwn-response.js';
import { Logger } from '../logger.js';
import { DpkData, DpkFetchParams, DpkRequest, DpkResponse } from '../types.js';
import { DpkRegistry } from './dpk-registry.js';

const DidResolver = new UniversalResolver({ didResolvers: [DidDht, DidWeb] });

export class DpkManager {
  // Get DWeb Node endpoints from Did Doc on respective network based on DID Method
  static async getDwnEndpoints(did: string) {
    const { didDocument } = await DidResolver.resolve(did);
    const services = didDocument?.service;
    const didServiceEndpoint = services?.find(service => service.type === 'DecentralizedWebNode')?.serviceEndpoint ?? [DRPM_DWN_URL];
    const serviceEndpoints = Array.isArray(didServiceEndpoint) ? didServiceEndpoint : [didServiceEndpoint];
    return serviceEndpoints.map(endpoint => endpoint.replace(/\/$/, ''));
  }

  // Fetch DPK metadata from DWeb Node DRPM protocol at /package protocol path
  static async fetchPackage({ drl, name, version }: DpkFetchParams): Promise<DpkResponse> {
    try {
      const response: Response = await fetch(drl);
      if (ResponseUtils.fetchFail(response)) {
        Logger.error(
          'DpkManager: DWeb Node package response not ok',
          response
        );
        return {
          ok     : false,
          code   : 404,
          status : 'Not found',
          error  : response.statusText
        };
      }

      const data = await response.json();
      if (!data) {
        Logger.error(
          'DpkManager: DWeb Node request failed - no response data',
          response
        );
        return {
          ok     : false,
          code   : 404,
          status : 'Not found',
          error  : 'No json data'
        };
      }

      if(!await DpkRegistry.saveDpkMetadata({name, version, data})) {
        Logger.error('DpkManager: Failed to save metadata');
        return {
          ok     : false,
          code   : 404,
          status : 'Not found',
          error  : 'Failed to save metadata'
        };
      }

      return {
        ok     : true,
        code   : 200,
        status : 'OK',
        data
      };
    } catch(error: any) {
      Logger.error('DpkManager: DWeb Node request failed', error);
      return {
        ok     : false,
        code   : 404,
        status : 'Not Found',
        error  : error.message
      };
    }
  }

  // Fetch DPK release from DWeb Node DRPM protocol at package/release protocol path
  static async fetchPackageRelease({ drl, name, version }: DpkFetchParams): Promise<DpkResponse> {
    try {
      const response: Response = await fetch(drl);
      if (ResponseUtils.fetchFail(response)) {
        Logger.error(
          'DpkManager: DWeb Node package/release request error - response fail',
          response
        );
        return {
          ok     : false,
          code   : 404,
          status : 'Not found',
          error  : response.statusText
        };
      }
      if (response.headers.get('content-type') !== 'application/octet-stream') {
        Logger.error(
          'DpkManager: DWeb Node package/release request error - bad content-type',
          response
        );
        return {
          ok     : false,
          code   : 404,
          status : 'Not found',
          error  : `Bad content-type: ${response.headers.get('content-type')}`
        };
      }
      if(!await DpkRegistry.saveDpkTarball({name, version, data: response})) {
        Logger.error('DpkManager: Failed to save package/release tarball');
        return {
          ok     : false,
          code   : 404,
          status : 'Not found',
          error  : 'Failed to save package/release tarball'
        };
      }

      return {
        ok     : true,
        code   : 200,
        status : 'OK',
        data   : response
      };
    } catch(error: any) {
      Logger.error('DpkManager: DWeb Node request failed', error);
      return {
        ok     : false,
        code   : 404,
        status : 'Not Found',
        error  : error.message
      };
    }
  }

  static async fetchBoth({ did, dpk: { name, version }}: DpkRequest): Promise<DpkResponse> {
    try {
      const responses: DpkData = { 'package': null, 'package/release': null };

      for(const path of ['package', 'package/release']) {
        const response: DpkResponse = await this.fetchDpk({ did, dpk: { name, version, path }});

        if(ResponseUtils.fail(response)) {
          Logger.error(
            `DpkManager: DWeb Node ${path} request error - response fail`,
            response
          );
          return {
            ok     : false,
            code   : 404,
            status : 'Not found',
            error  : response.error
          };
        }
        responses[path] = response.data;
      }

      return {
        ok     : true,
        code   : 200,
        status : 'OK',
        data   : responses
      };
    } catch(error: any) {
      Logger.error('DpkManager: DWeb Node request failed', error);
      return {
        ok     : false,
        code   : 404,
        status : 'Not Found',
        error  : error.message
      };
    }
  }

  // Fetch DPK from DWeb Node: either metadata or release
  static async fetchDpk({ did, dpk: { name, version, path }}: DpkRequest): Promise<DpkResponse> {
    try {
      for (const endpoint of await this.getDwnEndpoints(did)) {

        const builder = DrlBuilder.create({ endpoint, did });
        const drl = path === 'package'
          ? builder.buildPackageDrl({ name, version })
          : builder.buildPackageReleaseDrl({ name, version });

        Logger.debug(`DpkManager: Fetching DRL ${drl} for DPK ${name}@${version} ...`);

        const response: DpkResponse = path === 'package'
          ? await this.fetchPackage({ drl, name, version })
          : await this.fetchPackageRelease({ drl, name, version });

        if (ResponseUtils.fail(response)) {
          Logger.error(
            `DpkManager: DWeb Node request error - response fail, continuing ...`,
            response
          );
          continue;
        }

        if(!response.data) {
          Logger.error(
            'DpkManager: DWeb Node request error - no response data, continuing ...',
            response
          );
          continue;
        }

        return {
          ok     : true,
          code   : 200,
          status : 'OK',
          data   : response
        };
      }

      return {
        ok     : false,
        code   : 404,
        status : 'Not found'
      };
    } catch(error: any) {
      Logger.error('DpkManager: DWeb Node request failed:', error);
      return {
        ok      : false,
        code    : 404,
        status  : 'Not Found',
        error  : error.message
      };
    }
  }
}