import React, { useState } from 'react';
import { Asset } from '@combination/shared';
import { FileImage, FileVideo, FileAudio, File, Trash2, Info } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onDelete: (id: string) => void;
}

export function AssetCard({ asset, onDelete }: AssetCardProps) {
  const [showMetadata, setShowMetadata] = useState(false);

  const getIcon = () => {
    switch (asset.type) {
      case 'image': return <FileImage className="text-blue-500" size={24} />;
      case 'video': return <FileVideo className="text-purple-500" size={24} />;
      case 'audio': return <FileAudio className="text-green-500" size={24} />;
      default: return <File className="text-gray-500" size={24} />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)}s`;
    return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;
  };

  const resolution = asset.media.width && asset.media.height 
    ? `${asset.media.width}x${asset.media.height}`
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-200 transition-colors">
        {asset.type === 'image' ? (
          <img 
            src={`/api/assets/${asset.id}/content`} 
            alt="Asset Preview" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : asset.type === 'video' ? (
          <video 
            src={`/api/assets/${asset.id}/content`} 
            className="w-full h-full object-cover"
            controls
          />
        ) : (
          getIcon()
        )}
        
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowMetadata(!showMetadata)}
            className="p-1.5 bg-white/90 rounded-md shadow-sm text-gray-700 hover:text-blue-600 transition-colors"
            title="Toggle Metadata"
          >
            <Info size={16} />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this asset?')) {
                onDelete(asset.id);
              }
            }}
            className="p-1.5 bg-white/90 rounded-md shadow-sm text-gray-700 hover:text-red-600 transition-colors"
            title="Delete Asset"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            {getIcon()}
            {asset.type}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            asset.license.commercialUse ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {asset.license.name}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {resolution && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {resolution}
            </span>
          )}
          {asset.media.durationMs && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {formatDuration(asset.media.durationMs)}
            </span>
          )}
          {asset.source.name && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
              {asset.source.name}
            </span>
          )}
        </div>

        {showMetadata && (
          <div className="mt-4 pt-4 border-t border-dashed text-xs text-gray-600 space-y-1">
            <p><span className="font-medium">ID:</span> <span className="font-mono">{asset.id.split('-')[0]}...</span></p>
            <p><span className="font-medium">Imported:</span> {new Date(asset.importedAt).toLocaleDateString()}</p>
            <p className="truncate"><span className="font-medium">SHA:</span> <span className="font-mono">{asset.media.sha256.substring(0, 16)}...</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
