'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Pagination from '@/components/Pagination';
import Button from '@/components/ui/Button';
import { 
  ExternalLink, 
  Edit, 
  Trash2 
} from 'lucide-react';
import TimelineItemModal from '@/components/timeline/TimelineItemModal';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import { getInitials } from '@/lib/utils';

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

  // const TypeIcon = ({ type }: { type: string }) => {
  //   switch(type) {
  //     case 'event':
  //       return <Calendar className="w-5 h-5 text-blue-500" />;
  //     case 'news':
  //       return <Newspaper className="w-5 h-5 text-green-500" />;
  //     case 'link':
  //       return <Link2 className="w-5 h-5 text-purple-500" />;
  //     default:
  //       return null;
  //   }
  // };

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
          <Card key={item.id} className="py-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {/* <TypeIcon type={item.type} /> */}
                  <Avatar>
                    {getInitials(item.creator.name)}
                  </Avatar>
                </div>
                <div>
                  <h3 className="font-medium">{item.creator.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    {item.type === 'event' && item.event?.location && (
                      <> • {item.event.location}</>
                    )}
                    {item.type === 'news' && item.news?.source && (
                      <> • {item.news.source}</>
                    )}
                  </p>
                  
                  {item.title && (
                    <p className="mt-2 text-md font-semibold text-gray-700">{item.title}</p>
                  )}
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
          </Card>
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalItems={totalPages * 5}
          itemsPerPage={5}
          onPageChange={setPage}
        />
      )}
      
      {/* Edit Modal */}
      {isEditModalOpen && currentItem && (
        <TimelineItemModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialType={currentItem.type}
          itemToEdit={currentItem}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 