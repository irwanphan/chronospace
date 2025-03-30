'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const signatureRef = useRef<fabric.Canvas | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricObjects, setFabricObjects] = useState<{ [key: number]: fabric.Object[] }>({});

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

  useEffect(() => {
    setPageWidth(window.innerWidth);
    const handleResize = () => setPageWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup canvas
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
    };
  }, []);

  // Inisialisasi canvas setelah PDF dirender
  const initializeCanvas = (width: number, height: number) => {
    // Hapus canvas lama jika ada
    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    // Buat canvas baru
    const canvas = new fabric.Canvas('pdfCanvas', {
      width,
      height,
      backgroundColor: 'transparent'
    });
    canvasRef.current = canvas;
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      signatureRef.current.backgroundColor = '#ffffff';
      signatureRef.current.renderAll();
    }
  };

  // Simpan objek fabric untuk halaman saat ini
  const saveCurrentPageObjects = useCallback(() => {
    if (canvasRef.current) {
      const objects = canvasRef.current.getObjects();
      setFabricObjects(prev => ({
        ...prev,
        [currentPage]: objects
      }));
    }
  }, [currentPage]);

  // Restore objek fabric saat pergantian halaman
  const restorePageObjects = useCallback(() => {
    if (canvasRef.current && fabricObjects[currentPage]) {
      canvasRef.current.clear();
      fabricObjects[currentPage].forEach(obj => {
        canvasRef.current?.add(obj);
      });
      canvasRef.current.renderAll();
    }
  }, [currentPage, fabricObjects]);

  // Handle pergantian halaman
  const handlePageChange = (newPage: number) => {
    // Simpan objek halaman saat ini
    saveCurrentPageObjects();
    
    // Ganti halaman
    setCurrentPage(newPage);
    
    // Reset dan inisialisasi ulang canvas
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  // Restore objek setelah halaman diload
  useEffect(() => {
    if (!loading) {
      restorePageObjects();
    }
  }, [loading, restorePageObjects]);

  // Fungsi untuk menyimpan dokumen
  const saveSignedPdf = async () => {
    if (!canvasRef.current || !fileUrl) return;
    
    try {
      setIsSaving(true);
      
      // Dapatkan data tanda tangan dalam format PNG
      const signedPdfDataUrl = canvasRef.current.toDataURL({
        format: 'png',
        multiplier: 2, // Tingkatkan kualitas
        quality: 1
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

      // Redirect setelah berhasil
      window.location.href = '/documents';
    } catch (error) {
      console.error('Error saving signed document:', error);
      alert('Failed to save signed document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi untuk menambahkan tanda tangan ke dokumen
  const addSignatureToPdf = () => {
    if (!signatureRef.current || !canvasRef.current) return;

    const signatureData = signatureRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
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
      
      // Simpan objek setelah menambahkan tanda tangan
      saveCurrentPageObjects();
      
      clearSignature();
    });
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Signed Document'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-4 bg-white">
            <div 
              ref={containerRef}
              className="flex justify-center items-start relative"
            >
              {pdfData ? (
                <Document
                  file={pdfData}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<LoadingSpin />}
                >
                  <Page
                    key={`page-${currentPage}`}
                    pageNumber={currentPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={(page) => {
                      setIsLoading(false);
                      // Inisialisasi canvas dengan ukuran halaman PDF
                      const viewport = page.getViewport({ scale: 1 });
                      initializeCanvas(viewport.width * 0.5, viewport.height * 0.5);
                    }}
                    width={Math.max(pageWidth * 0.5, 390)}
                  />
                </Document>
              ) : (
                <div>No PDF data available</div>
              )}
              <div 
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none'
                }}
              >
                <canvas id="pdfCanvas" />
              </div>
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

      {numPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 