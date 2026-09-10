import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execFileAsync = promisify(execFile);

export type SupportedMediaType = 'image' | 'video' | 'audio' | 'svg';

export interface InspectionResult {
  type: SupportedMediaType;
  width?: number;
  height?: number;
  durationMs?: number;
  hasAlpha?: boolean;
  aspectRatio?: number;
  mimeType?: string;
}

export class FileInspector {
  static async inspect(filePath: string): Promise<InspectionResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`FileNotFound: ${filePath}`);
    }

    const mimeType = await this.getMimeType(filePath);
    
    const type = this.mapMimeType(mimeType);
    if (!type) {
      throw new Error(`Unsupported media type: ${mimeType}`);
    }

    let metadata: Partial<InspectionResult> = {};
    if (type !== 'svg') {
      metadata = await this.getMetadata(filePath);
    }

    return {
      type,
      mimeType,
      ...metadata,
    };
  }

  private static async getMimeType(filePath: string): Promise<string> {
    try {
      const { stdout } = await execFileAsync('file', ['-b', '--mime-type', '--', filePath]);
      return stdout.trim();
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      if (error.code === 'ENOENT') {
        throw new Error(`DependencyError: 'file' command is not available.`);
      }
      throw new Error(`MediaInspectionError: Failed to determine mime type: ${error.message}`);
    }
  }

  private static mapMimeType(mimeType: string): SupportedMediaType | null {
    if (mimeType === 'image/svg+xml') return 'svg';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return null;
  }

  private static async getMetadata(filePath: string): Promise<Partial<InspectionResult>> {
    let stdout: string;
    try {
      const result = await execFileAsync('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        '--',
        filePath
      ]);
      stdout = result.stdout;
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      if (error.code === 'ENOENT') {
        throw new Error(`DependencyError: 'ffprobe' command is not available.`);
      }
      throw new Error(`MediaInspectionError: ffprobe failed to parse file: ${error.message}`);
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(stdout);
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      throw new Error(`MediaInspectionError: ffprobe output is not valid JSON: ${error.message}`);
    }

    if (!Array.isArray(data.streams) || data.streams.length === 0) {
      throw new Error(`MediaInspectionError: ffprobe found no streams in file.`);
    }

    const videoStream = (data.streams as Record<string, unknown>[]).find((s: Record<string, unknown>) => s.codec_type === 'video');
    const audioStream = (data.streams as Record<string, unknown>[]).find((s: Record<string, unknown>) => s.codec_type === 'audio');

    const result: Partial<InspectionResult> = {};

    if (videoStream) {
      if (typeof videoStream.width === 'number') result.width = videoStream.width;
      if (typeof videoStream.height === 'number') result.height = videoStream.height;
      
      if (result.width && result.height) {
        result.aspectRatio = result.width / result.height;
      }

      if (typeof videoStream.pix_fmt === 'string') {
        const fmt = videoStream.pix_fmt.toLowerCase();
        // Determine alpha channel presence reliably based on pixel format string containing 'a'
        if (fmt.includes('a')) {
          result.hasAlpha = true;
        }
      }

      if (typeof videoStream.duration === 'string') {
        result.durationMs = Math.round(parseFloat(videoStream.duration) * 1000);
      } else if (data.format && typeof (data.format as Record<string, unknown>).duration === 'string') {
        result.durationMs = Math.round(parseFloat((data.format as Record<string, unknown>).duration as string) * 1000);
      }
    } else if (audioStream) {
      if (typeof audioStream.duration === 'string') {
        result.durationMs = Math.round(parseFloat(audioStream.duration) * 1000);
      } else if (data.format && typeof (data.format as Record<string, unknown>).duration === 'string') {
        result.durationMs = Math.round(parseFloat((data.format as Record<string, unknown>).duration as string) * 1000);
      }
    } else {
       throw new Error(`MediaInspectionError: No video or audio stream found.`);
    }

    return result;
  }
}
