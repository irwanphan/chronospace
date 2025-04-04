import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { FileSignature, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';

interface Signature {
  id: string;
  signedAt: string;
  order: number;
  user: {
    name: string;
    role: {
      roleName: string;
    };
  };
}

interface SignaturesListProps {
  fileUrl: string;
}

export default function SignaturesList({ fileUrl }: SignaturesListProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignatures = async () => {
      if (!fileUrl) return;

      try {
        const response = await fetch(`/api/documents/signatures?url=${encodeURIComponent(fileUrl)}`);
        if (!response.ok) throw new Error('Failed to fetch signatures');
        const data = await response.json();
        setSignatures(data.signatures);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignatures();
  }, [fileUrl]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <FileSignature className="w-4 h-4" />
          Loading signatures...
        </div>
      </Card>
    );
  }

  if (!signatures.length) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <FileSignature className="w-4 h-4" />
          No signatures yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Document Signatures</h2>
      <div className="space-y-4">
        {signatures.map((signature, index) => (
          <div key={signature.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
            <div className="mt-1">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{signature.user.name}</span>
                <span className="text-sm text-gray-500">({signature.user.role.roleName})</span>
              </div>
              <div className="text-sm text-gray-500">
                Signed on {formatDate(new Date(signature.signedAt))}
              </div>
              <div className="text-sm text-gray-400">
                Signature #{index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 