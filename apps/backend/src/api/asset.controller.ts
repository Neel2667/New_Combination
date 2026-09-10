import { Request, Response } from 'express';
import * as fs from 'fs';
import { AssetIngestionService } from '../services/asset-ingestion.service';
import { AssetService } from '../services/asset.service';
import { AssetStorage } from '../storage/asset-storage.interface';
import { AssetUploadRequestSchema } from '@combination/shared';

export class AssetController {
  constructor(
    private readonly assetIngestionService: AssetIngestionService,
    private readonly assetService: AssetService,
    private readonly assetStorage: AssetStorage
  ) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      
      const parsedBody = AssetUploadRequestSchema.safeParse(req.body);
      if (!parsedBody.success) {
        res.status(400).json({ error: 'Invalid metadata', details: parsedBody.error.format() });
        return;
      }

      const source = JSON.parse(parsedBody.data.source);
      const license = JSON.parse(parsedBody.data.license);
      const visual = parsedBody.data.visual ? JSON.parse(parsedBody.data.visual) : undefined;

      const asset = await this.assetIngestionService.ingest({
        filePath: req.file.path,
        source,
        license,
        visual
      });

      res.status(201).json(asset);
    } catch (error) {
      const e = error as Error;
      if (e.message?.includes('Duplicate asset')) {
        res.status(409).json({ error: e.message });
      } else {
        res.status(500).json({ error: e.message });
      }
    } finally {
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path).catch(() => {});
      }
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
      
      const items = await this.assetService.listAssets({ limit, offset: (page - 1) * limit });
      res.status(200).json({ items, total: items.length });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const asset = await this.assetService.getAssetById(req.params.id);
      if (!asset) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }
      res.status(200).json(asset);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const asset = await this.assetService.getAssetById(req.params.id);
      if (!asset) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      const stream = await this.assetStorage.getStream(asset.id);
      
      let contentType = 'application/octet-stream';
      if (asset.media.mimeType) {
        contentType = asset.media.mimeType;
      } else if (asset.type === 'image') {
        contentType = 'image/png';
      } else if (asset.type === 'video') {
        contentType = 'video/mp4';
      } else if (asset.type === 'audio') {
        contentType = 'audio/mpeg';
      }

      res.setHeader('Content-Type', contentType);
      stream.pipe(res);
    } catch (error) {
      const e = error as Error;
      if (e.name === 'StorageObjectNotFound') {
        res.status(404).json({ error: 'Physical asset not found' });
      } else {
        res.status(500).json({ error: e.message });
      }
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const asset = await this.assetService.getAssetById(req.params.id);
      if (!asset) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      // 1. Delete physical storage first.
      await this.assetStorage.delete(asset.id);
      
      // 2. Delete database record next.
      await this.assetService.deleteAsset(asset.id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
