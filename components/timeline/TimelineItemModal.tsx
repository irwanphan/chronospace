'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/Modal';
import { Calendar, Clock, MapPin, User, Link, FileText, Tag, Info } from 'lucide-react';

type TimelineItemType = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: string;
  isPublic: boolean;
  imageUrl: string | null;
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

type TimelineItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
  itemToEdit?: TimelineItemType;
};

export default function TimelineItemModal({
  isOpen,
  onClose,
  initialType = 'event',
  itemToEdit,
}: TimelineItemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: initialType,
    isPublic: true,
    imageUrl: '',
    event: {
      location: '',
      startTime: '',
      endTime: '',
      organizer: '',
      isAllDay: false,
    },
    news: {
      source: '',
      url: '',
      content: '',
    },
    link: {
      url: '',
      category: '',
      importance: 0,
    },
    thought: {
      content: '',
      mood: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when editing an existing item
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        title: itemToEdit.title || '',
        description: itemToEdit.description || '',
        date: itemToEdit.date ? new Date(itemToEdit.date).toISOString().split('T')[0] : '',
        type: itemToEdit.type || 'event',
        isPublic: itemToEdit.isPublic,
        imageUrl: itemToEdit.imageUrl || '',
        event: {
          location: itemToEdit.event?.location || '',
          startTime: itemToEdit.event?.startTime || '',
          endTime: itemToEdit.event?.endTime || '',
          organizer: itemToEdit.event?.organizer || '',
          isAllDay: itemToEdit.event?.isAllDay || false,
        },
        news: {
          source: itemToEdit.news?.source || '',
          url: itemToEdit.news?.url || '',
          content: itemToEdit.news?.content || '',
        },
        link: {
          url: itemToEdit.link?.url || '',
          category: itemToEdit.link?.category || '',
          importance: itemToEdit.link?.importance || 0,
        },
        thought: {
          content: itemToEdit.thought?.content || '',
          mood: itemToEdit.thought?.mood || '',
        },
      });
    } else {
      // Reset form on open
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: initialType,
        isPublic: true,
        imageUrl: '',
        event: {
          location: '',
          startTime: '',
          endTime: '',
          organizer: '',
          isAllDay: false,
        },
        news: {
          source: '',
          url: '',
          content: '',
        },
        link: {
          url: '',
          category: '',
          importance: 0,
        },
        thought: {
          content: '',
          mood: '',
        },
      });
    }
  }, [itemToEdit, initialType, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'type' && value === 'thought') {
      // Jika tipe berubah menjadi thought, kosongkan title, atur description ke empty, dan atur date ke hari ini
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        type: value,
        title: '',
        description: '',
        date: today
      }));
      return;
    }
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., event.location)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string | boolean | number>),
          [child]: type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked 
            : value
        }
      }));
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : value
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.type !== 'thought' && !formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.type !== 'thought' && !formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (formData.type === 'link' && !formData.link.url) {
      newErrors['link.url'] = 'URL is required for links';
    }
    
    if (formData.type === 'thought' && !formData.thought.content.trim()) {
      newErrors['thought.content'] = 'Content is required for thoughts';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const url = itemToEdit 
        ? `/api/timeline/${itemToEdit.id}` 
        : '/api/timeline';
      
      const method = itemToEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onClose();
        // Optionally trigger a refresh of the timeline list
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error saving timeline item:', error);
        setErrors({ submit: 'Failed to save. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving timeline item:', error);
      setErrors({ submit: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Edit Item' : 'Add New Timeline Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="event">Event</option>
            <option value="news">News</option>
            <option value="link">External Link</option>
            <option value="thought">Thought</option>
          </select>
        </div>
        
        {formData.type !== 'thought' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full border ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                } rounded-md px-3 py-2`}
                placeholder="Enter title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full border ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  } rounded-md px-3 py-2`}
                />
              </div>
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Enter description"
              />
            </div>
          </>
        )}
        
        {formData.type === 'thought' && (
          <div className="mb-4">
            <input
              type="hidden"
              name="date"
              value={formData.date}
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="rounded"
            />
            <span className="text-sm font-medium">Make public</span>
          </label>
        </div>
        
        {/* Type-specific fields */}
        {formData.type === 'event' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Event Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="event.location"
                  value={formData.event.location}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Organizer</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="event.organizer"
                  value={formData.event.organizer}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Who is organizing this event?"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="event.isAllDay"
                  checked={formData.event.isAllDay}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm font-medium">All-day event</span>
              </label>
            </div>
            
            {!formData.event.isAllDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Start Time</span>
                    </div>
                  </label>
                  <input
                    type="time"
                    name="event.startTime"
                    value={formData.event.startTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>End Time</span>
                    </div>
                  </label>
                  <input
                    type="time"
                    name="event.endTime"
                    value={formData.event.endTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {formData.type === 'news' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">News Details</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  <span>Source</span>
                </div>
              </label>
              <input
                type="text"
                name="news.source"
                value={formData.news.source}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter news source"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  <span>URL</span>
                </div>
              </label>
              <input
                type="url"
                name="news.url"
                value={formData.news.url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter news URL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>Content</span>
                </div>
              </label>
              <textarea
                name="news.content"
                value={formData.news.content}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Enter news content"
              />
            </div>
          </div>
        )}
        
        {formData.type === 'link' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Link Details</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  <span>URL <span className="text-red-500">*</span></span>
                </div>
              </label>
              <input
                type="url"
                name="link.url"
                value={formData.link.url}
                onChange={handleChange}
                className={`w-full border ${
                  errors['link.url'] ? 'border-red-500' : 'border-gray-300'
                } rounded-md px-3 py-2`}
                placeholder="Enter URL"
              />
              {errors['link.url'] && (
                <p className="text-red-500 text-sm mt-1">{errors['link.url']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>Category</span>
                </div>
              </label>
              <input
                type="text"
                name="link.category"
                value={formData.link.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Training, Documentation, Tools"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  <span>Importance (0-10)</span>
                </div>
              </label>
              <input
                type="number"
                min="0"
                max="10"
                name="link.importance"
                value={formData.link.importance}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        )}
        
        {formData.type === 'thought' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">What&apos;s on your mind?</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>Content <span className="text-red-500">*</span></span>
                </div>
              </label>
              <textarea
                name="thought.content"
                value={formData.thought.content}
                onChange={handleChange}
                className={`w-full border ${
                  errors['thought.content'] ? 'border-red-500' : 'border-gray-300'
                } rounded-md px-3 py-2`}
                rows={4}
                placeholder="Share your thoughts..."
              />
              {errors['thought.content'] && (
                <p className="text-red-500 text-sm mt-1">{errors['thought.content']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span>Mood</span>
                </div>
              </label>
              <select
                name="thought.mood"
                value={formData.thought.mood}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select your mood</option>
                <option value="happy">Happy 😊</option>
                <option value="excited">Excited 🎉</option>
                <option value="calm">Calm 😌</option>
                <option value="thoughtful">Thoughtful 🤔</option>
                <option value="tired">Tired 😴</option>
                <option value="sad">Sad 😢</option>
                <option value="angry">Angry 😠</option>
                <option value="anxious">Anxious 😰</option>
              </select>
            </div>
          </div>
        )}
        
        {errors.submit && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {errors.submit}
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : itemToEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 