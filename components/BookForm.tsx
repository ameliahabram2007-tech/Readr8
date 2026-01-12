
import React, { useState, useEffect } from 'react';
import { BookReview } from '../types';
import StarRating from './StarRating';
import { getBookInsights } from '../services/geminiService';
import { DEFAULT_GENRES } from '../constants';

interface BookFormProps {
  initialData?: BookReview | null;
  onSubmit: (data: Omit<BookReview, 'id'>) => void;
  onCancel: () => void;
  activeYear: number;
}

const BookForm: React.FC<BookFormProps> = ({ initialData, onSubmit, onCancel, activeYear }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [reviewText, setReviewText] = useState(initialData?.reviewText || '');
  const [dateRead, setDateRead] = useState(initialData?.dateRead || new Date().toISOString().split('T')[0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialData?.genres || []);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || rating === 0) {
      alert("Bitte fülle Titel, Autor und Bewertung aus!");
      return;
    }
    onSubmit({
      title,
      author,
      rating,
      reviewText,
      dateRead,
      year: initialData?.year || activeYear,
      genres: selectedGenres,
      coverUrl: initialData?.coverUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/300/450`
    });
  };

  const handleAIHelp = async () => {
    if (!title || !author) {
      alert("Bitte gib erst Titel und Autor ein.");
      return;
    }
    setLoadingAI(true);
    const insights = await getBookInsights(title, author);
    if (insights) {
      setReviewText(insights.summary);
      setSelectedGenres(insights.genres);
    }
    setLoadingAI(false);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buchtitel</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-300"
            placeholder="z.B. Der kleine Prinz"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Autor</label>
          <input
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-300"
            placeholder="z.B. Antoine de Saint-Exupéry"
          />
        </div>
      </div>

      <div className="flex flex-col items-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100/50">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Deine Wertung</label>
        <StarRating rating={rating} onRatingChange={setRating} interactive />
        <p className="mt-4 text-xs font-black text-indigo-600/60 uppercase tracking-widest">
            {rating === 0 ? 'Klicke zum Bewerten' : `${rating} von 5 Sternen`}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deine Rezension</label>
          <button
            type="button"
            onClick={handleAIHelp}
            disabled={loadingAI}
            className={`group flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-full border transition-all ${
                loadingAI 
                ? 'bg-slate-100 border-slate-200 text-slate-400' 
                : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100'
            }`}
          >
            {loadingAI ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Schreibe Analyse...
                </span>
            ) : (
                <>
                    <span className="group-hover:animate-pulse">✨</span> KI-INSIGHTS NUTZEN
                </>
            )}
          </button>
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-300 leading-relaxed"
          placeholder="Wie hat dich die Geschichte berührt? Was bleibt dir in Erinnerung?"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Genre-Kategorien</label>
        <div className="flex flex-wrap gap-2.5">
          {DEFAULT_GENRES.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all border ${
                selectedGenres.includes(genre)
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <button
          type="submit"
          className="flex-[2] bg-indigo-600 text-white px-6 py-4 rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-100 active:scale-95"
        >
          {initialData ? 'Änderungen speichern' : 'Rezension hinzufügen'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-4 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
};

export default BookForm;
