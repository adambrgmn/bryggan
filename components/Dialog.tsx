'use client';

import { forwardRef, useCallback } from 'react';

import { mergeRefs } from '@/lib/utils/refs';

type DialogProps = Omit<
  React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>,
  'ref'
>;

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog({ children, ...props }, forwardRef) {
  let callback = useCallback((el: HTMLDialogElement | null) => {
    if (el != null && !el.open) el.showModal();
  }, []);

  return (
    <dialog {...props} ref={mergeRefs(forwardRef, callback)}>
      {children}
    </dialog>
  );
});
