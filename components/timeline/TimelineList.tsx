'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import Pagination from '@/components/Pagination';
import Button from '@/components/ui/Button';
import { 
  ExternalLink, 
  Edit, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import TimelineItemModal from '@/components/timeline/TimelineItemModal';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import { getInitials } from '@/lib/utils';
import { IconCalendarFilled, IconClockFilled, IconMapPinFilled, IconQuoteFilled } from '@tabler/icons-react';
import LoadingSpin from '../ui/LoadingSpin';

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
  thought?: {
    content: string;
    mood: string | null;
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [type, page]);

  useEffect(() => {
    // Add click outside listener to close the dropdown menu
    function handleClickOutside(event: MouseEvent) {
      if (!activeMenu) return;
      
      const target = event.target as Element;
      const clickedOnMenu = target.closest(`[data-item-id="${activeMenu}"]`);
      
      if (!clickedOnMenu) {
        setActiveMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

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

  if (isLoading) {
    return <LoadingSpin />
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
      <div className="">
        {items.map((item) => (
          <Card key={item.id} className="py-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 w-full">
                <div className="mt-1">
                  {/* <TypeIcon type={item.type} /> */}
                  <Avatar>
                    {getInitials(item.creator.name)}
                  </Avatar>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <h3 className="font-medium">{item.creator.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    {item.type === 'news' && item.news?.source && (
                      <> • {item.news.source}</>
                    )}
                  </p>
                  
                  <div className={`${item.type === 'event' ? 'p-3 border block w-full border-gray-200 rounded-xl' : 'mt-2'}`}>
                    {item.title && item.type !== 'thought' && (
                      <p className="text-md font-semibold text-gray-700">{item.title}</p>
                    )}
                    {item.type === 'event' && item.event?.location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1"><IconMapPinFilled className="w-4 h-4" />{item.event.location}</p>
                    )}
                    {item.type === 'event' && item.date && (
                      <p className="text-sm text-gray-500 flex items-center gap-1"><IconCalendarFilled className="w-4 h-4" />{format(new Date(item.date), 'dd MMMM yyyy')}</p>
                    )}
                    {item.type === 'event' && item.event?.startTime && item.event?.endTime && (
                      <p className="text-sm text-gray-500 flex items-center gap-1"><IconClockFilled className="w-4 h-4" />{format(new Date(item.event.startTime), 'HH:mm')} - {format(new Date(item.event.endTime), 'HH:mm')}</p>
                    )}
                    {item.description && item.type !== 'thought' && (
                      <p className="mt-2 text-sm text-gray-700">{item.description}</p>
                    )}
                  </div>
                  
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
                  
                  {item.type === 'thought' && item.thought?.content && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100 flex gap-1">
                      <IconQuoteFilled className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-gray-700">{item.thought.content}</p>
                        {item.thought.mood && (
                          <p className="mt-1 text-sm text-gray-500">{item.creator.name} is feeling {item.thought.mood}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div className="relative" data-item-id={item.id}>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === item.id ? null : item.id);
                    }}
                    className="p-1 h-8 w-8 flex items-center justify-center"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  
                  {activeMenu === item.id && (
                    <div 
                      className="absolute right-0 mt-1 w-36 bg-white shadow-lg rounded-md overflow-hidden z-10 border border-gray-200"
                      data-item-id={item.id}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          handleEdit(item);
                          setActiveMenu(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(item);
                          setActiveMenu(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
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