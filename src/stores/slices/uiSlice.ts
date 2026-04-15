import type { BrowserTab } from '../../types';
import { createIdleActionState, type StoreSlice, type UiSlice } from '../types';

function createDirtyRecord(): Record<BrowserTab, boolean> {
  return {
    firefox: false,
    chrome: false,
  };
}

export const createUiSlice: StoreSlice<UiSlice> = (set) => ({
  isLoading: false,
  requestCount: 0,
  dirtyByTab: createDirtyRecord(),
  actionState: {
    firefox: createIdleActionState(),
    chrome: createIdleActionState(),
  },

  beginRequest: () =>
    set((state) => {
      const requestCount = state.requestCount + 1;
      return {
        requestCount,
        isLoading: requestCount > 0,
      };
    }),

  endRequest: () =>
    set((state) => {
      const requestCount = Math.max(0, state.requestCount - 1);
      return {
        requestCount,
        isLoading: requestCount > 0,
      };
    }),

  setDirty: (tab, dirty) =>
    set((state) => ({
      dirtyByTab: {
        ...state.dirtyByTab,
        [tab]: dirty,
      },
    })),

  clearDirty: (tab) =>
    set((state) => ({
      dirtyByTab: {
        ...state.dirtyByTab,
        [tab]: false,
      },
    })),

  setActionState: (tab, next) =>
    set((state) => ({
      actionState: {
        ...state.actionState,
        [tab]: {
          ...state.actionState[tab],
          ...next,
          updatedAt: Date.now(),
        },
      },
    })),

  resetActionState: (tab) =>
    set((state) => ({
      actionState: {
        ...state.actionState,
        [tab]: createIdleActionState(),
      },
    })),
});
