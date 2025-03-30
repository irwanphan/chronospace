'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import { fabric } from 'fabric';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { Save } from 'lucide-react';
import type { PDFPageProxy } from 'pdfjs-dist';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const signatureRef = useRef<fabric.Canvas | null>(null);
  const canvasInitialized = useRef(false);
  // const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // const [fabricObjects, setFabricObjects] = useState<{ [key: number]: fabric.Object[] }>({});
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [isSignaturePadReady, setIsSignaturePadReady] = useState(false);

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
    const viewport = page.getViewport({ scale: 1 });
    const scale = 0.8;
    
    const width = viewport.width * scale;
    const height = viewport.height * scale;

    setPdfDimensions({ width, height });
    initPdfCanvas(width, height);
  }, [initPdfCanvas]);

  const clearSignature = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      signatureRef.current.backgroundColor = '#ffffff';
      signatureRef.current.renderAll();
    }
  }, []);

  const addSignatureToPdf = () => {
    if (!signatureRef.current || !canvasRef.current) return;

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

      img.set({
        left: canvasRef.current.width! * 0.1,
        top: canvasRef.current.height! * 0.1,
        scaleX: scale,
        scaleY: scale,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: true,
        cornerStyle: 'circle',
        cornerColor: '#2563eb',
        cornerSize: 8,
        transparentCorners: false,
        padding: 5
      });

      canvasRef.current.add(img);
      canvasRef.current.setActiveObject(img);
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
          <Card className="p-4 bg-white hover:bg-gray-300">
            <div 
              ref={containerRef}
              className="relative flex justify-center"
              style={{ 
                width: pdfDimensions.width || 'auto',
                height: pdfDimensions.height || 'auto'
              }}
            >
              {pdfData ? (
                <Document
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<LoadingSpin />}
                >
                  <div className="relative">
                    <Page
                      key={currentPage}
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onRenderSuccess={handlePageRenderSuccess}
                      width={pdfDimensions.width}
                      height={pdfDimensions.height}
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
                <div>No PDF data available</div>
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