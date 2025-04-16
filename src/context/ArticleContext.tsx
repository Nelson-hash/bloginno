import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ArticleContextType {
  articles: Article[];
  categories: Category[];
  loading: boolean;
  addArticle: (article: Omit<Article, 'id'>) => Promise<Article | null>;
  updateArticle: (article: Article) => Promise<boolean>;
  deleteArticle: (id: number) => Promise<boolean>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  updateCategory: (category: Category) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Fetch articles and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch articles
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (articlesError) {
          console.error('Error fetching articles:', articlesError);
        } else {
          setArticles(articlesData || []);
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addArticle = async (article: Omit<Article, 'id'>): Promise<Article | null> => {
    if (!user) return null;

    try {
      const newArticle = {
        ...article,
        user_id: user.id,
      };

      const { data, error } = await supabase.from('articles').insert([newArticle]).select();

      if (error) {
        console.error('Error adding article:', error);
        return null;
      }

      const createdArticle = data[0];
      setArticles(prev => [createdArticle, ...prev]);
      return createdArticle;
    } catch (error) {
      console.error('Error adding article:', error);
      return null;
    }
  };

  const updateArticle = async (article: Article): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          date: article.date,
          read_time: article.readTime,
          image_url: article.imageUrl,
          video_url: article.videoUrl,
          updated_at: new Date(),
        })
        .eq('id', article.id);

      if (error) {
        console.error('Error updating article:', error);
        return false;
      }

      setArticles(prev => prev.map(a => a.id === article.id ? article : a));
      return true;
    } catch (error) {
      console.error('Error updating article:', error);
      return false;
    }
  };

  const deleteArticle = async (id: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);

      if (error) {
        console.error('Error deleting article:', error);
        return false;
      }

      setArticles(prev => prev.filter(article => article.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      return false;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
    if (!user) return null;

    try {
      const id = category.name.toLowerCase().replace(/\s+/g, '-');
      const newCategory = { 
        ...category, 
        id,
        user_id: user.id
      };

      const { data, error } = await supabase.from('categories').insert([newCategory]).select();

      if (error) {
        console.error('Error adding category:', error);
        return null;
      }

      const createdCategory = data[0];
      setCategories(prev => [...prev, createdCategory]);
      return createdCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  };

  const updateCategory = async (category: Category): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          icon: category.icon,
        })
        .eq('id', category.id);

      if (error) {
        console.error('Error updating category:', error);
        return false;
      }

      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    // Check if category is in use
    const categoryInUse = articles.some(article => article.category === id);
    if (categoryInUse) {
      console.error('Cannot delete category that is in use by articles');
      return false;
    }

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        return false;
      }

      setCategories(prev => prev.filter(category => category.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  };

  return (
    <ArticleContext.Provider value={{ 
      articles, 
      categories,
      loading,
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
