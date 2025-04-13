import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf-generator';
import type { PurchaseOrderItem } from '@prisma/client';

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
          <div class="info-item">
            <div class="info-label">Purchase Request:</div>
            <div>${po.purchaseRequest.code}</div>
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
        <h3>Total: ${formatCurrency(po.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.qty * item.unitPrice), 0))}</h3>
      </div>

      <div class="signatures">
        ${po.purchaseRequest.approvalSteps.map((step) => `
          <div class="signature-box">
            <div class="signature-line">${step.actor?.name || 'N/A'}</div>
            <div class="signature-role">${step.role.roleName}</div>
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

    // Create document record
    const document = await prisma.document.create({
      data: {
        fileName: `PO-${po.code}.pdf`,
        fileUrl: '',
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
        printCount: {
          increment: 1
        }
      }
    });

    // Create history record
    await prisma.purchaseOrderHistory.create({
      data: {
        purchaseOrderId: po.id,
        action: 'Generated',
        actorId: session.user.id,
        comment: 'Document generated'
      }
    });

    return NextResponse.json({ success: true, document: document });
  } catch (error) {
    console.error('Error generating purchase order document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}