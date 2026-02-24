import { useState, useCallback } from 'react';
import type { ConfirmOptions } from '../components/common/ConfirmDialog';

type ResolveFn = (value: boolean) => void;

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [resolveRef, setResolveRef] = useState<ResolveFn | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolveRef(() => resolve);
      setState({
        ...options,
        isOpen: true,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
      setResolveRef(null);
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    if (resolveRef) {
      resolveRef(false);
      setResolveRef(null);
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  }, [resolveRef]);

  return {
    confirmState: state,
    confirm,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
}
