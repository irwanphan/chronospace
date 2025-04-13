import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import puppeteer from 'puppeteer';
import { formatCurrency, formatDate } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch PO data
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            vendor: true
          }
        },
        budget: {
          include: {
            project: true,
            workDivision: true
          }
        },
        user: true
      }
    });

    if (!po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Purchase Order ${po.code}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              color: #666;
              font-size: 0.9em;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .text-right {
              text-align: right;
            }
            .footer {
              margin-top: 50px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 100px;
            }
            .signature-box {
              text-align: center;
            }
            .signature-line {
              margin-top: 70px;
              border-top: 1px solid #333;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Purchase Order</h1>
            <h2>${po.code}</h2>
          </div>

          <div class="info-grid">
            <div>
              <div class="info-item">
                <div class="info-label">Created By:</div>
                <div>${po.user.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Work Division:</div>
                <div>${po.budget.workDivision.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Project:</div>
                <div>${po.budget.project.title}</div>
              </div>
            </div>
            <div>
              <div class="info-item">
                <div class="info-label">Date:</div>
                <div>${formatDate(po.createdAt)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status:</div>
                <div>${po.status}</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              ${po.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.description}</td>
                  <td>${item.qty}</td>
                  <td>${item.unit}</td>
                  <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                  <td class="text-right">${formatCurrency(item.qty * item.unitPrice)}</td>
                  <td>${item.vendor?.vendorName || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div class="signature-box">
              <div class="signature-line">Prepared by</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Approved by</div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    await browser.close();

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PO-${po.code}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 