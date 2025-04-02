import { jsPDF } from 'jspdf';

interface PDFContent {
  title: string;
  content: string;
  footer?: string;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .trim(); // Remove leading/trailing whitespace
}

export async function generatePDF({ title, content, footer }: PDFContent): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  // Add content
  doc.setFontSize(12);
  const cleanContent = sanitizeHtml(content);
  const splitText = doc.splitTextToSize(cleanContent, 170);
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