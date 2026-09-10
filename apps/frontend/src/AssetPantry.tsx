import React, { useEffect, useState } from 'react';
import { Asset, AssetListResponse } from '@combination/shared';
import { UploadModal } from './UploadModal';
import { AssetCard } from './AssetCard';
import { Plus, Library } from 'lucide-react';

export function AssetPantry() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (!res.ok) throw new Error('Failed to fetch assets');
      const data: AssetListResponse = await res.json();
      setAssets(data.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete asset');
      setAssets(assets.filter(a => a.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Library className="text-blue-600" />
            Visual Pantry
          </h1>
          <p className="text-gray-500 mt-1">Manage physical ingredients for compositions.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Upload Asset
        </button>
      </header>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
          Error loading assets: {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <Library className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Pantry is empty</h3>
          <p className="mt-1 text-sm text-gray-500">Upload visual assets to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)} 
          onSuccess={() => {
            setShowUpload(false);
            fetchAssets();
          }} 
        />
      )}
    </div>
  );
}
