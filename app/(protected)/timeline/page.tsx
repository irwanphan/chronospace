'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Button from '@/components/ui/Button';
import TimelineList from '@/components/timeline/TimelineList';
import { PlusCircle, Settings } from 'lucide-react';
import BirthdaySlides from '@/components/timeline/BirthdaySlides';
import EventSlides from '@/components/timeline/EventSlides';
import TimelineItemModal from '@/components/timeline/TimelineItemModal';

export default function TimelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Update URL when tab changes
    router.push(`/timeline?tab=${activeTab}`, { scroll: false });
  }, [activeTab, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* <h1 className="text-2xl font-semibold">Timeline</h1> */}
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <PlusCircle size={16} />
          <span>Post on Timeline</span>
        </Button>
        <div className="flex items-center gap-2">
          <Link href="/timeline/management">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings size={16} />
              <span>Manage</span>
            </Button>
          </Link>
          
        </div>
      </div>

      {/*  set 2 columns, first is scrollable, second is fixed */}
      {/* 1st column takes 2/3 of the width, 2nd column takes 1/3 of the width but is sticky */}
      <div className="flex gap-4 relative">
        <div className="flex-1 overflow-y-auto h-full">
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <TabsList className="fixed bottom-8 left-24 bg-white z-10 border border-blue-500 px-4 rounded-full hover:shadow-md transition-all duration-300">
              <p className="text-sm font-medium">Filter by:</p>
              <TabsTrigger value="all">All</TabsTrigger> 
              <TabsTrigger value="event">Events</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="link">Links</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TimelineList type={null} />
            </TabsContent>
            
            <TabsContent value="event">
              <TimelineList type="event" />
            </TabsContent>
            
            <TabsContent value="news">
              <TimelineList type="news" />
            </TabsContent>
            
            <TabsContent value="link">
              <TimelineList type="link" />
            </TabsContent>
          </Tabs>

          <TimelineItemModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            initialType={activeTab !== 'all' ? activeTab : 'event'}
          />
          {/* <TimelineList /> */}
        </div>
        <div className="w-1/3 sticky top-24 self-start max-h-screen overflow-hidden">
          <BirthdaySlides />

          <EventSlides />
        </div>
      </div>
      
    </div>
  );
} 