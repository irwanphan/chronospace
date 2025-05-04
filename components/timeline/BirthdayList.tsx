'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { GiftIcon, ChevronLeft, ChevronRight } from 'lucide-react';

type User = {
  id: string;
  name: string;
  image: string | null;
  birthday: string;
  daysUntilBirthday: number;
};

export default function BirthdayList() {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Langsung gunakan mock data tanpa fetch API
    const mockBirthdays = [
      {
        id: '1',
        name: 'John Doe',
        image: null,
        birthday: '1990-05-15',
        daysUntilBirthday: 3
      },
      {
        id: '2',
        name: 'Jane Smith',
        image: null,
        birthday: '1985-06-22',
        daysUntilBirthday: 7
      },
      {
        id: '3',
        name: 'Alex Johnson',
        image: null,
        birthday: '1992-07-10',
        daysUntilBirthday: 14
      },
      {
        id: '4',
        name: 'Sarah Williams',
        image: null,
        birthday: '1988-06-05',
        daysUntilBirthday: 21
      },
      {
        id: '5',
        name: 'Michael Brown',
        image: null,
        birthday: '1993-07-18',
        daysUntilBirthday: 25
      }
    ];
    setUpcomingBirthdays(mockBirthdays);
    setIsLoading(false);
  }, []);

  const handleSlide = (direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setDirection(direction);
    setIsAnimating(true);
    
    // Menunggu animasi slide out selesai sebelum mengubah index
    setTimeout(() => {
      if (direction === 'left') {
        setCurrentIndex((prevIndex) => 
          prevIndex === 0 ? upcomingBirthdays.length - 1 : prevIndex - 1
        );
      } else {
        setCurrentIndex((prevIndex) => 
          prevIndex === upcomingBirthdays.length - 1 ? 0 : prevIndex + 1
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
      if (index === 0 && currentIndex === upcomingBirthdays.length - 1) {
        handleSlide('right');
      } else if (index === upcomingBirthdays.length - 1 && currentIndex === 0) {
        handleSlide('left');
      } else {
        handleSlide(dir);
      }
    } else {
      handleSlide(dir);
    }
  };

  if (isLoading) {
    return <div className="py-2">Loading birthdays...</div>;
  }

  if (upcomingBirthdays.length === 0) {
    return null; // Don't show anything if no upcoming birthdays
  }

  const currentUser = upcomingBirthdays[currentIndex];

  // Menentukan kelas untuk animasi slide
  const getSlideAnimation = () => {
    if (direction === 'left') return 'animate-slide-out-right';
    if (direction === 'right') return 'animate-slide-out-left';
    return 'animate-slide-in';
  };

  return (
    <div className="relative">
      <div className="relative flex items-center bg-sky-500 rounded-xl px-12 pt-6 pb-8 overflow-hidden hover:shadow-lg transition-all duration-300">
        <button 
          onClick={goToPrevious} 
          disabled={isAnimating}
          className="absolute left-4 z-10 p-1 bg-white border border-transparent rounded-full shadow-md text-blue-500 hover:text-blue-700 hover:border-blue-600 transition-all duration-300 disabled:opacity-50"
          aria-label="Previous birthday"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="w-full relative h-24">
          <div 
            key={`slide-${currentUser.id}`}
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
                <p className="text-sm">Upcoming Birthday</p>
                <p className="font-semibold text-lg">{currentUser.name}</p>
                <div className="flex items-center gap-1 text-sm">
                  <span>
                    {currentUser.daysUntilBirthday === 0 
                      ? 'Today!' 
                      : currentUser.daysUntilBirthday === 1 
                        ? 'Tomorrow!' 
                        : `In ${currentUser.daysUntilBirthday} days`}
                  </span>
                  <span>•</span>
                  <span>{format(new Date(currentUser.birthday), 'MMM d')}</span>
                </div>
              </div>
            </div>

            <div className="w-16 h-16 bg-sky-200 rounded-full self-center flex items-center justify-center text-sky-600">
              {currentUser.image ? (
                <Image src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" width={56} height={56} />
              ) : (
                <GiftIcon className="w-7 h-7" />
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={goToNext}
          disabled={isAnimating}
          className="absolute right-4 z-10 p-1 bg-white border border-transparent rounded-full shadow-md text-blue-500 hover:text-blue-700 hover:border-blue-600 transition-all duration-300 disabled:opacity-50"
          aria-label="Next birthday"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center mt-3 gap-1 relative bottom-8 left-0 right-0 z-10">
        {upcomingBirthdays.map((_, index) => (
          <span 
            key={index} 
            className={`block h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-sky-800 scale-125' : 'bg-sky-200 hover:bg-sky-300'
            }`}
            onClick={() => jumpToSlide(index)}
            role="button"
            tabIndex={0}
            aria-label={`Go to birthday ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 