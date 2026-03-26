import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl',
          className,
        )}
      >
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-base font-semibold text-gray-900'>{title}</h2>
          <button
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
