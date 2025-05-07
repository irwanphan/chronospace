'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import { PlusCircle, Calendar, Newspaper, Link2, Edit, Trash2, Check, X } from 'lucide-react';
import TimelineItemModal from '@/components/timeline/TimelineItemModal';

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

export default function TimelineManagementPage() {
  const [items, setItems] = useState<TimelineItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TimelineItemType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '50'); // Get more items for admin view
      
      if (filter !== 'all') {
        params.append('type', filter);
      }
      
      const response = await fetch(`/api/timeline?${params.toString()}`);
      const data = await response.json();
      
      if (data && data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching timeline items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const handleEdit = (item: TimelineItemType) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      const response = await fetch(`/api/timeline/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the list after deletion
        fetchItems();
        setConfirmDelete(null);
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting timeline item:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
    fetchItems(); // Refresh data when modal closes
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Timeline Management</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle size={16} />
          <span>Add New Item</span>
        </Button>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('event')}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              filter === 'event' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <Calendar size={14} />
            Events
          </button>
          <button
            onClick={() => setFilter('news')}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              filter === 'news' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`}
          >
            <Newspaper size={14} />
            News
          </button>
          <button
            onClick={() => setFilter('link')}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              filter === 'link' 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Link2 size={14} />
            Links
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <p className="text-gray-500">No items found. Create your first timeline item!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Created By</th>
                  <th className="px-4 py-3 text-left">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <TypeIcon type={item.type} />
                        <span className="ml-2 capitalize">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3">{format(new Date(item.date), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">{item.creator.name}</td>
                    <td className="px-4 py-3">
                      {item.isPublic ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Public
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Private
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          className="p-1 h-8 w-8 flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        {confirmDelete === item.id ? (
                          <>
                            <Button
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                              className="p-1 h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setConfirmDelete(null)}
                              className="p-1 h-8 w-8 flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="p-1 h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <TimelineItemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        itemToEdit={itemToEdit ?? undefined}
        initialType={filter !== 'all' ? filter : undefined}
      />
    </div>
  );
} 