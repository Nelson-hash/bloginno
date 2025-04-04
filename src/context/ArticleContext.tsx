import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ArticleContextType {
  articles: Article[];
  categories: Category[];
  addArticle: (article: Omit<Article, 'id' | 'user_id'>) => Promise<void>;
  updateArticle: (article: Article) => Promise<void>;
  deleteArticle: (id: number) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

// Mock data for when admin user is logged in without a real DB connection
const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Introduction to Service Innovation',
    date: 'April 1, 2025',
    readTime: '5 min read',
    summary: 'Learn about the fundamentals of service innovation and how it can transform your business.',
    content: 'Service innovation refers to the development of new or significantly improved service offerings. This includes changes in service products, service processes, and service business models. Today, service innovation is considered a key driver of economic growth and competitive advantage.\n\nSuccessful service innovation requires a deep understanding of customer needs, effective collaboration across departments, and a culture that encourages experimentation and continuous improvement. Organizations that excel at service innovation typically outperform their competitors in terms of revenue growth, customer satisfaction, and profitability.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    category: 'innovation',
    user_id: 'admin-user'
  },
  {
    id: 2,
    title: 'Digital Transformation Case Study',
    date: 'April 2, 2025',
    readTime: '7 min read',
    summary: 'How a traditional manufacturing company embraced digital transformation to improve customer experience.',
    content: 'This case study examines how XYZ Manufacturing, a 50-year-old traditional manufacturing company, successfully implemented a digital transformation strategy that revitalized their business model and customer relationships.\n\nFacing declining market share and increasing competition from more technologically advanced competitors, XYZ realized they needed to fundamentally rethink their approach to customer service and operational efficiency. Over an 18-month period, they implemented a comprehensive digital strategy that included a new customer portal, IoT sensors in their products, and a data analytics platform that provided real-time insights to both customers and internal teams.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
    category: 'project',
    user_id: 'admin-user'
  }
];

const MOCK_CATEGORIES: Category[] = [
  {
    id: 'innovation',
    name: 'Innovation',
    icon: 'Lightbulb',
    user_id: 'admin-user'
  },
  {
    id: 'project',
    name: 'Project Showcase',
    icon: 'Rocket',
    user_id: 'admin-user'
  },
  {
    id: 'update',
    name: 'Company Updates',
    icon: 'Bell',
    user_id: 'admin-user'
  }
];

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  // Fetch initial data
  useEffect(() => {
    // If the user is our special admin user, use mock data
    if (user?.id === 'admin-user') {
      setArticles(MOCK_ARTICLES);
      setCategories(MOCK_CATEGORIES);
    } else {
      // Otherwise, fetch from Supabase
      fetchArticles();
      fetchCategories();
    }
  }, [user]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addArticle = async (article: Omit<Article, 'id' | 'user_id'>) => {
    try {
      // Special handling for admin user
      if (user?.id === 'admin-user') {
        const newArticle: Article = {
          ...article,
          id: Math.max(0, ...articles.map(a => a.id)) + 1,
          user_id: 'admin-user'
        };
        setArticles(prev => [newArticle, ...prev]);
        return;
      }

      // Regular Supabase handling
      const { data, error } = await supabase
        .from('articles')
        .insert([{ ...article, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setArticles(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding article:', error);
      throw error;
    }
  };

  const updateArticle = async (article: Article) => {
    try {
      // Special handling for admin user
      if (user?.id === 'admin-user') {
        setArticles(prev => 
          prev.map(a => a.id === article.id ? article : a)
        );
        return;
      }

      // Regular Supabase handling
      const { error } = await supabase
        .from('articles')
        .update(article)
        .eq('id', article.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setArticles(prev => 
        prev.map(a => a.id === article.id ? article : a)
      );
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      // Special handling for admin user
      if (user?.id === 'admin-user') {
        setArticles(prev => prev.filter(article => article.id !== id));
        return;
      }

      // Regular Supabase handling
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
    try {
      // Generate a simple ID from the name
      const id = category.name.toLowerCase().replace(/\s+/g, '-');
      
      // Special handling for admin user
      if (user?.id === 'admin-user') {
        const newCategory: Category = {
          ...category,
          id,
          user_id: 'admin-user'
        };
        setCategories(prev => [...prev, newCategory]);
        return;
      }

      // Regular Supabase handling
      const newCategory = { ...category, id, user_id: user?.id };
      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      // Special handling for admin user
      if (user?.id === 'admin-user') {
        setCategories(prev => 
          prev.map(c => c.id === category.id ? category : c)
        );
        return;
      }

      // Regular Supabase handling
      const { error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', category.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCategories(prev => 
        prev.map(c => c.id === category.id ? category : c)
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Check if category is in use
      const inUse = articles.some(article => article.category === id);
      if (inUse) {
        throw new Error('Cannot delete category that is in use by articles');
      }

      // Special handling for admin user
      if (user?.id === 'admin-user') {
        setCategories(prev => prev.filter(category => category.id !== id));
        return;
      }

      // Regular Supabase handling
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
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
