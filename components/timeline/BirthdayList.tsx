'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { GiftIcon, Cake, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

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

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? upcomingBirthdays.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === upcomingBirthdays.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (isLoading) {
    return <div className="py-2">Loading birthdays...</div>;
  }

  if (upcomingBirthdays.length === 0) {
    return null; // Don't show anything if no upcoming birthdays
  }

  const currentUser = upcomingBirthdays[currentIndex];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Cake className="w-5 h-5 text-pink-500" />
        <h3 className="text-lg font-medium">Upcoming Birthdays</h3>
      </div>
      
      <Card className="relative flex items-center bg-pink-100">
        <button 
          onClick={goToPrevious} 
          className="absolute left-4 z-10 p-1 bg-white rounded-full shadow-md text-pink-500 hover:text-pink-700 hover:bg-pink-50"
          aria-label="Previous birthday"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="w-full flex justify-center px-10">
          <div 
            key={currentUser.id} 
            className="flex items-center gap-4 min-w-[250px] max-w-sm border border-pink-100 shadow-sm"
          >
            <div className="w-14 h-14 bg-pink-200 rounded-full flex items-center justify-center text-pink-600">
              {currentUser.image ? (
                <img src={currentUser.image} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <GiftIcon className="w-7 h-7" />
              )}
            </div>
            
            <div>
              <p className="font-medium text-lg">{currentUser.name}</p>
              <div className="flex items-center gap-1 text-sm text-pink-700">
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
        </div>
        
        <button 
          onClick={goToNext} 
          className="absolute right-4 z-10 p-1 bg-white rounded-full shadow-md text-pink-500 hover:text-pink-700 hover:bg-pink-50"
          aria-label="Next birthday"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </Card>
      
      {/* Pagination dots */}
      <div className="flex justify-center mt-3 gap-1">
        {upcomingBirthdays.map((_, index) => (
          <span 
            key={index} 
            className={`block h-2 w-2 rounded-full ${
              index === currentIndex ? 'bg-pink-500' : 'bg-pink-200'
            }`}
            onClick={() => setCurrentIndex(index)}
            role="button"
            tabIndex={0}
            aria-label={`Go to birthday ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 