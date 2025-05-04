'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import Button from '@/components/ui/Button';
import { Calendar, Newspaper, Link2, ExternalLink, Edit, Trash2 } from 'lucide-react';

type TimelineItemType = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: string;
  isPublic: boolean;
  imageUrl: string | null;
  creator: {
    id: string;
    name: string;
    image: string | null;
  };
  event?: {
    location: string | null;
    startTime: string | null;
    endTime: string | null;
    organizer: string | null;
    isAllDay: boolean;
  };
  news?: {
    source: string | null;
    url: string | null;
    content: string | null;
  };
  link?: {
    url: string;
    category: string | null;
    importance: number;
  };
};

type TimelineListProps = {
  type: string | null;
};

export default function TimelineList({ type }: TimelineListProps) {
  const [items, setItems] = useState<TimelineItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<TimelineItemType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [type, page]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('page', page.toString());
      params.append('limit', '5');
      
      const response = await fetch(`/api/timeline?${params.toString()}`);
      const data = await response.json();
      
      if (data && data.items) {
        setItems(data.items);
        setTotalPages(data.meta.pages);
      }
    } catch (error) {
      console.error('Error fetching timeline items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: TimelineItemType) => {
    setCurrentItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: TimelineItemType) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentItem) return;
    
    try {
      const response = await fetch(`/api/timeline/${currentItem.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the list after deletion
        fetchItems();
        setIsDeleteModalOpen(false);
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting timeline item:', error);
    }
  };

  const TypeIcon = ({ type }: { type: string }) => {
    switch(type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'news':
        return <Newspaper className="w-5 h-5 text-green-500" />;
      case 'link':
        return <Link2 className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg">
        <p className="text-gray-500">No items found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <TypeIcon type={item.type} />
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    {item.type === 'event' && item.event?.location && (
                      <> • {item.event.location}</>
                    )}
                    {item.type === 'news' && item.news?.source && (
                      <> • {item.news.source}</>
                    )}
                  </p>
                  
                  {item.description && (
                    <p className="mt-2 text-sm text-gray-700">{item.description}</p>
                  )}
                  
                  {item.type === 'link' && item.link?.url && (
                    <a 
                      href={item.link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Link
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                  className="p-1 h-8 w-8 flex items-center justify-center"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(item)}
                  className="p-1 h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
      
      {/* Edit Modal would go here */}
      
      {/* Delete Confirmation Modal would go here */}
    </div>
  );
} 