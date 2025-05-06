'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

type EventType = {
  id: string;
  title: string;
  date: string;
  event: {
    location: string | null;
    startTime: string | null;
    endTime: string | null;
    organizer: string | null;
    isAllDay: boolean;
  };
};

export default function EventSlides() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/timeline?type=event&limit=5');
        const data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
          // Hanya ambil event yang memiliki date di masa depan
          const now = new Date();
          const futureEvents = data.items
            .filter((item: EventType) => new Date(item.date) >= now)
            .slice(0, 5); // Ambil maksimal 5 event
          
          if (futureEvents.length > 0) {
            setUpcomingEvents(futureEvents);
          } else {
            // Jika tidak ada future events, tampilkan semua events
            console.log('No future events found, using all events');
            setUpcomingEvents(data.items.slice(0, 5));
          }
        } else {
          console.log('No events returned from API');
          setUpcomingEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setUpcomingEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSlide = (direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setDirection(direction);
    setIsAnimating(true);
    
    // Menunggu animasi slide out selesai sebelum mengubah index
    setTimeout(() => {
      if (direction === 'left') {
        setCurrentIndex((prevIndex) => 
          prevIndex === 0 ? upcomingEvents.length - 1 : prevIndex - 1
        );
      } else {
        setCurrentIndex((prevIndex) => 
          prevIndex === upcomingEvents.length - 1 ? 0 : prevIndex + 1
        );
      }
      
      // Reset direction setelah index berubah untuk memulai animasi slide in
      setDirection(null);
      
      // Reset isAnimating setelah animasi selesai
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  };

  const goToPrevious = () => handleSlide('left');
  const goToNext = () => handleSlide('right');

  const jumpToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    
    // Tentukan arah berdasarkan indeks yang dituju
    const dir: 'left' | 'right' = 
      index > currentIndex ? 'right' : 'left';
      
    // Jika loncat dari akhir ke awal atau sebaliknya
    if (Math.abs(index - currentIndex) > 1) {
      if (index === 0 && currentIndex === upcomingEvents.length - 1) {
        handleSlide('right');
      } else if (index === upcomingEvents.length - 1 && currentIndex === 0) {
        handleSlide('left');
      } else {
        handleSlide(dir);
      }
    } else {
      handleSlide(dir);
    }
  };

  if (isLoading) {
    return (
      <div className="relative mt-6">
        <h3 className="font-medium text-gray-700 mb-2">Upcoming Events</h3>
        <div className="py-2 bg-orange-50 rounded-xl px-4">Loading events...</div>
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="relative mt-6">
        <div className="py-4 bg-orange-50 rounded-xl text-center text-gray-500">
          No upcoming events found.
        </div>
      </div>
    );
  }

  const currentEvent = upcomingEvents[currentIndex];

  // Menentukan kelas untuk animasi slide
  const getSlideAnimation = () => {
    if (direction === 'left') return 'animate-slide-out-right';
    if (direction === 'right') return 'animate-slide-out-left';
    return 'animate-slide-in';
  };

  return (
    <div className="relative mt-6">
      <div className="relative flex items-center bg-orange-500 rounded-xl px-12 pt-6 pb-8 overflow-hidden hover:shadow-lg transition-all duration-300">
        <button 
          onClick={goToPrevious} 
          disabled={isAnimating}
          className="absolute left-4 z-10 p-1 bg-white border border-transparent rounded-full shadow-md text-orange-500 hover:text-orange-700 hover:border-orange-600 transition-all duration-300 disabled:opacity-50"
          aria-label="Previous event"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="w-full relative h-28">
          <div 
            key={`slide-${currentEvent.id}`}
            className={`absolute inset-0 flex justify-between px-4 transition-all duration-300 ${getSlideAnimation()}`}
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: `translateX(${direction ? (direction === 'left' ? '100%' : '-100%') : '0'})`
            }}
          >
            <div 
              className="flex items-center gap-4 text-white"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm">Upcoming Event</p>
                <p className="font-semibold text-lg">{currentEvent.title}</p>
                <div className="flex items-center gap-1 text-sm">
                  <span>{formatDistanceToNow(new Date(currentEvent.date), { addSuffix: true })}</span>
                  <span>•</span>
                  <span>{format(new Date(currentEvent.date), 'MMM d, yyyy')}</span>
                </div>
                {currentEvent.event.location && (
                  <div className="flex items-center gap-1 text-sm mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-40">{currentEvent.event.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-16 min-w-16 h-16 bg-orange-200 rounded-full self-center flex items-center justify-center text-orange-600">
              <Calendar className="w-7 h-7" />
            </div>
          </div>
        </div>
        
        <button 
          onClick={goToNext}
          disabled={isAnimating}
          className="absolute right-4 z-10 p-1 bg-white border border-transparent rounded-full shadow-md text-orange-500 hover:text-orange-700 hover:border-orange-600 transition-all duration-300 disabled:opacity-50"
          aria-label="Next event"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center mt-3 gap-1 relative bottom-8 left-0 right-0 z-10">
        {upcomingEvents.map((_, index) => (
          <span 
            key={index} 
            className={`block h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-orange-800 scale-125' : 'bg-orange-200 hover:bg-orange-300'
            }`}
            onClick={() => jumpToSlide(index)}
            role="button"
            tabIndex={0}
            aria-label={`Go to event ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 