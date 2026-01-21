'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function NewBudgetYearPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
  });
  const [errors, setErrors] = useState<{
    year?: string;
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/workspace-management/budget-year', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: parseInt(formData.year.toString()),
          isActive: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes('already exists')) {
          setErrors(prev => ({ ...prev, year: data.error }));
        } else {
          setErrors(prev => ({ ...prev, general: data.error }));
        }
        return;
      }

      router.push('/workspace-management/budget-year');
    } catch (error) {
      console.error('Error creating budget year:', error);
      setErrors({ general: 'Failed to create budget year' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 10;
  const maxYear = currentYear + 10;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Add Budget Year</h1>
      
      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errors.general}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium">
                Fiscal Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={minYear}
                max={maxYear}
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || currentYear }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.year ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={currentYear.toString()}
                required
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the fiscal year that will be available for budget planning
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only active budget years will be available for selection when creating budget planning requests.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Link
              href="/workspace-management/budget-year"
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Add Budget Year'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
