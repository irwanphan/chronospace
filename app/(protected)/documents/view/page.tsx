'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { fabric } from 'fabric';
import { Document, Page, pdfjs } from 'react-pdf';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { Save } from 'lucide-react';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs`;

export default function DocumentViewerPage() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const signatureRef = useRef<fabric.Canvas | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    const initCanvas = () => {
      try {
        // Initialize signature pad
        const signatureElement = document.getElementById('signatureCanvas') as HTMLCanvasElement;
        if (signatureElement) {
          const rect = signatureElement.getBoundingClientRect();
          const signatureCanvas = new fabric.Canvas('signatureCanvas', {
            isDrawingMode: true,
            width: rect.width,
            height: rect.height,
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
      // Delay initialization to ensure DOM is ready
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

  const onDocumentLoadSuccess = async (pdf: PDFDocumentProxy) => {
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    
    try {
      await loadPdfPage(1);
      initializeCanvas();
    } catch (err) {
      console.error('Error initializing PDF:', err);
      setError('Failed to initialize PDF viewer');
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(`Error loading PDF: ${error.message}`);
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
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to save signed document');
      }

      // Gunakan window.location.href untuk navigasi sederhana
      window.location.href = '/documents';
      
    } catch (error) {
      console.error('Error saving signed document:', error);
      alert('Failed to save signed document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadPdfPage = async (pageNum: number) => {
    try {
      if (!pdfDoc) return;
      
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext();
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

    } catch (err) {
      console.error('Error loading PDF page:', err);
      setError('Failed to load PDF page');
    }
  };

  const initializeCanvas = () => {
    // Implementation of initializeCanvas method
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
          <Button onClick={saveSignedPdf} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Signed Document'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <Card className="overflow-auto hover:bg-gray-300">
            <div className="" style={{ minHeight: '800px' }}>
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
                        // Gunakan ukuran asli dari PDF canvas
                        const actualWidth = canvas.width;
                        const actualHeight = canvas.height;

                        const dimensions = {
                          width: actualWidth * 0.5, // Bagi 2 untuk mengatasi scaling
                          height: actualHeight * 0.5
                        };

                        try {
                          canvasRef.current.setDimensions(dimensions);
                          
                          // Sesuaikan container
                          const container = canvas.parentElement;
                          if (container) {
                            container.style.width = `${dimensions.width}px`;
                            container.style.height = `${dimensions.height}px`;
                          }

                          // Set scale canvas
                          canvasRef.current.setZoom(0.5); // Set zoom ke 0.5 untuk menyesuaikan ukuran
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