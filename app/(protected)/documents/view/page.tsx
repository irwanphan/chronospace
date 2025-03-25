'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Canvas, Image as FabricImage } from 'fabric';
import { Document, Page, pdfjs } from 'react-pdf';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { Save } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs`;

export default function DocumentViewerPage() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<Canvas | null>(null);
  const signatureRef = useRef<Canvas | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Loading PDF from URL:', fileUrl);
    console.log('PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc);
  }, [fileUrl]);

  useEffect(() => {
    if (!isCanvasInitialized) {
      initializeCanvas();
      setIsCanvasInitialized(true);
    }

    // Cleanup function
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
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setError(null); // Clear any previous errors
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(`Error loading PDF: ${error.message}`);
  };

  const initializeCanvas = () => {
    // Cleanup existing canvases if they exist
    if (signatureRef.current) {
      signatureRef.current.dispose();
    }
    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    // Initialize signature pad with proper dimensions
    const signatureElement = document.getElementById('signatureCanvas');
    if (signatureElement) {
      const rect = signatureElement.getBoundingClientRect();
      const signatureCanvas = new Canvas('signatureCanvas', {
        isDrawingMode: true,
        width: rect.width,
        height: rect.height,
        backgroundColor: '#ffffff'
      });
      
      signatureRef.current = signatureCanvas;

      // Set drawing properties
      if (signatureCanvas.freeDrawingBrush) {
        signatureCanvas.freeDrawingBrush.color = '#000000';
        signatureCanvas.freeDrawingBrush.width = 2;
      }

      // Make canvas responsive
      window.addEventListener('resize', () => {
        const rect = signatureElement.getBoundingClientRect();
        signatureCanvas.setDimensions({
          width: rect.width,
          height: rect.height
        });
      });
    }

    // Initialize PDF canvas
    const pdfCanvas = new Canvas('pdfCanvas', {
      selection: true,
      width: 800,
      height: 1200,
      backgroundColor: 'transparent'
    });
    canvasRef.current = pdfCanvas;

    // Enable object movement on PDF canvas
    pdfCanvas.on('object:moving', (e) => {
      const obj = e.target;
      if (obj) {
        // Keep objects within canvas bounds
        const bound = obj.getBoundingRect();
        if (bound.top < 0) {
          obj.top = 0;
        }
        if (bound.left < 0) {
          obj.left = 0;
        }
        if (bound.top + bound.height > pdfCanvas.height) {
          obj.top = pdfCanvas.height - bound.height;
        }
        if (bound.left + bound.width > pdfCanvas.width) {
          obj.left = pdfCanvas.width - bound.width;
        }
      }
    });
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const addSignatureToPdf = () => {
    if (!signatureRef.current || !canvasRef.current) return;

    const signature = signatureRef.current.toDataURL({
      format: 'png',
      multiplier: 1,
      quality: 1,
      enableRetinaScaling: false,
    });

    const img = new FabricImage(signature);
    img.scale(0.5);
    canvasRef.current?.add(img);
    img.setCoords();
  };

  const saveSignedPdf = async () => {
    if (!canvasRef.current || !fileUrl) return;

    const signedPdfDataUrl = canvasRef.current.toDataURL({
      format: 'png',
      multiplier: 1,
      quality: 1,
      enableRetinaScaling: false,
    });

    try {
      const response = await fetch('/api/documents/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          signedPdfData: signedPdfDataUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to save signed document');
      
      // Redirect back to documents list
      window.location.href = '/documents';
    } catch (error) {
      console.error('Error saving signed document:', error);
    }
  };

  if (!fileUrl) return <div>No document URL provided</div>;

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
          <Button onClick={saveSignedPdf}>
            <Save className="w-4 h-4 mr-2" />
            Save Signed Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-4 overflow-hidden">
            <div className="relative" style={{ minHeight: '800px' }}>
              {error ? (
                <div className="text-red-600">Error loading PDF: {error}</div>
              ) : (
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<LoadingSpin />}
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    canvasRef={(canvas) => {
                      if (canvas && canvasRef.current) {
                        const dimensions = {
                          width: canvas.width || 800,
                          height: canvas.height || 1200
                        };
                        try {
                          canvasRef.current.setDimensions(dimensions);
                          // Sesuaikan ukuran container
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
              )}
              <canvas 
                id="pdfCanvas" 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0,
                  pointerEvents: 'none' // Ini akan memungkinkan interaksi dengan PDF di bawahnya
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
                  touchAction: 'none' // Penting untuk touch events
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