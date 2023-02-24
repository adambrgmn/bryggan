'use client';

import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Loader, X } from 'react-feather';

export function CopyInput({ value }: { value: string }) {
  let [state, setState] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  let timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  async function handleClick() {
    clearTimeout(timeoutRef.current);

    try {
      setState('pending');
      await navigator.clipboard.writeText(value);
      setState('done');
    } catch (error) {
      setState('error');
    } finally {
      timeoutRef.current = setTimeout(() => setState('idle'), 2000);
    }
  }

  let buttonBackground = { 'bg-green-100': state === 'done', 'bg-red-100': state === 'error' };

  return (
    <div className="flex h-10 w-full flex-wrap items-stretch rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-50">
      <input type="text" value={value} readOnly className="flex-1 bg-transparent px-2" onClick={handleClick} />
      <button
        className={classNames(
          'flex w-10 items-center justify-center rounded-r border-l border-gray-300',
          buttonBackground,
        )}
        aria-label="Kopiera"
        onClick={handleClick}
      >
        {state === 'idle' ? <Copy aria-hidden size={16} /> : null}
        {state === 'pending' ? <Loader className="animate-spin" aria-hidden size={16} /> : null}
        {state === 'done' ? <Check aria-hidden size={16} className="text-green-600" /> : null}
        {state === 'error' ? <X aria-hidden size={16} className="text-red-600" /> : null}
      </button>
    </div>
  );
}
