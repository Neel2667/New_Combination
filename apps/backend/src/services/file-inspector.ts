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
}

export class FileInspector {
  static async inspect(filePath: string): Promise<InspectionResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const mimeType = await this.getMimeType(filePath);
    
    const type = this.mapMimeType(mimeType);
    if (!type) {
      throw new Error(`Unsupported media type: ${mimeType}`);
    }

    const metadata = await this.getMetadata(filePath);

    return {
      type,
      ...metadata,
    };
  }

  private static async getMimeType(filePath: string): Promise<string> {
    const { stdout } = await execFileAsync('file', ['-b', '--mime-type', filePath]);
    return stdout.trim();
  }

  private static mapMimeType(mimeType: string): SupportedMediaType | null {
    if (mimeType === 'image/svg+xml') return 'svg';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return null;
  }

  private static async getMetadata(filePath: string): Promise<Partial<InspectionResult>> {
    try {
      const { stdout } = await execFileAsync('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
      ]);
      const data = JSON.parse(stdout);
      
      const videoStream = data.streams?.find((s: Record<string, unknown>) => s.codec_type === 'video');
      const audioStream = data.streams?.find((s: Record<string, unknown>) => s.codec_type === 'audio');

      const result: Partial<InspectionResult> = {};

      if (videoStream) {
        if (videoStream.width) result.width = videoStream.width;
        if (videoStream.height) result.height = videoStream.height;
        
        if (result.width && result.height) {
          result.aspectRatio = result.width / result.height;
        }

        if (videoStream.pix_fmt) {
          const fmt = videoStream.pix_fmt.toLowerCase();
          result.hasAlpha = fmt.includes('a') || fmt === 'pal8' || fmt === 'monob'; // sometimes palette implies alpha, but 'a' is sure. Let's just use 'a'
          result.hasAlpha = fmt.includes('a') || fmt.includes('rgba') || fmt.includes('yuva');
        }

        if (videoStream.duration) {
          result.durationMs = Math.round(parseFloat(videoStream.duration) * 1000);
        } else if (data.format?.duration) {
          result.durationMs = Math.round(parseFloat(data.format.duration) * 1000);
        }
      } else if (audioStream) {
        if (audioStream.duration) {
          result.durationMs = Math.round(parseFloat(audioStream.duration) * 1000);
        } else if (data.format?.duration) {
          result.durationMs = Math.round(parseFloat(data.format.duration) * 1000);
        }
      }

      return result;
    } catch {
      // ffprobe failed, return empty metadata (allow fallback to optional fields, except for where strictness is required)
      return {};
    }
  }
}
