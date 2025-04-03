'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileSignature, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SignatureInfo {
  isDigitallySigned: boolean;
  signedBy?: string;
  signedAt?: Date;
  certificateInfo?: {
    isValid: boolean;
    expiresAt: Date;
  };
}

export default function SignatureInfo() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySignature = async () => {
      if (!fileUrl) return;

      try {
        const response = await fetch(`/api/documents/verify?url=${encodeURIComponent(fileUrl)}`);
        if (!response.ok) throw new Error('Failed to verify signature');
        const data = await response.json();
        setSignatureInfo(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    verifySignature();
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <FileSignature className="w-4 h-4" />
        Verifying signature...
      </div>
    );
  }

  if (!signatureInfo?.isDigitallySigned) {
    return (
      <div className="flex items-center gap-2 text-yellow-500">
        <XCircle className="w-4 h-4" />
        No digital signature
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {signatureInfo.certificateInfo?.isValid ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            Valid Digital Signature
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-4 h-4" />
            Invalid Digital Signature
          </div>
        )}
      </div>
      {signatureInfo.signedBy && (
        <div className="text-xs text-gray-500">
          Signed by: {signatureInfo.signedBy}
        </div>
      )}
      {signatureInfo.signedAt && (
        <div className="text-xs text-gray-500">
          Signed at: {formatDate(new Date(signatureInfo.signedAt))}
        </div>
      )}
      {signatureInfo.certificateInfo?.expiresAt && (
        <div className="text-xs text-gray-500">
          Certificate expires: {formatDate(new Date(signatureInfo.certificateInfo.expiresAt))}
        </div>
      )}
    </div>
  );
} 