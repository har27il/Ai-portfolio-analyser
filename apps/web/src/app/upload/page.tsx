'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';

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
      const text = await file.text();
      setResult({
        success: true,
        message: `"${file.name}" parsed successfully`,
        rows: text.split('\n').length - 1,
        fileName: file.name,
      });
    } catch {
      setResult({ success: false, message: 'Failed to parse file. Please check the format.' });
    }
    setUploading(false);
  };

  const brokers = [
    { id: 'zerodha', label: 'Zerodha', icon: '📊' },
    { id: 'groww', label: 'Groww', icon: '📈' },
    { id: 'upstox', label: 'Upstox', icon: '📉' },
    { id: 'generic', label: 'Generic', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 border-b-[3px] border-black/20">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white border-2 border-transparent hover:border-black/20 transition-all">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-black uppercase tracking-wider">Upload Portfolio</h1>
      </header>

      <main className="px-5 space-y-4">
        {/* Broker Selection */}
        <div>
          <p className="section-title px-1 mb-2">Select Broker</p>
          <div className="grid grid-cols-4 gap-2">
            {brokers.map(b => (
              <button
                key={b.id}
                onClick={() => setBroker(b.id)}
                className={`card !p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-all ${
                  broker === b.id
                    ? '!bg-card-dark text-white !border-[3px] !border-black/40 shadow-[4px_4px_0px_rgba(0,0,0,0.4)]'
                    : 'hover:shadow-card-lg hover:-translate-y-0.5'
                }`}
              >
                <span className="text-xl">{b.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-wider">{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div
          className={`card !p-0 overflow-hidden transition ${dragActive ? 'ring-2 ring-accent ring-offset-2' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-emerald-50 border-[3px] border-black/30 shadow-[3px_3px_0px_rgba(0,0,0,0.2)] flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold">{file.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="text-xs text-red-500 font-medium mt-3 hover:text-red-600"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-gray-100 border-[3px] border-black/30 shadow-[3px_3px_0px_rgba(0,0,0,0.2)] flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold mb-0.5">Drop your file here</p>
              <p className="text-xs text-gray-400 mb-4">CSV, XLSX, XLS — max 10MB</p>
              <label className="btn-primary cursor-pointer inline-block">
                Browse Files
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {file && !result && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full btn-primary py-3.5 disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Upload & Parse'
            )}
          </button>
        )}

        {/* Result */}
        {result && (
          <div className={`card ${result.success ? 'border-l-4 border-emerald-500' : 'border-l-4 border-red-500'}`}>
            <p className={`text-sm font-semibold ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
              {result.success ? 'Success!' : 'Error'}
            </p>
            <p className="text-xs text-gray-500 mt-1">{result.message}</p>
            {result.success && (
              <div className="flex items-center gap-2 mt-3">
                <span className="pill-muted">{result.rows} rows</span>
                <Link href="/dashboard" className="btn-primary !py-1.5 !px-3 !text-xs">
                  View Dashboard →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="card">
          <p className="text-sm font-semibold mb-3">How to Export</p>
          <div className="space-y-3">
            {[
              { broker: 'Zerodha', steps: 'Console → Holdings → Download CSV' },
              { broker: 'Groww', steps: 'Stocks → Holdings → Export → Download' },
              { broker: 'Generic', steps: 'CSV with columns: Symbol, Name, Quantity, Avg Cost' },
            ].map(item => (
              <div key={item.broker} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold">{item.broker}</p>
                  <p className="text-[10px] text-gray-400">{item.steps}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="upload" />
    </div>
  );
}
