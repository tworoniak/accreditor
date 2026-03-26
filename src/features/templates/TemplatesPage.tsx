import { useState } from 'react';
import { Plus, FileText, Pencil, Trash2, Copy } from 'lucide-react';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import { Modal } from '@/components/ui/Modal';
import { TemplateForm } from './TemplateForm';
import type { RequestTemplate } from '@/types/database';

export function TemplatesPage() {
  const { data: templates = [], isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<RequestTemplate | null>(null);
  const [previewing, setPreviewing] = useState<RequestTemplate | null>(null);

  return (
    <div className='p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Request templates
          </h1>
          <p className='text-sm text-gray-500'>{templates.length} templates</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className='flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600'
        >
          <Plus className='h-4 w-4' />
          New template
        </button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16 text-sm text-gray-400'>
          Loading…
        </div>
      ) : templates.length === 0 ? (
        <div className='rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-gray-400'>
          No templates yet — create your first pitch
        </div>
      ) : (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => setEditing(t)}
              onDelete={() => deleteTemplate.mutate(t.id)}
              onPreview={() => setPreviewing(t)}
            />
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title='New template'
        className='max-w-2xl'
      >
        <TemplateForm onSuccess={() => setCreateOpen(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title='Edit template'
        className='max-w-2xl'
      >
        {editing && (
          <TemplateForm template={editing} onSuccess={() => setEditing(null)} />
        )}
      </Modal>

      <Modal
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        title={previewing?.name ?? ''}
        className='max-w-2xl'
      >
        {previewing && (
          <div className='space-y-3'>
            {previewing.subject && (
              <div>
                <p className='mb-1 text-xs font-medium text-gray-500'>
                  Subject
                </p>
                <p className='rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700'>
                  {previewing.subject}
                </p>
              </div>
            )}
            <div>
              <p className='mb-1 text-xs font-medium text-gray-500'>Body</p>
              <pre className='whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 font-sans text-sm text-gray-700'>
                {previewing.body}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

interface CardProps {
  template: RequestTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

function TemplateCard({ template, onEdit, onDelete, onPreview }: CardProps) {
  return (
    <div
      className='group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md'
      onClick={onPreview}
    >
      <div className='mb-3 flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4 shrink-0 text-brand-500' />
          <p className='font-semibold text-gray-900'>{template.name}</p>
        </div>
        <div
          className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className='rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={onDelete}
            className='rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>

      {template.subject && (
        <p className='mb-2 truncate text-xs text-gray-500'>
          {template.subject}
        </p>
      )}

      <p className='line-clamp-3 text-xs text-gray-400'>{template.body}</p>

      <div className='mt-3 flex items-center gap-1 border-t border-gray-100 pt-3 text-xs text-gray-400'>
        <Copy className='h-3 w-3' />
        Click to preview
      </div>
    </div>
  );
}
