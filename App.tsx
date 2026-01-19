
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBlogs, fetchBlogById } from './services/blogService';
import { Blog } from './types';
import { CreateBlogModal } from './components/CreateBlogModal';
import { ListSkeleton, DetailSkeleton } from './components/SkeletonLoader';

const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainContentRef = useRef<HTMLElement>(null);

  // Sync mobile state
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Reading Progress
  useEffect(() => {
    const element = mainContentRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [selectedId]);

  // Handle URL Deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setSelectedId(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync History
  useEffect(() => {
    try {
      if (selectedId) {
        if (window.location.hash !== `#${selectedId}`) {
          window.history.replaceState(null, '', `#${selectedId}`);
        }
      } else if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname || '/');
      }
    } catch (e) {
      // Ignored
    }
  }, [selectedId]);

  // Toast Auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch Data
  const { data: blogs, isLoading: isListLoading, isError: isListError } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs,
  });

  const { data: selectedBlog, isLoading: isDetailLoading, isError: isDetailError } = useQuery({
    queryKey: ['blog', selectedId],
    queryFn: () => selectedId ? fetchBlogById(selectedId) : Promise.reject('No ID'),
    enabled: !!selectedId,
    retry: false,
  });

  const filteredBlogs = useMemo(() => {
    if (!blogs) return [];
    return blogs.filter(b => 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [blogs, searchTerm]);

  // Related Posts logic
  const relatedPosts = useMemo(() => {
    if (!blogs || !selectedBlog) return [];
    return blogs
      .filter(b => String(b.id) !== String(selectedBlog.id))
      .slice(0, 2);
  }, [blogs, selectedBlog]);

  // Default selection
  useEffect(() => {
    if (!isMobileView && blogs && blogs.length > 0 && selectedId === null) {
      setSelectedId(blogs[0].id);
    }
  }, [blogs, isMobileView, selectedId]);

  const handleShare = async () => {
    if (!selectedBlog) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#${selectedBlog.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `The Curator: ${selectedBlog.title}`,
          text: selectedBlog.description,
          url: shareUrl,
        });
        setToast({ message: "Shared to system.", type: "success" });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setToast({ message: "Link copied to clipboard.", type: "success" });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setToast({ message: "Could not share link.", type: "error" });
      }
    }
  };

  const handleExport = () => {
    setToast({ message: "Generating archival PDF...", type: "success" });
    setTimeout(() => {
      try { window.print(); } catch (e) {}
    }, 500);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 border text-[10px] font-bold uppercase tracking-[0.2em] animate-in slide-in-from-top-4 duration-500 shadow-2xl print-hidden ${toast.type === 'success' ? 'bg-ink text-white border-ink' : 'bg-red-600 text-white border-red-700'}`}>
          <div className="flex items-center gap-4">
            <span className="category-bullet bg-white"></span>
            {toast.message}
          </div>
        </div>
      )}

      {/* SIDEBAR: Archive List */}
      <aside className={`
        ${isMobileView && selectedId ? 'hidden' : 'flex'}
        w-full md:w-[380px] lg:w-[420px] h-full flex-col border-r border-border bg-sidebar-bg shrink-0 print-hidden
      `}>
        <div className="p-10 border-b border-border space-y-8">
          <div className="flex justify-between items-start">
            <div onClick={() => setSelectedId(null)} className="cursor-pointer group">
              <h1 className="font-serif text-4xl italic tracking-tighter leading-none text-ink group-hover:tracking-normal transition-all duration-700">The Curator</h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold mt-3">Editorial Ledger • Vol. 02</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="size-10 flex items-center justify-center bg-ink text-white hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          
          <div className="relative group">
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px] group-focus-within:text-ink transition-colors">search</span>
            <input 
              className="input-architectural py-3 pr-12 bg-transparent focus:bg-white" 
              placeholder="Search the ledger..." 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isListLoading ? (
            <ListSkeleton />
          ) : isListError ? (
            <div className="p-12 text-center text-sm text-red-500 font-medium font-serif italic">Archive link severed.</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-slate-200">history_edu</span>
              <p className="text-sm text-muted-foreground italic font-serif">No records match your inquiry.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredBlogs.map((blog) => (
                <div 
                  key={blog.id}
                  onClick={() => setSelectedId(blog.id)}
                  className={`shadcn-card cursor-pointer p-10 group transition-all duration-500 ${String(selectedId) === String(blog.id) ? 'active pl-12' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="category-label">
                      <span className="category-bullet"></span>
                      {blog.category[0]}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                      {new Date(blog.date).getFullYear()}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl leading-tight mb-4 group-hover:italic transition-all duration-300">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-light">
                    {blog.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="p-8 border-t border-border flex justify-between items-center bg-white/50">
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold">System v2.4.0-Editorial</span>
          <button onClick={() => setToast({ message: "Accessing documentation...", type: "success" })} className="nav-underline">Archives</button>
        </footer>
      </aside>

      {/* MAIN: Reading Context */}
      <main 
        ref={mainContentRef}
        className={`
          ${isMobileView && !selectedId ? 'hidden' : 'flex'}
          flex-1 h-full flex-col overflow-y-auto bg-white relative print:overflow-visible print:h-auto
        `}
      >
        {/* Scroll Progress Bar */}
        <div 
          className="fixed top-0 right-0 h-[3px] bg-ink z-[100] transition-all duration-150 print:hidden"
          style={{ width: `${scrollProgress}%`, left: 'auto' }}
        />

        <header className="flex justify-between items-center px-10 py-8 sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-border print:hidden">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setSelectedId(null)}
              className="text-muted-foreground hover:text-ink transition-colors flex items-center md:hidden"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hidden md:inline">Entry Context — {selectedBlog?.title || 'Inactive'}</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setToast({ message: "Archive locked.", type: "success" })} className="btn-architectural btn-primary py-2.5">Finalize View</button>
          </div>
        </header>

        <div className="flex-1">
          {isDetailLoading ? (
            <DetailSkeleton />
          ) : isDetailError ? (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-100 mb-6">inventory_2</span>
              <h2 className="font-serif text-3xl mb-4 italic">Archival Retrieval Failed</h2>
              <button onClick={() => setSelectedId(null)} className="btn-architectural btn-primary px-10">Return to Ledger</button>
            </div>
          ) : selectedBlog ? (
            <article className="max-w-4xl mx-auto px-8 md:px-12 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700 print:py-0">
              <div className="relative w-full aspect-[21/10] mb-20 md:mb-28 border border-border group overflow-hidden bg-slate-50 print:mb-10">
                <img 
                  alt={selectedBlog.title} 
                  className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] print:grayscale-0" 
                  src={selectedBlog.coverImage} 
                />
              </div>
              
              <div className="space-y-16 print:space-y-10">
                <div className="flex flex-wrap items-center gap-10 border-b border-border pb-12 print:pb-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Classification</span>
                    <span className="category-label text-sm"><span className="category-bullet"></span>{selectedBlog.category[0]}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Duration</span>
                    <span className="text-xs font-bold uppercase tracking-tighter text-ink">{selectedBlog.readingTime} min read</span>
                  </div>
                  <div className="flex flex-col gap-2 ml-auto text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Recorded</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-ink">{new Date(selectedBlog.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                
                <h2 className="font-serif text-ink text-6xl md:text-9xl leading-[0.85] tracking-tighter print:text-5xl">{selectedBlog.title}</h2>

                <div className="readable-measure pt-12 space-y-16 print:space-y-8 print:pt-4">
                  <p className="font-serif text-3xl md:text-4xl font-light leading-snug italic text-slate-700 border-l-2 border-ink pl-10 md:pl-16 print:text-2xl">{selectedBlog.description}</p>
                  <div className="prose prose-slate prose-xl max-w-none text-ink/90 font-sans leading-relaxed whitespace-pre-wrap print:prose-lg">
                    {selectedBlog.content}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="pt-24 mt-24 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-12 pb-20 print:hidden">
                  <div className="flex items-center gap-8">
                    <div className="size-20 bg-ink text-white flex items-center justify-center font-serif italic text-3xl">TC</div>
                    <div>
                      <p className="font-serif text-2xl italic leading-none">Editorial Board</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-3 font-bold">Verified Archival Entry • Secure Ledger</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setIsBookmarked(!isBookmarked); setToast({ message: isBookmarked ? "Entry unpinned." : "Entry pinned to ledger.", type: "success" }); }} 
                      className={`size-14 flex items-center justify-center border transition-all duration-300 ${isBookmarked ? 'bg-ink text-white border-ink' : 'text-muted-foreground hover:text-ink hover:border-ink border-border'}`}
                    >
                      <span className={`material-symbols-outlined text-[24px] ${isBookmarked ? 'fill-1' : ''}`}>bookmark</span>
                    </button>
                    <button onClick={handleShare} className="size-14 flex items-center justify-center border border-border text-muted-foreground hover:text-ink hover:border-ink transition-all">
                      <span className="material-symbols-outlined text-[24px]">ios_share</span>
                    </button>
                    <button onClick={handleExport} className="size-14 flex items-center justify-center border border-border text-muted-foreground hover:text-ink hover:border-ink transition-all">
                      <span className="material-symbols-outlined text-[24px]">print</span>
                    </button>
                  </div>
                </div>

                {/* Related Entries */}
                {relatedPosts.length > 0 && (
                  <div className="pt-20 border-t border-border space-y-12 print:hidden">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground text-center">Interconnected Records</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {relatedPosts.map(post => (
                        <div key={post.id} onClick={() => setSelectedId(post.id)} className="cursor-pointer group space-y-6">
                          <div className="aspect-[16/7] overflow-hidden border border-border">
                            <img src={post.coverImage} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{post.category[0]}</span>
                            <h5 className="font-serif text-xl italic group-hover:underline underline-offset-4">{post.title}</h5>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic font-serif opacity-30 select-none p-20 text-center animate-pulse">
              <span className="material-symbols-outlined text-9xl mb-10">menu_book</span>
              <p className="text-2xl tracking-tight leading-relaxed">Engage the ledger on the left to initiate decryption of archival data.</p>
            </div>
          )}
        </div>
      </main>

      <CreateBlogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default App;
