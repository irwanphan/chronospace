import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarStore = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: true,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: 'sidebar-storage',
    }
  )
); 