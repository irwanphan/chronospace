import { jsPDF } from 'jspdf';
import { JSDOM } from 'jsdom';

interface PDFContent {
  title: string;
  content: string;
  footer?: string;
}

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  isListItem?: boolean;
  listType?: 'bullet' | 'number';
  listIndex?: number;
}

function parseQuillContent(html: string): TextSegment[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  function processNode(node: any, listContext: { type?: 'bullet' | 'number', index: number } = { index: 0 }): TextSegment[] {
    if (node.nodeType === 3) { // TEXT_NODE
      return [{
        text: node.textContent || '',
        bold: false,
        italic: false,
        underline: false
      }];
    }

    if (node.nodeType === 1) { // ELEMENT_NODE
      const element = node;
      const style: TextSegment = {
        text: '',
        bold: element.tagName === 'STRONG' || element.tagName === 'B',
        italic: element.tagName === 'EM' || element.tagName === 'I',
        underline: element.tagName === 'U'
      };

      // Handle lists
      if (element.tagName === 'UL') {
        const segments: TextSegment[] = [];
        for (const child of node.childNodes) {
          if (child.nodeType === 1 && child.tagName === 'LI') {
            segments.push(...processNode(child, { type: 'bullet', index: listContext.index + 1 }));
          }
        }
        // Add extra line break after list
        segments.push({ text: '\n\n', bold: false, italic: false, underline: false });
        return segments;
      }

      if (element.tagName === 'OL') {
        const segments: TextSegment[] = [];
        for (const child of node.childNodes) {
          if (child.nodeType === 1 && child.tagName === 'LI') {
            segments.push(...processNode(child, { type: 'number', index: listContext.index + 1 }));
          }
        }
        // Add extra line break after list
        segments.push({ text: '\n\n', bold: false, italic: false, underline: false });
        return segments;
      }

      if (element.tagName === 'LI') {
        const childSegments: TextSegment[] = [];
        for (const child of node.childNodes) {
          childSegments.push(...processNode(child, listContext));
        }

        // Add list marker
        const prefix = listContext.type === 'bullet' ? '• ' : `${listContext.index}. `;
        return [{
          text: prefix,
          bold: style.bold,
          italic: style.italic,
          underline: style.underline,
          isListItem: true,
          listType: listContext.type,
          listIndex: listContext.index
        }, ...childSegments, { text: '\n', bold: false, italic: false, underline: false }];
      }

      // Handle paragraphs
      if (element.tagName === 'P') {
        const childSegments: TextSegment[] = [];
        for (const child of node.childNodes) {
          childSegments.push(...processNode(child, listContext));
        }
        // Add double line break after paragraph
        return [...childSegments, { text: '\n\n', bold: false, italic: false, underline: false }];
      }

      const childSegments: TextSegment[] = [];
      for (const child of node.childNodes) {
        childSegments.push(...processNode(child, listContext));
      }

      return childSegments.map(segment => ({
        ...segment,
        bold: segment.bold || style.bold,
        italic: segment.italic || style.italic,
        underline: segment.underline || style.underline
      }));
    }

    return [];
  }

  return processNode(document.body);
}

export async function generatePDF({ title, content, footer }: PDFContent): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 20);
  
  // Add content
  doc.setFontSize(14);
  let y = 40;
  const lineHeight = 7;
  const maxWidth = 170;

  const segments = parseQuillContent(content);
  let currentText = '';
  let currentStyle = { bold: false, italic: false, underline: false };

  for (const segment of segments) {
    if (segment.text.trim() === '') {
      if (currentText) {
        const fontStyle = currentStyle.bold ? 'bold' : currentStyle.italic ? 'italic' : 'normal';
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(currentText, maxWidth);
        doc.text(lines, 20, y);
        if (currentStyle.underline) {
          const textWidth = doc.getTextWidth(currentText);
          doc.line(20, y + lineHeight - 1, 20 + textWidth, y + lineHeight - 1);
        }
        y += lines.length * lineHeight;
        currentText = '';
      }
      y += lineHeight; // Add extra space for paragraphs
      continue;
    }

    // Handle list items
    if (segment.isListItem) {
      if (currentText) {
        const fontStyle = currentStyle.bold ? 'bold' : currentStyle.italic ? 'italic' : 'normal';
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(currentText, maxWidth);
        doc.text(lines, 20, y);
        if (currentStyle.underline) {
          const textWidth = doc.getTextWidth(currentText);
          doc.line(20, y + lineHeight - 1, 20 + textWidth, y + lineHeight - 1);
        }
        y += lines.length * lineHeight;
        currentText = '';
      }
    }

    if (JSON.stringify(currentStyle) !== JSON.stringify({
      bold: segment.bold,
      italic: segment.italic,
      underline: segment.underline
    })) {
      if (currentText) {
        const fontStyle = currentStyle.bold ? 'bold' : currentStyle.italic ? 'italic' : 'normal';
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(currentText, maxWidth);
        doc.text(lines, 20, y);
        if (currentStyle.underline) {
          const textWidth = doc.getTextWidth(currentText);
          doc.line(20, y + lineHeight - 1, 20 + textWidth, y + lineHeight - 1);
        }
        y += lines.length * lineHeight;
        currentText = '';
      }
      currentStyle = {
        bold: segment.bold || false,
        italic: segment.italic || false,
        underline: segment.underline || false
      };
    }

    currentText += segment.text;
  }

  // Render any remaining text
  if (currentText) {
    const fontStyle = currentStyle.bold ? 'bold' : currentStyle.italic ? 'italic' : 'normal';
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(currentText, maxWidth);
    doc.text(lines, 20, y);
    if (currentStyle.underline) {
      const textWidth = doc.getTextWidth(currentText);
      doc.line(20, y + lineHeight - 1, 20 + textWidth, y + lineHeight - 1);
    }
  }
  
  // Add footer if provided
  if (footer) {
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(footer, 20, doc.internal.pageSize.height - 10);
    }
  }
  
  return Buffer.from(doc.output('arraybuffer'));
} 