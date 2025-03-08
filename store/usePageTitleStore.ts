import { create } from 'zustand';

interface PageTitleStore {
  title: string;
  breadcrumbs: string[];
  setPage: (title: string, breadcrumbs: string[]) => void;
}

export const usePageTitleStore = create<PageTitleStore>((set) => ({
  title: '',
  breadcrumbs: [''],
  setPage: (title, breadcrumbs) => set({ title, breadcrumbs }),
})); 