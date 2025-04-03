import puppeteer from 'puppeteer';

interface PDFContent {
  title: string;
  content: string;
  footer?: string;
}

export async function generatePDF({ title, content, footer }: PDFContent): Promise<Buffer> {
  // Create HTML content with proper styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&display=swap');

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            font-size: 16px;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .content {
            font-size: 14px;
          }
          .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            font-size: 10px;
          }

          /* Quill specific styles */
          .ql-font-arial {
            font-family: Arial, sans-serif !important;
          }
          .ql-font-times-new-roman {
            font-family: 'Times New Roman', Times, serif !important;
          }
          .ql-font-georgia {
            font-family: Georgia, serif !important;
          }
          .ql-font-roboto {
            font-family: 'Roboto', sans-serif !important;
          }
          .ql-font-inter {
            font-family: 'Inter', sans-serif !important;
          }

          /* Font sizes */
          .ql-size-small {
            font-size: 0.75em !important;
          }
          .ql-size-large {
            font-size: 1.5em !important;
          }
          .ql-size-huge {
            font-size: 2em !important;
          }

          /* Text alignment */
          .ql-align-center {
            text-align: center !important;
          }
          .ql-align-right {
            text-align: right !important;
          }
          .ql-align-justify {
            text-align: justify !important;
          }

          /* Indentation */
          .ql-indent-1 {
            padding-left: 3em !important;
          }
          .ql-indent-2 {
            padding-left: 6em !important;
          }
          .ql-indent-3 {
            padding-left: 9em !important;
          }
          .ql-indent-4 {
            padding-left: 12em !important;
          }
          .ql-indent-5 {
            padding-left: 15em !important;
          }
          .ql-indent-6 {
            padding-left: 18em !important;
          }
          .ql-indent-7 {
            padding-left: 21em !important;
          }
          .ql-indent-8 {
            padding-left: 24em !important;
          }

          /* Lists */
          ul, ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          li {
            margin: 0.2em 0;
          }
          
          /* Paragraphs */
          p {
            margin: 0.5em 0;
          }

          /* Colors */
          .ql-color-red {
            color: #ff0000 !important;
          }
          .ql-color-blue {
            color: #0000ff !important;
          }
          .ql-background-red {
            background-color: #ffebeb !important;
          }
          .ql-background-blue {
            background-color: #ebf3ff !important;
          }

          /* Text styles */
          strong, b {
            font-weight: bold !important;
          }
          em, i {
            font-style: italic !important;
          }
          u {
            text-decoration: underline !important;
          }
          s {
            text-decoration: line-through !important;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">
          ${content}
        </div>
        ${footer ? `<div class="footer">${footer}</div>` : ''}
      </body>
    </html>
  `;

  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true
    });

    // Create new page
    const page = await browser.newPage();
    
    // Set content and wait for fonts to load
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'load', 'domcontentloaded']
    });

    // Wait for web fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });

    // Close browser
    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
} 