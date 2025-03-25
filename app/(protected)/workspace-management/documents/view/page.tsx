'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Canvas, Image as FabricImage } from 'fabric';
import { Document, Page, pdfjs } from 'react-pdf';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { Save } from 'lucide-react';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function DocumentViewerPage() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<Canvas | null>(null);
  const signatureRef = useRef<Canvas | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false);

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
    setNumPages(numPages);
  };

  const initializeCanvas = () => {
    // Cleanup existing canvases if they exist
    if (signatureRef.current) {
      signatureRef.current.dispose();
    }
    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    // Initialize signature pad
    const signatureCanvas = new Canvas('signatureCanvas', {
      isDrawingMode: true,
      width: 300,
      height: 150,
    });
    signatureRef.current = signatureCanvas;

    // Initialize PDF canvas
    const pdfCanvas = new Canvas('pdfCanvas', {
      selection: false,
    });
    canvasRef.current = pdfCanvas;

    // Set drawing properties
    if (signatureCanvas.freeDrawingBrush) {
      signatureCanvas.freeDrawingBrush.color = '#000000';
      signatureCanvas.freeDrawingBrush.width = 2;
    }
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
      const response = await fetch('/api/workspace-management/documents/sign', {
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
      window.location.href = '/workspace-management/documents';
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
          <Card className="p-4">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<LoadingSpin />}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                canvasRef={(canvas) => {
                  if (canvas && canvasRef.current) {
                    canvasRef.current.setDimensions({
                      width: canvas.width,
                      height: canvas.height,
                    });
                  }
                }}
              />
            </Document>
            <canvas id="pdfCanvas" style={{ position: 'absolute', top: 0, left: 0 }} />
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Digital Signature</h2>
            <div className="border rounded p-2">
              <canvas id="signatureCanvas" />
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