'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Button from '@/components/ui/Button';
import TimelineList from '@/components/timeline/TimelineList';
import { PlusCircle, Settings } from 'lucide-react';
import BirthdayList from '@/components/timeline/BirthdayList';
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
        <h1 className="text-2xl font-semibold">Timeline</h1>
        <div className="flex items-center gap-2">
          <Link href="/timeline/management">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings size={16} />
              <span>Manage</span>
            </Button>
          </Link>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <PlusCircle size={16} />
            <span>Add New</span>
          </Button>
        </div>
      </div>

      {/*  set 2 columns, first is scrollable, second is fixed */}
      {/* 1st column takes 2/3 of the width, 2nd column takes 1/3 of the width */}
      {/* 2nd column becomes first in mobile and scrollable */}
      <div className="flex gap-4">
        <div className="flex-1 overflow-y-auto">
          <TimelineList />
        </div>
        <div className="w-1/3">
          <BirthdayList />
        </div>
      </div>
      

      <div className="bg-white rounded-lg p-6 shadow-sm">

        {/* <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
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
        </Tabs> */}
      </div>

      <TimelineItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialType={activeTab !== 'all' ? activeTab : 'event'}
      />
    </div>
  );
} 