'use strict';

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { ensureDir } from 'fs-extra';
import { ResponseUtils } from '../utils/drpm/dwn-response.js';
import { Logger } from '../utils/logger.js';
import { DRG_DIR } from '../config.js';
import { DpkManager } from '../utils/dpk/dpk-manager.js';
import { DpkRegistry } from '../utils/dpk/dpk-registry.js';
import { DrgRouteUtils } from '../utils/drpm/drg-route-utils.js';
import { DpkData, DpkTarball } from '../utils/types.js';

await ensureDir(DRG_DIR).catch(err => Logger.error('Error ensuring registryd directory:', err));

const drg = express();
drg.use(cors());
drg.use(express.json());
drg.use(express.urlencoded({ extended: true }));
drg.use(express.raw({ type: 'application/octet-stream', limit: '10gb' }));
drg.use((req: Request, _: Response, next: NextFunction) => {
  Logger.log(`${req.method} ${req.url}`);
  next();
});

drg.get(['/', '/health'], (req: Request, res: Response) => {
  Logger.log(`[${req.baseUrl}/${req.path}] { ok: true }`);
  res.status(200).json({ ok: true });
});

// http://localhost:2092/@drg/did:dht/8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo/tool5/^6.1.0
// http://localhost:2092/drpm/dht/8w7ckznnw671az7nmkrd19ddctpj4spgt8sjqxkmnamdartxh1bo/aHR0cHM6Ly9kcG0uc29mdHdhcmUvcHJvdG9jb2xzL2RwbQ/package/release
drg.get('/:scope/:method/:id/:name/:version', async (req: Request, res: Response): Promise<any> => {

  const defaultError = 'Failed to fetch and save metadata';
  const route = req?.params[0] ?? '/:scope/:method/:id/:nameVersion';
  Logger.log(`${req.method} ${route}: ${req.url}`);
  const {_, method, id, name, version: semver} = req.params ?? {};

  try {
    const missing = DrgRouteUtils.checkReqParams({method, id, name, semver});
    if(missing.length > 0) {
      const missingString = missing.join(', ');
      Logger.error(`[${route}] Missing required params: ${missingString}`);
      return res.status(400).json({ error: `Missing required params: ${missingString}` });;
    }

    const { version, prefix } = DrgRouteUtils.isPrefixed(semver)
      ? DrgRouteUtils.findPrefix(semver)
      : { version: semver, prefix: '' };

    // TODO: Lookup prefix to determine valid version range and fetch tarball based on that
    const did = `did:${method ?? 'dht'}:${id}`;

    Logger.log('name, version, prefix', name, version, prefix);

    const metadataPath = DpkRegistry.getDpkMetadataPath({name, version});
    const metadata = await DpkRegistry.loadDpkMetadata(metadataPath);
    const tarballPath = DpkRegistry.getDpkTarballPath({name, version});
    const tarball = await DpkRegistry.loadDpkTarball(tarballPath);

    // Metadata (implies taball does not exist); fetch both
    if (!metadata) {
      Logger.debug(`Fetching metadata and tarball for ${name}@${version} ...`);

      const response = await DpkManager.fetchBoth({ did, dpk: { name, version, path: 'package' } });
      if(ResponseUtils.fail(response)) {
        Logger.error(`[${route}] Error fetching tarball:`, response.data);
        return res.status(404).json({ error: `${defaultError}: ${response.data}` });
      }

      Logger.info(`Saved metadata for ${name}@${version} to ${metadataPath}`);
      const data = response.data as DpkData;
      res.setHeader('Content-Type', 'application/octet-stream');
      return res.status(200).send(data['package/release'] as DpkTarball);
    }

    // Metadata exists, but tarball does not; fetch it
    if (!tarball) {
      Logger.debug(`Fetching tarball for ${name}@${version} ...`);

      const response = await DpkManager.fetchDpk({ did, dpk: { name, version, path: 'package/release' } });

      if(ResponseUtils.fail(response)) {
        Logger.error(`[${route}] Error fetching tarball:`, response.data);
        return res.status(404).json({ error: `${defaultError}: ${response.data}` });
      }
    }

    Logger.info(`Serving tarball ${tarballPath} ...`);
    return res.status(200).sendFile(tarballPath, { headers: { 'Content-Type': 'application/octet-stream' }});
  } catch (error: any) {
    Logger.error(`[${route}] Code 500 - Error fetching or saving metadata`, error);
    res.status(404).json({ error: `${defaultError}: ${error.message}` });
    return;
  }
});

export default drg;
