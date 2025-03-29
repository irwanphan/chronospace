'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import { fabric } from 'fabric';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { Save } from 'lucide-react';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const signatureRef = useRef<fabric.Canvas | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false);

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
    const initCanvas = () => {
      try {
        // Initialize signature pad
        const signatureElement = document.getElementById('signatureCanvas') as HTMLCanvasElement;
        if (signatureElement) {
          const signatureCanvas = new fabric.Canvas('signatureCanvas', {
            isDrawingMode: true,
            width: signatureElement.offsetWidth,
            height: 150,
            backgroundColor: '#ffffff'
          });

          signatureRef.current = signatureCanvas;
          if (signatureCanvas.freeDrawingBrush) {
            signatureCanvas.freeDrawingBrush.color = '#000000';
            signatureCanvas.freeDrawingBrush.width = 2;
          }
        }

        // Initialize PDF canvas
        const pdfElement = document.getElementById('pdfCanvas') as HTMLCanvasElement;
        if (pdfElement) {
          const pdfCanvas = new fabric.Canvas('pdfCanvas', {
            selection: true,
            backgroundColor: 'transparent'
          });
          canvasRef.current = pdfCanvas;
        }

        setIsCanvasInitialized(true);
      } catch (error) {
        console.error('Error initializing canvas:', error);
        setError('Failed to initialize canvas');
      }
    };

    if (!isCanvasInitialized) {
      const timer = setTimeout(initCanvas, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (signatureRef.current) {
        signatureRef.current.dispose();
      }
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, [isCanvasInitialized]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      signatureRef.current.backgroundColor = '#ffffff';
      signatureRef.current.renderAll();
    }
  };

  const addSignatureToPdf = () => {
    if (!signatureRef.current || !canvasRef.current) return;

    const signatureData = signatureRef.current.toDataURL({
      format: 'png',
      multiplier: 1,
      quality: 1,
      enableRetinaScaling: false
    });

    fabric.Image.fromURL(signatureData, (img) => {
      if (!canvasRef.current) return;

      img.scale(0.5);
      img.set({
        left: 100,
        top: 100,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: true
      });

      canvasRef.current.add(img);
      canvasRef.current.renderAll();
      clearSignature();
    });
  };

  const saveSignedPdf = async () => {
    if (!canvasRef.current || !fileUrl) return;
    
    try {
      setIsSaving(true);
      const signedPdfDataUrl = canvasRef.current.toDataURL({
        format: 'png',
        multiplier: 1,
        quality: 1,
        enableRetinaScaling: false,
      });

      const response = await fetch('/api/documents/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: fileUrl,
          signedPdfData: signedPdfDataUrl,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save signed document');
      }

      window.location.href = '/documents';
    } catch (error) {
      console.error('Error saving signed document:', error);
      alert('Failed to save signed document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Signed Document'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="overflow-auto hover:bg-gray-300">
            <div className="relative">
              {pdfData ? (
                <Document
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => setError(error.message)}
                  loading={<LoadingSpin />}
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    canvasRef={(canvas) => {
                      if (canvas && canvasRef.current) {
                        const actualWidth = canvas.width;
                        const actualHeight = canvas.height;

                        const dimensions = {
                          width: actualWidth * 0.5,
                          height: actualHeight * 0.5
                        };

                        try {
                          canvasRef.current.setDimensions(dimensions);
                          
                          const container = canvas.parentElement;
                          if (container) {
                            container.style.width = `${dimensions.width}px`;
                            container.style.height = `${dimensions.height}px`;
                          }
                        } catch (error) {
                          console.error('Error setting canvas dimensions:', error);
                        }
                      }
                    }}
                  />
                </Document>
              ) : (
                <div>No PDF data available</div>
              )}
              <canvas 
                id="pdfCanvas" 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0,
                  pointerEvents: 'none'
                }} 
              />
            </div>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Digital Signature</h2>
            <div className="border rounded p-2 bg-white">
              <canvas 
                id="signatureCanvas"
                style={{
                  width: '100%',
                  height: '150px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  touchAction: 'none'
                }}
              />
            </div>
            <div className="flex justify-between">
              <Button onClick={clearSignature}>
                Clear
              </Button>
              <Button onClick={addSignatureToPdf}>
                Add to Document
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {numPages && numPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="py-2">
            Page {currentPage} of {numPages}
          </span>
          <Button
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 