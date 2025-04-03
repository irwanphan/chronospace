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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {isValid ? (
          <div className="flex items-center gap-2 text-green-600">
            <ShieldCheck className="w-4 h-4" />
            Active Certificate
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-4 h-4" />
            {isExpired ? 'Expired Certificate' : isRevoked ? 'Revoked Certificate' : 'Inactive Certificate'}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500">
        Expires: {formatDate(new Date(certificate.expiresAt))}
      </div>
    </div>
  );
} 