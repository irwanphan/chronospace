import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf-generator';
import type { PurchaseOrderItem } from '@prisma/client';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch PO data with all necessary relations
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
        user: true,
        purchaseRequest: {
          include: {
            approvalSteps: {
              where: { status: 'Approved' },
              include: {
                actor: true,
                role: true
              },
              orderBy: {
                stepOrder: 'asc'
              }
            }
          }
        }
      }
    });

    if (!po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Generate HTML content for PDF
    const content = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          margin-bottom: 30px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          color: #666;
          width: 120px;
        }
        .info-value {
          color: #333;
          font-weight: 500;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin: 30px 0 20px;
        }
        .budget-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0 30px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        .text-right {
          text-align: right;
        }
        .total-section {
          text-align: right;
          margin: 20px 0;
          font-size: 18px;
          font-weight: bold;
        }
        .signatures {
          margin-top: 50px;
        }
        .signature-box {
          margin-bottom: 30px;
        }
        .signature-line {
          border-top: 1px solid #333;
          padding-top: 8px;
          font-weight: 500;
        }
        .signature-role {
          color: #666;
          font-size: 14px;
        }
        .signature-date {
          color: #666;
          font-size: 12px;
          font-style: italic;
        }
      </style>

      <div class="header">
        <h1>Purchase Order Details</h1>
      </div>

      <div class="info-grid">
        <div>
          <div class="info-row">
            <div class="info-label">PO Code:</div>
            <div class="info-value">${po.code}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Created By:</div>
            <div class="info-value">${po.user.name}</div>
          </div>
          <div class="info-row">
            <div class="info-label">From PR:</div>
            <div class="info-value">${po.purchaseRequest.code}</div>
          </div>
        </div>
        <div>
          <div class="info-row">
            <div class="info-label">Created At:</div>
            <div class="info-value">${formatDate(po.createdAt)}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Print Count:</div>
            <div class="info-value">${po.printCount + 1}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status:</div>
            <div class="info-value">${po.status}</div>
          </div>
        </div>
      </div>

      <h2 class="section-title">Order Information</h2>
      
      <div class="budget-info">
        <div class="info-row">
          <div class="info-label">Related Budget:</div>
          <div class="info-value">${po.budget.title}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Related Project:</div>
          <div class="info-value">${po.budget.project.title}</div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-label">Order Title:</div>
        <div class="info-value">${po.title}</div>
      </div>

      <div class="info-row">
        <div class="info-label">Description:</div>
        <div class="info-value">${po.description || '-'}</div>
      </div>

      <h2 class="section-title">Item List</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total Price</th>
            <th>Vendor</th>
          </tr>
        </thead>
        <tbody>
          ${po.items.map((item: PurchaseOrderItem & { vendor?: { vendorName: string } }, index: number) => `
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

      <div class="total-section">
        Total: ${formatCurrency(po.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.qty * item.unitPrice), 0))}
      </div>

      <h2 class="section-title">Approved by</h2>
      <div class="signatures">
        ${po.purchaseRequest.approvalSteps.map((step) => `
          <div class="signature-box">
            <div class="signature-line">${step.actor?.name || 'N/A'}</div>
            <div class="signature-role">${step.role.roleName}</div>
            <div class="signature-date">• approved at ${step.actedAt ? formatDate(step.actedAt) : 'N/A'}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Generate PDF
    const pdfBuffer = await generatePDF({
      title: `Purchase Order - ${po.code}`,
      content,
      footer: `Generated on ${formatDate(new Date())}`
    });

    // Upload PDF to Vercel Blob
    const { url } = await put(`documents/PO-${po.code}.pdf`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf'
    });

    // Create document record
    const document = await prisma.document.create({
      data: {
        fileName: `PO-${po.code}.pdf`,
        fileUrl: url,
        fileType: 'application/pdf',
        fileData: pdfBuffer,
        uploadedBy: session.user.id,
        projectId: po.budget.project.id,
        entityType: 'PURCHASE_ORDER',
        entityId: po.id
      }
    });

    // Update purchase order with document reference
    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        documentId: document.id,
        status: 'Completed',
        printCount: {
          increment: 1
        }
      }
    });

    // Create history record
    await prisma.purchaseOrderHistory.create({
      data: {
        purchaseOrderId: po.id,
        action: 'Generated Document',
        actorId: session.user.id,
        comment: `Generated document with code ${po.code} and marked as Completed`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating purchase order document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}