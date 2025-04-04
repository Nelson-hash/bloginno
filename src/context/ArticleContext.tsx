import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { useAuth } from './AuthContext';
import { 
  extractPublicIdFromUrl, 
  deleteFromCloudinary 
} from '../lib/cloudinary';

// Clé pour stocker les données dans le localStorage
const STORAGE_KEY = 'bloginno_data';

interface ArticleContextType {
  articles: Article[];
  categories: Category[];
  addArticle: (article: Omit<Article, 'id' | 'user_id'>) => Promise<void>;
  updateArticle: (article: Article) => Promise<void>;
  deleteArticle: (id: number | string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

// Données initiales pour démarrer
const INITIAL_ARTICLES: Article[] = [
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

const INITIAL_CATEGORIES: Category[] = [
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

  // Charger les données depuis le localStorage ou utiliser les données par défaut
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { articles: savedArticles, categories: savedCategories } = JSON.parse(savedData);
        setArticles(savedArticles);
        setCategories(savedCategories);
      } catch (error) {
        console.error('Error parsing saved data:', error);
        // En cas d'erreur, utiliser les données par défaut
        setArticles(INITIAL_ARTICLES);
        setCategories(INITIAL_CATEGORIES);
      }
    } else {
      // Si pas de données sauvegardées, utiliser les données par défaut
      setArticles(INITIAL_ARTICLES);
      setCategories(INITIAL_CATEGORIES);
    }
  }, []);

  // Sauvegarder les données dans le localStorage chaque fois qu'elles changent
  useEffect(() => {
    if (articles.length > 0 || categories.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ articles, categories }));
    }
  }, [articles, categories]);

  const addArticle = async (article: Omit<Article, 'id' | 'user_id'>) => {
    try {
      // Créer un nouvel article avec un ID unique
      const newArticle: Article = {
        ...article,
        id: Date.now(), // Utiliser le timestamp comme ID
        user_id: user?.uid || 'admin-user',
        created_at: new Date().toISOString()
      };
      
      // Mettre à jour l'état local
      setArticles(prev => [newArticle, ...prev]);
    } catch (error) {
      console.error('Error adding article:', error);
      throw error;
    }
  };

  const updateArticle = async (article: Article) => {
    try {
      // Récupérer l'article actuel pour comparer les médias
      const currentArticle = articles.find(a => a.id === article.id);
      
      // Si l'image a changé et l'ancienne était sur Cloudinary, essayer de la supprimer
      if (currentArticle && 
          currentArticle.imageUrl !== article.imageUrl && 
          currentArticle.imageUrl && 
          currentArticle.imageUrl.includes('cloudinary.com')) {
        const publicId = extractPublicIdFromUrl(currentArticle.imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      
      // Si la vidéo a changé et l'ancienne était sur Cloudinary, essayer de la supprimer
      if (currentArticle && 
          currentArticle.videoUrl !== article.videoUrl && 
          currentArticle.videoUrl && 
          currentArticle.videoUrl.includes('cloudinary.com')) {
        const publicId = extractPublicIdFromUrl(currentArticle.videoUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      
      // Mettre à jour l'article
      const updatedArticle: Article = {
        ...article,
        updated_at: new Date().toISOString()
      };
      
      // Mettre à jour l'état local
      setArticles(prev => 
        prev.map(a => a.id === article.id ? updatedArticle : a)
      );
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  };

  const deleteArticle = async (id: number | string) => {
    try {
      // Récupérer l'article à supprimer
      const articleToDelete = articles.find(article => String(article.id) === String(id));
      
      if (articleToDelete) {
        // Supprimer l'image de Cloudinary si elle existe
        if (articleToDelete.imageUrl && articleToDelete.imageUrl.includes('cloudinary.com')) {
          const imagePublicId = extractPublicIdFromUrl(articleToDelete.imageUrl);
          if (imagePublicId) {
            await deleteFromCloudinary(imagePublicId);
          }
        }
        
        // Supprimer la vidéo de Cloudinary si elle existe
        if (articleToDelete.videoUrl && articleToDelete.videoUrl.includes('cloudinary.com')) {
          const videoPublicId = extractPublicIdFromUrl(articleToDelete.videoUrl);
          if (videoPublicId) {
            await deleteFromCloudinary(videoPublicId);
          }
        }
      }
      
      // Mettre à jour l'état local en supprimant l'article
      setArticles(prev => prev.filter(article => String(article.id) !== String(id)));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
    try {
      // Générer un ID simple basé sur le nom
      const id = category.name.toLowerCase().replace(/\s+/g, '-');
      
      // Vérifier si la catégorie existe déjà
      const categoryExists = categories.some(c => c.id === id);
      if (categoryExists) {
        throw new Error('A category with this name already exists');
      }
      
      // Créer une nouvelle catégorie
      const newCategory: Category = {
        ...category,
        id,
        user_id: user?.uid || 'admin-user',
        created_at: new Date().toISOString()
      };
      
      // Mettre à jour l'état local
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      // Mettre à jour l'état local
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
      // Vérifier si la catégorie est utilisée par des articles
      const inUse = articles.some(article => article.category === id);
      if (inUse) {
        throw new Error('Cannot delete category that is in use by articles');
      }
      
      // Mettre à jour l'état local
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
