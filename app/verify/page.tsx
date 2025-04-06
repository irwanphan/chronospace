'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Card from '@/components/ui/Card';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { FileSignature, CheckCircle2, XCircle } from 'lucide-react';

interface VerificationInfo {
  isValid: boolean;
  document: {
    fileName: string;
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

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyDocument = async () => {
      try {
        const docId = searchParams.get('doc');
        const signer = searchParams.get('signer');
        const time = searchParams.get('time');

        if (!docId || !signer || !time) {
          throw new Error('Missing verification parameters');
        }

        const response = await fetch(`/api/documents/verify?doc=${docId}&signer=${signer}&time=${time}`);
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
              <h1 className="text-xl font-semibold">Valid Digital Signature</h1>
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
            <p className="text-lg">{verificationInfo.document.fileName}</p>
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