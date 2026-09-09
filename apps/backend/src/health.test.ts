import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './index';

describe('GET /health', () => {
  it('returns 200 with status ok and application metadata', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.app).toBe('Combination');
    expect(response.body.version).toBe('0.1.0');
    expect(response.body.timestamp).toBeDefined();
  });
});
