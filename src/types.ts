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
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  created_at?: string;
  user_id?: string;
}