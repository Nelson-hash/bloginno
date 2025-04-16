import React, { createContext, useContext, useState } from 'react';
import { Article, Category } from '../types';

interface ArticleContextType {
  articles: Article[];
  categories: Category[];
  addArticle: (article: Omit<Article, 'id'>) => void;
  updateArticle: (article: Article) => void;
  deleteArticle: (id: number) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

// Mock initial data
const initialArticles: Article[] = [
  {
    id: 1,
    title: "The Future of AI in Service Design",
    summary: "Exploring how artificial intelligence is reshaping service design and customer experiences",
    content: "Artificial intelligence is revolutionizing how we design and deliver services. From chatbots to predictive analytics, AI is enabling more personalized and efficient service experiences. This article explores the latest trends and future possibilities in AI-driven service design.",
    date: "March 7, 2025",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    category: "innovation",
  },
  {
    id: 2,
    title: "Sustainable Service Solutions",
    summary: "How companies are incorporating sustainability into their service offerings",
    content: "Sustainability is no longer optional in service design. This article examines how leading companies are redesigning their services to be more environmentally friendly while maintaining high quality and user satisfaction.",
    date: "March 6, 2025",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c",
    category: "project",
  },
  {
    id: 3,
    title: "Digital Transformation Success Stories",
    summary: "Case studies of successful digital transformation initiatives",
    content: "Digital transformation is reshaping industries. Through these case studies, we explore how organizations have successfully navigated their digital transformation journeys.",
    date: "March 5, 2025",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    category: "update",
  }
];

const initialCategories: Category[] = [
  {
    id: "innovation",
    name: "Innovation",
    icon: "Lightbulb"
  },
  {
    id: "project",
    name: "Projects",
    icon: "Rocket"
  },
  {
    id: "update",
    name: "Updates",
    icon: "RefreshCw"
  }
];

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const addArticle = (article: Omit<Article, 'id'>) => {
    const newArticle = {
      ...article,
      id: Math.max(...articles.map(a => a.id), 0) + 1
    };
    setArticles(prev => [newArticle, ...prev]);
  };

  const updateArticle = (article: Article) => {
    setArticles(prev => prev.map(a => a.id === article.id ? article : a));
  };

  const deleteArticle = (id: number) => {
    setArticles(prev => prev.filter(article => article.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    const newCategory = { ...category, id };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (category: Category) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c));
  };

  const deleteCategory = (id: string) => {
    const inUse = articles.some(article => article.category === id);
    if (inUse) {
      throw new Error('Cannot delete category that is in use by articles');
    }
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  return (
    <ArticleContext.Provider value={{ 
      articles, 
      categories,
      addArticle, 
      updateArticle, 
      deleteArticle,
      addCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticles = (): ArticleContextType => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};