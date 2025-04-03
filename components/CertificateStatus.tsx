'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Certificate {
  id: string;
  isActive: boolean;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

export default function CertificateStatus() {
  const { data: session } = useSession();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCertificate = async () => {
    try {
      const response = await fetch('/api/certificates/status');
      if (!response.ok) throw new Error('Failed to fetch certificate status');
      const data = await response.json();
      setCertificate(data.certificate);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCertificate();
    }
  }, [session]);

  // Refresh status every 5 seconds
  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(fetchCertificate, 5000);
    return () => clearInterval(interval);
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Shield className="w-4 h-4" />
        Loading certificate status...
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <ShieldAlert className="w-4 h-4" />
        No active certificate
      </div>
    );
  }

  const isExpired = new Date(certificate.expiresAt) < new Date();
  const isRevoked = certificate.revokedAt !== null;
  const isValid = certificate.isActive && !isExpired && !isRevoked;

  return (
    <div className={`flex flex-col h-10 items-center justify-center px-3 text-center rounded-lg border ${isValid ? 'border-green-600' : 'border-red-500'}`}>
      <div className="flex items-center">
        {isValid ? (
          <div className="text-[12px] flex items-center gap-1 text-green-600">
            <ShieldCheck className="w-3 h-3" />
            Active Certificate
          </div>
        ) : (
          <div className="text-[12px] flex items-center gap-1 text-red-500">
            <ShieldAlert className="w-3 h-3" />
            {isExpired ? 'Expired Certificate' : isRevoked ? 'Revoked Certificate' : 'Inactive Certificate'}
          </div>
        )}
      </div>
      <div className="text-[10px] text-gray-500">
        Expires: {formatDate(new Date(certificate.expiresAt))}
      </div>
    </div>
  );
} 