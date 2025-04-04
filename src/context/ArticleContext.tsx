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

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  // Fetch initial data
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

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