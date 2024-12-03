import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      userId: null,
      setUserId: (id) => set({ userId: id }),
      clearUser: () => set({ userId: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useStore;