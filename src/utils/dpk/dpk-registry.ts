import { createWriteStream } from 'fs';
import { ensureDir, exists } from 'fs-extra';
import { access, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { Logger } from '../logger.js';
import { DrgGetDpkPath, DrgSaveDpkData } from '../types.js';
import { DRG_DIR } from '../../config.js';

export class DpkRegistry {
  // Saves the tarball file to path $HOME/.drpm/@drg/dpk/version/dpk-version.tgz
  static async saveDpkTarball({ name, version, data }: DrgSaveDpkData): Promise<boolean> {
    const dpkAtVersionPath = this.getDpkVersionPath({name, version});
    try {
      await this.ensureDpkDir(dpkAtVersionPath);
      Logger.info(`Ensured dir at ${dpkAtVersionPath}`);
    } catch (error: any) {
      Logger.error(`Failed to ensure dir at ${dpkAtVersionPath}`, error);
      return false;
    }

    const dpkTarballPath = this.getDpkTarballPath({name, version});
    try {
      Logger.log(`Saving tarball to ${dpkTarballPath} ...`);
      await pipeline(data, createWriteStream(dpkTarballPath));
      return true;
    } catch (error) {
      Logger.error(`Failed to save dpk tarball to ${dpkTarballPath} `, error);
      return false;
    }
  }

  // Saves the metadata file to path $HOME/.drpm/@drg/dpk/version/metadata.json
  static async saveDpkMetadata({ name, version, data }: DrgSaveDpkData): Promise<boolean> {
    const dpkAtVersionPath = this.getDpkVersionPath({name, version});
    try {
      await this.ensureDpkDir(dpkAtVersionPath);
    } catch (error: any) {
      Logger.error(`DpkRegistry: saveDpkMetadata - Failed to ensure dir at ${dpkAtVersionPath}`, error);
      return false;
    }

    const dpkMetadataPath = this.getDpkMetadataPath({name, version});
    try {
      await writeFile(dpkMetadataPath, JSON.stringify(data, null, 2));
      Logger.info(`Saved metadata to ${dpkMetadataPath}`);
      return true;
    } catch (error: any) {
      Logger.error(`DpkRegistry: saveDpkMetadata - Failed to save dpk metadata to ${dpkMetadataPath} `, error);
      return false;
    }
  }

  // Ensure the path to the $HOME/.drpm/@drg/{dpk, dpk/version} directory exists
  static async ensureDpkDir(path: string): Promise<any> {
    try {
      await ensureDir(path);
      Logger.info(`Ensured dir at ${path}`);
      return true;
    } catch (error: any) {
      Logger.error(`DpkRegistry: ensureDpkDir - Failed to ensure dir at ${path}`, error);
      throw error;
    }
  }

  // Get the path to the $HOME/.drpm/@drg/dpk/version directory
  static getDpkVersionPath({name, version}: DrgGetDpkPath): string {
    Logger.info(`Getting dpkVersion dir path for ${name}@${version}`);
    return join(DRG_DIR, name, version);
  };

  // Get the path to the $HOME/.drpm/@drg/dpk/version/metadata.json file
  // e.g. /Users/username/.drpm/@drg/tool5/6.1.0/metadata.json
  static getDpkMetadataPath({name, version}: DrgGetDpkPath): string {
    Logger.info(`Getting metadata path for ${name}@${version}`);
    return join(DRG_DIR, name, version, 'metadata.json');
  };

  // Get the path to the $HOME/.drpm/@drg/dpk/version/dpk-version.tgz file
  // e.g. /Users/username/.drpm/@drg/tool5/6.1.0/tool5-6.1.0.tgz
  static getDpkTarballPath({name, version}: DrgGetDpkPath): string {
    Logger.info(`Getting tarball path for ${name}@${version}`);
    return join(DRG_DIR, name, version, `${name}-${version}.tgz`);
  };

  // Loads the metadata file from path $HOME/.drpm/@drg/dpk/version/metadata.json
  static async loadDpkMetadata(path: string): Promise<any> {
    try {
      if(!await exists(path)) {
        Logger.info(`DpkRegistry: loadDpkMetadata - metadata.json does not exist at path ${path}`);
        return null;
      }
      await access(path);
      const metadata = JSON.parse(await readFile(path, 'utf8'));
      return metadata;
    } catch (error: any) {
      Logger.error(`DpkRegistry: loadDpkMetadata - metadata.json does not exist at path ${path}`, error);
      throw error;
    }
  };

  // Loads the tarball file from path $HOME/.drpm/@drg/dpk/version/dpk-version.tgz file
  static async loadDpkTarball(path: string): Promise<any> {
    try {
      if(!await exists(path)) {
        return null;
      }
      await access(path);
      return path;
    } catch (error: any) {
      Logger.error(`DpkRegistry: loadDpkTarball - tgz files does not exist at path ${path}`, error);
      throw error;
    }
  };
}


