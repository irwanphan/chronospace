import { jsPDF } from 'jspdf';
import DOMPurify from 'isomorphic-dompurify';

interface PDFContent {
  title: string;
  content: string;
  footer?: string;
}

export async function generatePDF({ title, content, footer }: PDFContent): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  // Add content
  doc.setFontSize(12);
  const sanitizedContent = DOMPurify.sanitize(content);
  const textContent = sanitizedContent.replace(/<[^>]*>/g, '');
  
  const splitText = doc.splitTextToSize(textContent, 170);
  doc.text(splitText, 20, 40);
  
  // Add footer if provided
  if (footer) {
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(footer, 20, doc.internal.pageSize.height - 10);
    }
  }
  
  return Buffer.from(doc.output('arraybuffer'));
} 