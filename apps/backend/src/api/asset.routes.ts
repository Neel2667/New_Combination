import { Router } from 'express';
import multer from 'multer';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { AssetController } from './asset.controller';
import { AssetIngestionService } from '../services/asset-ingestion.service';
import { AssetService } from '../services/asset.service';
import { LocalFilesystemStorage } from '../storage/local-filesystem-storage';
import { AssetRepository } from '../repositories/asset.repository';
import { db } from '../db';

const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vce-uploads-'));
const upload = multer({ dest: uploadDir });

export function createAssetRouter(): Router {
  const router = Router();
  
  // Dependency injection setup
  const assetRepository = new AssetRepository(db);
  const assetService = new AssetService(assetRepository);
  const storageRoot = process.env.ASSET_STORAGE_ROOT || path.join(process.cwd(), 'data', 'assets');
  const assetStorage = new LocalFilesystemStorage(storageRoot);
  const assetIngestionService = new AssetIngestionService(assetService, assetRepository, assetStorage);
  
  const controller = new AssetController(assetIngestionService, assetService, assetStorage);

  router.post('/', upload.single('file'), controller.upload);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.get('/:id/content', controller.getContent);
  router.delete('/:id', controller.delete);

  return router;
}
