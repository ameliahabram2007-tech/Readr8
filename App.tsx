
import React, { useState, useEffect, useMemo } from 'react';
import { BookReview, YearFolder } from './types';
import StarRating from './components/StarRating';
import BookForm from './components/BookForm';

const App: React.FC = () => {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [folders, setFolders] = useState<YearFolder[]>([]);
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [modalState, setModalState] = useState<{ isOpen: boolean; editingReview: BookReview | null }>({
    isOpen: false,
    editingReview: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Persistence - Keep keys for continuity but update display names
  useEffect(() => {
    const savedReviews = localStorage.getItem('librolog_reviews');
    const savedFolders = localStorage.getItem('librolog_folders');
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedFolders) {
      const parsed = JSON.parse(savedFolders);
      setFolders(parsed);
      const currentYear = new Date().getFullYear();
      if (!parsed.find((f: YearFolder) => f.year === currentYear)) {
          if (parsed.length > 0) setActiveYear(parsed[0].year);
      } else {
          setActiveYear(currentYear);
      }
    } else {
      const defaultYear = new Date().getFullYear();
      setFolders([{ id: 'default', year: defaultYear }]);
      setActiveYear(defaultYear);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('librolog_reviews', JSON.stringify(reviews));
    localStorage.setItem('librolog_folders', JSON.stringify(folders));
  }, [reviews, folders]);

  const addFolder = () => {
    const yearStr = prompt("Für welches Jahr möchtest du einen Ordner erstellen?");
    if (yearStr) {
      const year = parseInt(yearStr);
      if (isNaN(year)) return alert("Bitte eine gültige Zahl eingeben.");
      if (folders.find(f => f.year === year)) return alert("Dieser Ordner existiert bereits.");
      
      const newFolders = [...folders, { id: Date.now().toString(), year }].sort((a, b) => b.year - a.year);
      setFolders(newFolders);
      setActiveYear(year);
    }
  };

  const deleteFolder = (id: string, year: number) => {
    if (confirm(`Möchtest du den Ordner für ${year} und alle darin enthaltenen Rezensionen wirklich löschen?`)) {
      const updatedFolders = folders.filter(f => f.id !== id);
      setFolders(updatedFolders);
      setReviews(reviews.filter(r => r.year !== year));
      if (activeYear === year && updatedFolders.length > 0) {
        setActiveYear(updatedFolders[0].year);
      }
    }
  };

  const handleSaveReview = (data: Omit<BookReview, 'id'>) => {
    if (modalState.editingReview) {
      setReviews(reviews.map(r => r.id === modalState.editingReview!.id ? { ...data, id: r.id } : r));
    } else {
      const newReview: BookReview = {
        ...data,
        id: Date.now().toString()
      };
      setReviews([newReview, ...reviews]);
    }
    setModalState({ isOpen: false, editingReview: null });
  };

  const deleteReview = (id: string) => {
    if (confirm("Rezension wirklich löschen?")) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const openEditModal = (review: BookReview) => {
    setModalState({ isOpen: true, editingReview: review });
  };

  const filteredReviews = useMemo(() => {
    return reviews
      .filter(r => r.year === activeYear)
      .filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [reviews, activeYear, searchTerm]);

  const stats = useMemo(() => {
    const currentYearReviews = reviews.filter(r => r.year === activeYear);
    const avgRating = currentYearReviews.length > 0 
      ? (currentYearReviews.reduce((acc, curr) => acc + curr.rating, 0) / currentYearReviews.length).toFixed(1)
      : 0;
    return {
      count: currentYearReviews.length,
      avg: avgRating
    };
  }, [reviews, activeYear]);

  return (
    <div className="min-h-screen bg-[#fcfdfd] pb-12 text-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Readr8</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-600">Deine Lese-Historie</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Bibliothek durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 w-full md:w-80 text-sm transition-all"
              />
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => setModalState({ isOpen: true, editingReview: null })}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Neues Buch
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sidebar - Navigation & Folders */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Deine Ordner</h2>
              <button 
                onClick={addFolder}
                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </button>
            </div>
            
            <nav className="space-y-2">
              {folders.map(folder => (
                <div key={folder.id} className="group relative">
                  <button
                    onClick={() => setActiveYear(folder.year)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-4 transition-all ${
                      activeYear === folder.year 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold translate-x-1' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeYear === folder.year ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <span className="flex-1">{folder.year}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeYear === folder.year ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      {reviews.filter(r => r.year === folder.year).length}
                    </span>
                  </button>
                  {folder.id !== 'default' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id, folder.year); }}
                      className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all bg-white rounded-full shadow-sm border border-slate-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* Detailed Year Stats */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 overflow-hidden relative">
            <div className="relative z-10 space-y-4">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Statistik {activeYear}</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                      <p className="text-2xl font-black">{stats.count}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Bücher</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
                      <p className="text-2xl font-black">{stats.avg}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Rating Ø</p>
                  </div>
              </div>
              <div className="pt-2">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (stats.count / 12) * 100)}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Ziel: 12 Bücher pro Jahr ({Math.round((stats.count / 12) * 100)}%)</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-9 space-y-8">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
                <h2 className="text-4xl font-black text-slate-900">{activeYear}</h2>
                <p className="text-slate-500 font-medium mt-1">Deine kuratierte Sammlung an gelesenen Werken.</p>
            </div>
            <div className="hidden md:block text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                {filteredReviews.length} EINTRÄGE GEFUNDEN
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center">
              <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Die Seiten sind noch leer...</h3>
              <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto font-medium">Halte deine Gedanken zu deinem zuletzt gelesenen Buch fest und fülle deinen {activeYear}er Katalog.</p>
              <button
                onClick={() => setModalState({ isOpen: true, editingReview: null })}
                className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                Erste Rezension schreiben
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredReviews.map(review => (
                <div key={review.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex gap-6 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 group relative overflow-hidden">
                  {/* Visual Background Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors duration-500"></div>
                  
                  <div className="w-28 md:w-32 flex-shrink-0 relative z-10">
                    <img 
                      src={review.coverUrl} 
                      alt={review.title} 
                      className="w-full aspect-[2/3] object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between relative z-10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="max-w-[75%]">
                          <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{review.title}</h3>
                          <p className="text-slate-500 text-xs font-bold mt-0.5">VON {review.author.toUpperCase()}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-1">{review.rating}/5</span>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < review.rating ? 'bg-yellow-400' : 'bg-slate-200'}`}></div>
                                ))}
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {review.genres.slice(0, 2).map(genre => (
                          <span key={genre} className="text-[9px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {genre}
                          </span>
                        ))}
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 italic pt-2 border-t border-slate-50">
                        "{review.reviewText}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(review.dateRead).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}</span>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => openEditModal(review)}
                                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Bearbeiten"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </button>
                            <button 
                                onClick={() => deleteReview(review.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Löschen"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          <div>© {new Date().getFullYear()} READR8</div>
          <div className="flex gap-6">
              <a href="#" className="hover:text-indigo-600 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Impressum</a>
          </div>
      </footer>

      {/* Add/Edit Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setModalState({ isOpen: false, editingReview: null })}
          ></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="px-8 py-6 bg-slate-50/50 border-b flex justify-between items-center">
              <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {modalState.editingReview ? 'Rezension bearbeiten' : 'Neues Abenteuer'}
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Katalog {activeYear}</p>
              </div>
              <button 
                onClick={() => setModalState({ isOpen: false, editingReview: null })}
                className="p-2.5 bg-white text-slate-400 hover:text-slate-600 rounded-2xl border border-slate-100 shadow-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <BookForm 
                initialData={modalState.editingReview}
                onSubmit={handleSaveReview} 
                onCancel={() => setModalState({ isOpen: false, editingReview: null })}
                activeYear={activeYear}
              />
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
