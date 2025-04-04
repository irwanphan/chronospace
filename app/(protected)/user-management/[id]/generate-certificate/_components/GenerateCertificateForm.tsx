'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
  hasActiveCertificate: boolean;
}

export default function GenerateCertificateForm({ userId, userName, userEmail, hasActiveCertificate }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [certificate, setCertificate] = useState<{
    p12: string;
    password: string;
  } | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      setCertificate(null);

      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate certificate');
      }

      setSuccess(true);
      setCertificate({
        p12: data.certificate.p12,
        password: data.certificate.password,
      });

      // Refresh the page to update certificate status
      router.refresh();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate certificate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!certificate) return;

    // Convert base64 to blob
    const byteCharacters = atob(certificate.p12);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/x-pkcs12' });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName.replace(/\s+/g, '_')}_certificate.p12`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Navigate back to document viewer
    // router.push('/documents');
  };

  return (
    <div className="space-y-6">
      {hasActiveCertificate && (
        <Alert type="warning">
          This user already has an active certificate. Generating a new one will revoke the existing certificate.
        </Alert>
      )}

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      {success && certificate && (
        <Alert type="success">
          Certificate generated successfully! Please download the certificate and save the password securely.
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <p className="font-medium">User Details:</p>
          <p>Name: {userName}</p>
          <p>Email: {userEmail}</p>
        </div>

        {certificate && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Certificate Password:</p>
            <p className="font-mono bg-white p-2 rounded border mt-1">{certificate.password}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please save this password securely. You will need it to use the certificate.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Certificate'}
          </Button>

          {certificate && (
            <Button
              onClick={handleDownload}
              variant="outline"
            >
              Download Certificate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 