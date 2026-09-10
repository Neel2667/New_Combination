/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Request, Response } from 'express';
import { AssetController } from './asset.controller';



import * as fs from 'fs';
import * as path from 'path';

describe('AssetController', () => {
  let controller: AssetController;
  let mockIngestion: any;
  let mockAssetService: any;
  let mockStorage: any;
  
  beforeAll(() => {
    mockIngestion = { ingest: vi.fn() };
    mockAssetService = { deleteAsset: vi.fn(), getAssetById: vi.fn() };
    mockStorage = { delete: vi.fn() };
    controller = new AssetController(mockIngestion as any, mockAssetService as any, mockStorage as any);
  });

  const mockReq = (body: any, file?: any): Partial<Request> => ({ body, file });
  const mockRes = (): Partial<Response> => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
  };

  it('A. malformed source JSON -> 400', async () => {
    const req = mockReq({ source: 'bad-json', license: '{}' }, { path: '/tmp/f1' });
    const res = mockRes();
    await controller.upload(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Malformed JSON payload' }));
  });

  it('B. malformed license JSON -> 400', async () => {
    const req = mockReq({ source: '{}', license: 'bad' }, { path: '/tmp/f2' });
    const res = mockRes();
    await controller.upload(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Malformed JSON payload' }));
  });

  it('C. malformed visual JSON -> 400', async () => {
    const req = mockReq({ source: '{}', license: '{}', visual: 'bad' }, { path: '/tmp/f3' });
    const res = mockRes();
    await controller.upload(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Malformed JSON payload' }));
  });

  it('D. duplicate -> 409', async () => {
    mockIngestion.ingest.mockRejectedValueOnce(new Error('Duplicate asset'));
    const req = mockReq({ source: '{"name":"A","url":""}', license: '{"name":"A","url":"","status":"approved","commercialUse":true,"modificationAllowed":true,"attributionRequired":false}' }, { path: '/tmp/f4' });
    const res = mockRes();
    await controller.upload(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Duplicate asset') }));
  });

  it('H. delete removes DB record even if physical deletion fails', async () => {
    mockAssetService.getAssetById.mockResolvedValueOnce({ id: '123' });
    mockStorage.delete.mockRejectedValueOnce(new Error('Physical failure'));
    const req = { params: { id: '123' } } as unknown as Request;
    const res = mockRes();
    await controller.delete(req as Request, res as Response);
    expect(mockAssetService.deleteAsset).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('L. temporary upload is cleaned after success', async () => {
    const tmpPath = path.join(__dirname, 'tmp-success.bin');
    fs.writeFileSync(tmpPath, 'test');
    
    mockIngestion.ingest.mockResolvedValueOnce({ id: 'test' });
    const req = mockReq({ source: '{"name":"A","url":""}', license: '{"name":"A","url":"","status":"approved","commercialUse":true,"modificationAllowed":true,"attributionRequired":false}' }, { path: tmpPath });
    const res = mockRes();
    
    await controller.upload(req as Request, res as Response);
    
    expect(fs.existsSync(tmpPath)).toBe(false);
  });

  it('M. temporary upload is cleaned after failure', async () => {
    const tmpPath = path.join(__dirname, 'tmp-fail.bin');
    fs.writeFileSync(tmpPath, 'test');
    
    mockIngestion.ingest.mockRejectedValueOnce(new Error('Some failure'));
    const req = mockReq({ source: '{"name":"A","url":""}', license: '{"name":"A","url":"","status":"approved","commercialUse":true,"modificationAllowed":true,"attributionRequired":false}' }, { path: tmpPath });
    const res = mockRes();
    
    await controller.upload(req as Request, res as Response);
    
    expect(fs.existsSync(tmpPath)).toBe(false);
  });
});
