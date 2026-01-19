
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBlog } from '../services/blogService';
import { NewBlog } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ["ARCHITECTURE", "PHILOSOPHY", "DESIGN", "TECH", "FINANCE"];

export const CreateBlogModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<NewBlog>({
    title: '',
    category: ['ARCHITECTURE'],
    description: '',
    date: new Date().toISOString().split('T')[0],
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    content: ''
  });

  const mutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onClose();
      // Reset form
      setFormData({
        title: '',
        category: ['ARCHITECTURE'],
        description: '',
        date: new Date().toISOString().split('T')[0],
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
        content: ''
      });
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-ink/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[640px] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-ink animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-border flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-serif italic tracking-tight">New Archival Entry</h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-bold">Contribution Request — Form 24-B</p>
          </div>
          <button 
            onClick={onClose} 
            className="size-10 flex items-center justify-center text-muted-foreground hover:text-ink transition-colors border border-transparent hover:border-border"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Article Title</label>
            <input 
              required
              className="input-architectural text-lg font-serif italic" 
              placeholder="e.g. The Brutalist Renaissance" 
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              type="text"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Primary Category</label>
              <select 
                className="input-architectural py-[10px] font-bold text-[11px] tracking-widest"
                value={formData.category[0]}
                onChange={e => setFormData(prev => ({ ...prev, category: [e.target.value] }))}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Document Date</label>
              <input 
                className="input-architectural" 
                type="date" 
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Executive Summary</label>
            <textarea 
              required
              className="input-architectural font-light" 
              placeholder="A brief editorial abstract..." 
              rows={2}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            ></textarea>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Cover Imagery (URL)</label>
            <input 
              className="input-architectural" 
              placeholder="https://images.unsplash.com/..." 
              type="url"
              value={formData.coverImage}
              onChange={e => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Body Transcript</label>
            <textarea 
              required
              className="input-architectural font-serif leading-relaxed text-base" 
              placeholder="Compose the full archival content here..." 
              rows={8}
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
            ></textarea>
          </div>
          
          <div className="pt-8 flex justify-end items-center gap-6 bg-white sticky bottom-0 border-t border-slate-100 py-6">
            {mutation.isError && <span className="text-red-500 text-[10px] uppercase font-bold">Upload Failed. Try again.</span>}
            <button type="button" onClick={onClose} className="nav-underline py-2">Cancel</button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="btn-architectural btn-primary min-w-[140px]"
            >
              {mutation.isPending ? 'Syncing...' : 'Archive Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
