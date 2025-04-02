import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const revalidate = 0

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        workDivision: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const projectDataStr = formData.get('projectData');
    const file = formData.get('file') as File | null;

    if (!projectDataStr) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      );
    }

    const { 
      code, 
      title, 
      description, 
      workDivisionId, 
      year, 
      startDate, 
      finishDate, 
      userId 
    } = JSON.parse(projectDataStr as string);

    // Validasi data yang diterima
    if (!code || !title || !workDivisionId || !year || !startDate || !finishDate || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Gunakan transaction untuk memastikan data konsisten
    const result = await prisma.$transaction(async (tx) => {
      // Buat project baru
      const newProject = await tx.project.create({
        data: {
          code,
          title,
          description: description || '',
          workDivisionId,
          year: Number(year),
          startDate: new Date(startDate),
          finishDate: new Date(finishDate),
          status: 'Not Allocated',
          createdBy: userId,
        },
      });

      // Upload file jika ada
      let projectDocument = null;
      if (file) {
        try {
          const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Upload ke Vercel Blob
          const blob = await put(fileName, buffer, {
            access: 'public',
            contentType: file.type || 'application/octet-stream'
          });

          // Log untuk debugging
          console.log('File uploaded to blob:', blob);

          try {
            // Simpan dokumen ke database
            projectDocument = await tx.projectDocument.create({
              data: {
                projectId: newProject.id,
                fileName: fileName,
                fileUrl: blob.url,
                fileType: file.type || 'application/octet-stream',
                uploadedBy: userId,
              },
            });
            console.log('Document created:', projectDocument);
          } catch (dbError) {
            console.error('Database error:', dbError);
            // Hapus file dari blob jika gagal menyimpan ke database
            // Implementasikan delete dari blob di sini jika perlu
            throw new Error('Failed to save document to database');
          }
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          throw new Error('Failed to process file upload');
        }
      }

      // Buat history project
      const projectHistory = await tx.projectHistory.create({
        data: {
          projectId: newProject.id,
          projectCode: newProject.code,
          action: 'CREATE',
          userId,
          changes: {
            code,
            title,
            description,
            workDivisionId,
            year,
            startDate,
            finishDate,
            documentUrl: projectDocument?.fileUrl, // Tambahkan URL dokumen ke history
          },
          timestamp: new Date(),
        },
      });

      // Buat activity history
      const activityHistory = await tx.activityHistory.create({
        data: {
          userId,
          entityType: 'PROJECT',
          entityId: newProject.id,
          entityCode: newProject.code,
          action: 'CREATE',
          details: {
            code,
            title,
            description,
            workDivisionId,
            year,
            startDate,
            finishDate,
            documentUrl: projectDocument?.fileUrl, // Tambahkan URL dokumen ke activity
          },
          timestamp: new Date(),
        },
      });

      return { newProject, projectHistory, activityHistory, projectDocument };
    });

    return NextResponse.json({
      message: 'Project created successfully',
      project: result.newProject,
      history: result.projectHistory,
      document: result.projectDocument,
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
} 