import { create } from 'zustand';
import { createBrowserSlice } from './slices/browserSlice';
import { createPersistenceSlice } from './slices/persistenceSlice';
import { createUiSlice } from './slices/uiSlice';
import type { ConfigStoreState } from './types';

export const useConfigStore = create<ConfigStoreState>()((...args) => ({
  ...createUiSlice(...args),
  ...createPersistenceSlice(...args),
  ...createBrowserSlice(...args),
}));
