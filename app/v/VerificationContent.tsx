'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Card from '@/components/ui/Card';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { FileSignature, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
interface VerificationInfo {
  isValid: boolean;
  document: {
    fileName: string;
    signedFileUrl: string;
    signedAt: string;
    signedBy: {
      name: string;
      role: string;
    };
    signatures: Array<{
      id: string;
      signedAt: string;
      user: {
        name: string;
        role: {
          roleName: string;
        };
      };
    }>;
  };
}

export default function VerificationContent() {
  const searchParams = useSearchParams();
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('searchParams : ', searchParams);
  console.log('searchParams.get(code) : ', searchParams.get('code'));
  console.log('verificationInfo : ', verificationInfo);

  useEffect(() => {
    const verifyDocument = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('Missing verification code');
        }

        const response = await fetch(`/api/documents/verify?code=${code}`);
        if (!response.ok) {
          throw new Error('Failed to verify document');
        }

        const data = await response.json();
        setVerificationInfo(data);
      } catch (err) {
        console.error('Verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify document');
      } finally {
        setLoading(false);
      }
    };

    verifyDocument();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpin />
          <p className="mt-4 text-gray-600">Verifying document signature...</p>
        </div>
      </div>
    );
  }

  if (error || !verificationInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-lg w-full p-6">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <XCircle className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Verification Failed</h1>
          </div>
          <p className="text-gray-600">{error || 'Could not verify document signature'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          {verificationInfo.isValid ? (
            <div className="flex items-center gap-3 text-green-500">
              <CheckCircle2 className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Valid Digitally Signed Document</h1>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-red-500">
              <XCircle className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Invalid Digital Signature</h1>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Document</h2>
            <Link href={verificationInfo.document.signedFileUrl} 
              target="_blank" 
              className="text-lg border border-gray-200 block p-2 rounded-md mt-2 hover:bg-gray-50 hover:border-blue-600 transition-all duration-300"
              onClick={() => {
                window.open(verificationInfo.document.signedFileUrl, '_blank');
              }}
            >
              {verificationInfo.document.fileName}</Link>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Signed By</h2>
            <p className="text-lg">{verificationInfo.document.signedBy.name}</p>
            <p className="text-sm text-gray-500">{verificationInfo.document.signedBy.role}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Signed On</h2>
            <p className="text-lg">{formatDate(new Date(verificationInfo.document.signedAt))}</p>
          </div>

          {verificationInfo.document.signatures.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">Signature History</h2>
              <div className="space-y-3">
                {verificationInfo.document.signatures.map((sig) => (
                  <div key={sig.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileSignature className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">{sig.user.name}</p>
                      <p className="text-sm text-gray-500">{sig.user.role.roleName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(sig.signedAt))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 