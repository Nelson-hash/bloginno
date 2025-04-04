import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { 
  extractPublicIdFromUrl, 
  deleteFromCloudinary 
} from '../lib/cloudinary';

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

// Données initiales pour démarrer (utilisées uniquement si Firestore ne fonctionne pas)
const INITIAL_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Introduction to Service Innovation',
    date: 'April 1, 2025',
    readTime: '5 min read',
    summary: 'Learn about the fundamentals of service innovation.',
    content: 'Service innovation refers to the development of new or significantly improved service offerings...',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    category: 'innovation',
    user_id: 'admin-user'
  },
  // Autres articles initiaux...
];

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'innovation',
    name: 'Innovation',
    icon: 'Lightbulb',
    user_id: 'admin-user'
  },
  // Autres catégories initiales...
];

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger les données depuis Firestore
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charger les articles
        const articlesQuery = query(collection(db, 'articles'), orderBy('date', 'desc'));
        const articlesSnapshot = await getDocs(articlesQuery);
        
        if (!articlesSnapshot.empty) {
          const articlesData = articlesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Article[];
          
          setArticles(articlesData);
        } else {
          console.log('No articles found, using initial data');
          setArticles(INITIAL_ARTICLES);
        }
        
        // Charger les catégories
        const categoriesQuery = query(collection(db, 'categories'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        if (!categoriesSnapshot.empty) {
          const categoriesData = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Category[];
          
          setCategories(categoriesData);
        } else {
          console.log('No categories found, using initial data');
          setCategories(INITIAL_CATEGORIES);
          
          // Si aucune catégorie n'existe, ajouter les catégories initiales
          INITIAL_CATEGORIES.forEach(async (category) => {
            await setDoc(doc(db, 'categories', category.id), category);
          });
        }
      } catch (error) {
        console.error('Error loading data from Firestore:', error);
        // Utiliser les données initiales en cas d'échec
        setArticles(INITIAL_ARTICLES);
        setCategories(INITIAL_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addArticle = async (article: Omit<Article, 'id' | 'user_id'>) => {
    try {
      const articleData = {
        ...article,
        user_id: user?.uid || 'admin-user',
        created_at: Timestamp.now()
      };
      
      // Ajouter l'article à Firestore
      const docRef = await addDoc(collection(db, 'articles'), articleData);
      
      // Mettre à jour l'état local
      setArticles(prev => [{
        ...articleData,
        id: docRef.id
      } as Article, ...prev]);
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
      
      // Mettre à jour l'article dans Firestore
      const articleRef = doc(db, 'articles', String(article.id));
      await updateDoc(articleRef, {
        ...article,
        updated_at: Timestamp.now()
      });
      
      // Mettre à jour l'état local
      setArticles(prev => 
        prev.map(a => a.id === article.id ? article : a)
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
        
        // Supprimer l'article de Firestore
        await deleteDoc(doc(db, 'articles', String(id)));
      }
      
      // Mettre à jour l'état local
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
      
      // Ajouter la catégorie à Firestore
      await setDoc(doc(db, 'categories', id), newCategory);
      
      // Mettre à jour l'état local
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      // Mettre à jour la catégorie dans Firestore
      await updateDoc(doc(db, 'categories', category.id), category);
      
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
      
      // Supprimer la catégorie de Firestore
      await deleteDoc(doc(db, 'categories', id));
      
      // Mettre à jour l'état local
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  if (isLoading) {
    // Vous pourriez retourner un composant de chargement ici
    return <div>Loading...</div>;
  }

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
