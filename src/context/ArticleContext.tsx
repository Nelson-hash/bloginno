import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { db, storage } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ArticleContextType {
  articles: Article[];
  categories: Category[];
  addArticle: (article: Omit<Article, 'id' | 'user_id'>, imageFile?: File) => Promise<void>;
  updateArticle: (article: Article, imageFile?: File) => Promise<void>;
  deleteArticle: (id: number | string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  // Charger les données initiales
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      const articlesQuery = query(collection(db, 'articles'), orderBy('date', 'desc'));
      const snapshot = await getDocs(articlesQuery);
      
      const fetchedArticles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          date: data.date,
          readTime: data.readTime,
          summary: data.summary,
          content: data.content,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          category: data.category,
          user_id: data.user_id
        } as Article;
      });
      
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
      const snapshot = await getDocs(categoriesQuery);
      
      const fetchedCategories = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          icon: data.icon,
          user_id: data.user_id
        } as Category;
      });
      
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Créer une référence unique pour l'image
    const imageRef = ref(storage, `images/${Date.now()}-${file.name}`);
    
    // Uploader l'image
    await uploadBytes(imageRef, file);
    
    // Récupérer l'URL de téléchargement
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const addArticle = async (article: Omit<Article, 'id' | 'user_id'>, imageFile?: File) => {
    try {
      let imageUrl = article.imageUrl;
      
      // Si un fichier image est fourni, le télécharger
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      // Préparer les données de l'article
      const articleData = {
        ...article,
        imageUrl,
        user_id: user?.uid || 'admin-user',
        created_at: Timestamp.now()
      };
      
      // Ajouter l'article à Firestore
      const docRef = await addDoc(collection(db, 'articles'), articleData);
      
      // Mettre à jour l'état local
      const newArticle = {
        ...articleData,
        id: docRef.id
      } as Article;
      
      setArticles(prev => [newArticle, ...prev]);
    } catch (error) {
      console.error('Error adding article:', error);
      throw error;
    }
  };

  const updateArticle = async (article: Article, imageFile?: File) => {
    try {
      let imageUrl = article.imageUrl;
      
      // Si un fichier image est fourni, le télécharger
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      // Préparer les données mises à jour
      const updatedData = {
        ...article,
        imageUrl,
        updated_at: Timestamp.now()
      };
      
      // Mettre à jour l'article dans Firestore
      await updateDoc(doc(db, 'articles', String(article.id)), updatedData);
      
      // Mettre à jour l'état local
      setArticles(prev => 
        prev.map(a => a.id === article.id ? { ...updatedData, id: article.id } as Article : a)
      );
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  };

  const deleteArticle = async (id: number | string) => {
    try {
      // Supprimer l'article de Firestore
      await deleteDoc(doc(db, 'articles', String(id)));
      
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
      const existingCategoryQuery = query(
        collection(db, 'categories'), 
        where('id', '==', id)
      );
      const existingSnapshot = await getDocs(existingCategoryQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('A category with this name already exists');
      }
      
      // Préparer les données de la catégorie
      const categoryData = {
        ...category,
        id,
        user_id: user?.uid || 'admin-user',
        created_at: Timestamp.now()
      };
      
      // Ajouter la catégorie à Firestore
      await addDoc(collection(db, 'categories'), categoryData);
      
      // Mettre à jour l'état local
      const newCategory = {
        ...categoryData,
        id
      } as Category;
      
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      // Trouver le document de catégorie par son ID personnalisé
      const categoryQuery = query(
        collection(db, 'categories'), 
        where('id', '==', category.id)
      );
      const snapshot = await getDocs(categoryQuery);
      
      if (snapshot.empty) {
        throw new Error('Category not found');
      }
      
      // Obtenir l'ID du document Firestore
      const docId = snapshot.docs[0].id;
      
      // Préparer les données mises à jour
      const updatedData = {
        ...category,
        updated_at: Timestamp.now()
      };
      
      // Mettre à jour la catégorie dans Firestore
      await updateDoc(doc(db, 'categories', docId), updatedData);
      
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
      
      // Trouver le document de catégorie par son ID personnalisé
      const categoryQuery = query(
        collection(db, 'categories'), 
        where('id', '==', id)
      );
      const snapshot = await getDocs(categoryQuery);
      
      if (snapshot.empty) {
        throw new Error('Category not found');
      }
      
      // Obtenir l'ID du document Firestore
      const docId = snapshot.docs[0].id;
      
      // Supprimer la catégorie de Firestore
      await deleteDoc(doc(db, 'categories', docId));
      
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
