'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import { fabric } from 'fabric';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { Save, Trash2 } from 'lucide-react';
import type { PDFPageProxy } from 'pdfjs-dist';
import { useSession } from 'next-auth/react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const fileUrl = searchParams.get('url');
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const signatureRef = useRef<fabric.Canvas | null>(null);
  const canvasInitialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSignaturePadReady, setIsSignaturePadReady] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [documentKey, setDocumentKey] = useState(Date.now()); // Untuk force re-render
  const [activeSignature, setActiveSignature] = useState<fabric.Group | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!fileUrl) {
        setError('No PDF file specified');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${fileUrl}?download=1`);
        if (!response.ok) throw new Error('Failed to fetch PDF');
        
        const blob = await response.blob();
        const dataUrl = URL.createObjectURL(blob);
        setPdfData(dataUrl);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    let signaturePad: fabric.Canvas | null = null;

    const initSignaturePad = () => {
      try {
        if (signatureRef.current) {
          signatureRef.current.dispose();
        }

        signaturePad = new fabric.Canvas('signatureCanvas', {
          isDrawingMode: true,
          width: 400,
          height: 200,
          backgroundColor: '#ffffff'
        });

        if (signaturePad.freeDrawingBrush) {
          signaturePad.freeDrawingBrush.width = 2;
          signaturePad.freeDrawingBrush.color = '#000000';
        }

        signatureRef.current = signaturePad;
        setIsSignaturePadReady(true);
      } catch (error) {
        console.error('Error initializing signature pad:', error);
      }
    };

    const timer = setTimeout(initSignaturePad, 100);

    return () => {
      clearTimeout(timer);
      if (signaturePad) {
        try {
          signaturePad.dispose();
        } catch (error) {
          console.error('Error disposing signature pad:', error);
        }
      }
    };
  }, []);

  const initPdfCanvas = useCallback((width: number, height: number) => {
    if (canvasInitialized.current || !width || !height) return;

    try {
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }

      const canvas = new fabric.Canvas('pdfCanvas', {
        width,
        height,
        backgroundColor: 'transparent',
        selection: true,
        preserveObjectStacking: true
      });

      canvas.on('object:moving', (e) => {
        const obj = e.target;
        if (!obj) return;

        const bound = obj.getBoundingRect();
        if (bound.top < 0) {
          obj.set('top', 0);
        }
        if (bound.left < 0) {
          obj.set('left', 0);
        }
        if (bound.top + bound.height > canvas.height!) {
          obj.set('top', canvas.height! - bound.height);
        }
        if (bound.left + bound.width > canvas.width!) {
          obj.set('left', canvas.width! - bound.width);
        }
      });

      canvasRef.current = canvas;
      canvasInitialized.current = true;
    } catch (error) {
      console.error('Error initializing PDF canvas:', error);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const handlePageRenderSuccess = useCallback((page: PDFPageProxy) => {
    const viewport = page.getViewport({ scale });
    initPdfCanvas(viewport.width, viewport.height);
  }, [scale, initPdfCanvas]);

  const clearSignature = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      signatureRef.current.backgroundColor = '#ffffff';
      signatureRef.current.renderAll();
    }
  }, []);

  const removeActiveSignature = useCallback(() => {
    if (!canvasRef.current || !activeSignature) return;
    
    canvasRef.current.remove(activeSignature);
    canvasRef.current.renderAll();
    setActiveSignature(null);
  }, [activeSignature]);

  const addSignatureToPdf = () => {
    if (!signatureRef.current || !canvasRef.current) return;

    // Ensure white background before getting data URL
    // signatureRef.current.backgroundColor = '#ffffff';
    signatureRef.current.renderAll();

    const signatureData = signatureRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    fabric.Image.fromURL(signatureData, (img) => {
      if (!canvasRef.current) return;

      const maxWidth = canvasRef.current.width! * 0.3;
      const maxHeight = canvasRef.current.height! * 0.2;
      const scale = Math.min(
        maxWidth / img.width!,
        maxHeight / img.height!
      );

      const scaledWidth = img.width! * scale;
      const scaledHeight = img.height! * scale;
      const padding = 20;

      const signatureGroup = new fabric.Group([], {
        left: canvasRef.current.width! * 0.1,
        top: canvasRef.current.height! * 0.1,
        originX: 'left',
        originY: 'top'
      });

      const border = new fabric.Rect({
        width: scaledWidth + (padding * 2),
        height: scaledHeight + (padding * 2) + 30,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 1,
        rx: 16,
        ry: 16,
        left: 0,
        top: 0
      });

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: padding,
        top: padding,
        originX: 'left',
        originY: 'top'
      });

      const signerName = new fabric.Text(session?.user?.name || 'Unknown', {
        fontSize: 12,
        fontFamily: 'Arial',
        top: scaledHeight + (padding * 1.5),
        left: (scaledWidth + (padding * 2)) / 2,
        originX: 'center',
        originY: 'top'
      });

      signatureGroup.addWithUpdate(border);
      signatureGroup.addWithUpdate(img);
      signatureGroup.addWithUpdate(signerName);

      signatureGroup.on('selected', () => {
        setActiveSignature(signatureGroup);
      });

      signatureGroup.on('deselected', () => {
        setActiveSignature(null);
      });

      canvasRef.current.add(signatureGroup);
      canvasRef.current.setActiveObject(signatureGroup);
      setActiveSignature(signatureGroup);
      canvasRef.current.renderAll();
      clearSignature();
    });
  };

  const saveSignedPdf = async () => {
    if (!canvasRef.current || !fileUrl) return;
    
    try {
      setIsSaving(true);

      const objects = canvasRef.current.getObjects();
      if (objects.length === 0) {
        throw new Error('No signatures found');
      }

      const signatures = objects.map(obj => ({
        dataUrl: obj.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2
        }),
        position: {
          left: obj.left! / canvasRef.current!.width!,
          top: obj.top! / canvasRef.current!.height!,
          width: (obj.width! * obj.scaleX!) / canvasRef.current!.width!,
          height: (obj.height! * obj.scaleY!) / canvasRef.current!.height!
        },
        page: currentPage
      }));

      const response = await fetch('/api/documents/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          signatures
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save signed document');
      }

      window.location.href = '/documents';
    } catch (error) {
      console.error('Error saving signed document:', error);
      alert('Failed to save signed document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi untuk reset document viewer
  const resetViewer = useCallback(() => {
    if (pdfData) {
      URL.revokeObjectURL(pdfData);
    }
    setPdfData(null);
    setDocumentKey(Date.now());
    setIsLoading(true);
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
  }, [pdfData, loadingTimeout]);

  // Fungsi untuk menangani timeout
  const handleLoadingTimeout = useCallback(() => {
    console.log('Loading timeout, retrying...');
    resetViewer();
    if (fileUrl) {
      fetchPdf(fileUrl);
    }
  }, [fileUrl, resetViewer]);

  // Modifikasi fetchPdf
  const fetchPdf = useCallback(async (url: string) => {
    try {
      setIsLoading(true);
      
      // Set timeout untuk loading
      const timeout = setTimeout(() => {
        if (loading) {
          handleLoadingTimeout();
        }
      }, 10000); // 10 detik timeout
      
      setLoadingTimeout(timeout);

      const response = await fetch(`${url}?download=1&t=${Date.now()}`); // Tambah timestamp untuk avoid cache
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const blob = await response.blob();
      const dataUrl = URL.createObjectURL(blob);
      setPdfData(dataUrl);
      setError(null);
      
      // Clear timeout jika berhasil
      clearTimeout(timeout);
      setLoadingTimeout(null);
    } catch (err) {
      console.error('Error fetching PDF:', err);
      setError('Failed to load PDF');
      resetViewer();
    }
  }, [handleLoadingTimeout, loading, resetViewer]);

  // Tambahkan event listener untuk keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeSignature) {
          removeActiveSignature();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSignature, removeActiveSignature]);

  if (loading) {
    return <LoadingSpin />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Document Viewer</h1>
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium">
            <span>{currentPage}</span>
            <span className="text-gray-400"> / {numPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <label>Zoom:</label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={1}>100%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </div>
          {activeSignature && (
            <button
              onClick={removeActiveSignature}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remove Signature
            </button>
          )}
          <Button onClick={saveSignedPdf}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Signed Document'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="bg-white hover:bg-gray-300">
            <div ref={containerRef} className="relative flex justify-center overflow-x-auto">
              {pdfData ? (
                <Document
                  key={documentKey} // Force re-render when key changes
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => {
                    console.error('Load error:', error);
                    resetViewer();
                  }}
                  loading={
                    <div className="flex flex-col items-center justify-center p-8">
                      <LoadingSpin />
                      <p className="mt-4 text-sm text-gray-600">
                        Loading document...
                      </p>
                      <button
                        onClick={resetViewer}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Click here if loading takes too long
                      </button>
                    </div>
                  }
                >
                  <div className="relative">
                    <Page
                      key={`${currentPage}-${scale}`}
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onRenderSuccess={handlePageRenderSuccess}
                      scale={scale}
                    />
                    <div 
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1
                      }}
                    >
                      <canvas 
                        id="pdfCanvas"
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </div>
                  </div>
                </Document>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  {loading ? (
                    <>
                      <LoadingSpin />
                      <p className="mt-4 text-sm text-gray-600">
                        Preparing document...
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-600">No PDF data available</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="p-4 space-y-4 bg-white">
            <h2 className="text-lg font-semibold">Digital Signature</h2>
            <div className="border rounded p-2 bg-white">
              <canvas 
                id="signatureCanvas"
                style={{
                  width: '100%',
                  height: '200px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  touchAction: 'none'
                }}
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button 
                onClick={clearSignature}
                disabled={!isSignaturePadReady}
              >
                Clear
              </Button>
              <Button 
                onClick={addSignatureToPdf}
                disabled={!isSignaturePadReady}
              >
                Add to Document
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {numPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 