export interface Article {
  id: number;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
  imageUrl: string;
  videoUrl?: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}