import { create } from 'zustand';

const useVeganStore = create((set) => ({
  //狀態:是否開啟素食模式
  isVeganMode: false,
  
  toggleVeganMode: () => set((state)=> ({ isVeganMode: !state.isVeganMode })),
}));

export default useVeganStore;