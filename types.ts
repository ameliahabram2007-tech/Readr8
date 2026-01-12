
export interface BookReview {
  id: string;
  title: string;
  author: string;
  rating: number;
  reviewText: string;
  dateRead: string;
  year: number;
  coverUrl?: string;
  genres: string[];
}

export interface YearFolder {
  id: string;
  year: number;
}
