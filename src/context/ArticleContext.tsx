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

// Initial data as fallback
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
  const [loading, setLoading] = useState<boolean>(true);
  const { user, isAuthenticated } = useAuth();

  // Fetch articles and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch articles from Supabase
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (articlesError) {
          console.error('Error fetching articles from Supabase:', articlesError);
          // If there's an error with Supabase, we'll use the initial data
        } else if (articlesData && articlesData.length > 0) {
          // Transform the data to match our Article type
          const transformedArticles: Article[] = articlesData.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            date: item.date,
            readTime: item.read_time,
            imageUrl: item.image_url,
            videoUrl: item.video_url,
            category: item.category
          }));
          setArticles(transformedArticles);
        }

        // Fetch categories from Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) {
          console.error('Error fetching categories from Supabase:', categoriesError);
          // If there's an error with Supabase, we'll use the initial data
        } else if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // If there's an error, we'll use the initial data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addArticle = async (article: Omit<Article, 'id'>): Promise<Article | null> => {
    if (!isAuthenticated || !user) return null;

    try {
      const newArticle = {
        title: article.title,
        summary: article.summary,
        content: article.content,
        date: article.date,
        read_time: article.readTime,
        image_url: article.imageUrl,
        video_url: article.videoUrl,
        category: article.category,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([newArticle])
        .select();

      if (error) {
        console.error('Error adding article to Supabase:', error);
        return null;
      }

      // Transform the response to match our Article type
      const createdArticle: Article = {
        id: data[0].id,
        title: data[0].title,
        summary: data[0].summary,
        content: data[0].content,
        date: data[0].date,
        readTime: data[0].read_time,
        imageUrl: data[0].image_url,
        videoUrl: data[0].video_url,
        category: data[0].category
      };

      setArticles(prev => [createdArticle, ...prev]);
      return createdArticle;
    } catch (error) {
      console.error('Error adding article:', error);
      return null;
    }
  };

  const updateArticle = async (article: Article): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

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
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (error) {
        console.error('Error updating article in Supabase:', error);
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
    if (!isAuthenticated || !user) return false;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting article from Supabase:', error);
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
    if (!isAuthenticated || !user) return null;

    try {
      const id = category.name.toLowerCase().replace(/\s+/g, '-');
      const newCategory = { 
        id,
        name: category.name,
        icon: category.icon,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select();

      if (error) {
        console.error('Error adding category to Supabase:', error);
        return null;
      }

      const createdCategory: Category = data[0];
      setCategories(prev => [...prev, createdCategory]);
      return createdCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  };

  const updateCategory = async (category: Category): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          icon: category.icon
        })
        .eq('id', category.id);

      if (error) {
        console.error('Error updating category in Supabase:', error);
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
    if (!isAuthenticated || !user) return false;
    
    // Check if category is in use
    const categoryInUse = articles.some(article => article.category === id);
    if (categoryInUse) {
      console.error('Cannot delete category that is in use by articles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category from Supabase:', error);
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
