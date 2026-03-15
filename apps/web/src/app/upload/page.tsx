'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [broker, setBroker] = useState('generic');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // For MVP, simulate upload with client-side parsing
      const text = await file.text();
      setResult({
        success: true,
        message: `File "${file.name}" parsed successfully. ${text.split('\n').length - 1} rows detected.`,
        fileName: file.name,
      });
    } catch (err) {
      setResult({ success: false, message: 'Failed to parse file. Please check the format.' });
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <h1 className="text-lg font-bold">Upload Portfolio</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Broker Selection */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-3">Select Broker Format</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'zerodha', label: 'Zerodha' },
              { id: 'groww', label: 'Groww' },
              { id: 'upstox', label: 'Upstox' },
              { id: 'generic', label: 'Generic CSV' },
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setBroker(b.id)}
                className={`p-3 rounded-lg border text-sm font-medium transition ${
                  broker === b.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-3">Upload File</h2>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-red-500 mt-2 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag and drop your CSV or Excel file here</p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <label className="cursor-pointer bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-3">Supported: CSV, XLSX, XLS (max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Button */}
        {file && !result && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
          >
            {uploading ? 'Processing...' : 'Upload & Parse'}
          </button>
        )}

        {/* Result */}
        {result && (
          <div className={`bg-white rounded-xl border p-6 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
            <p className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
            {result.success && (
              <Link
                href="/dashboard"
                className="inline-block mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600"
              >
                View Dashboard →
              </Link>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-3">How to Export</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-900">Zerodha</p>
              <p>Go to Console → Holdings → Download CSV</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Groww</p>
              <p>Go to Stocks → Holdings → Export → Download</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Generic CSV</p>
              <p>Columns: Symbol, Name, Quantity, Avg Cost</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
