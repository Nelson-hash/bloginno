// src/lib/cloudinary.ts
import axios from 'axios';

// Vos informations Cloudinary
const CLOUD_NAME = 'ddjjnwkcj';
// Votre preset non-signé (créez-le dans le dashboard Cloudinary)
const UPLOAD_PRESET = 'bloginno_uploads';

/**
 * Télécharge un fichier vers Cloudinary
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Création d'un FormData pour l'upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Requête d'upload vers Cloudinary
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      formData
    );
    
    // On retourne l'URL sécurisée
    return response.data.secure_url;
  } catch (error) {
    console.error('Erreur lors de l\'upload vers Cloudinary:', error);
    throw new Error('Échec du téléchargement de fichier');
  }
};

// Cache pour éviter de recalculer les mêmes URLs optimisées
const imageUrlCache: Record<string, string> = {};

/**
 * Construit une URL d'image optimisée avec mise en cache
 */
export const buildImageUrl = (url: string, width = 800): string => {
  // Si ce n'est pas une URL Cloudinary ou si elle est vide, on la retourne telle quelle
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Créer une clé de cache
  const cacheKey = `${url}_${width}`;
  
  // Vérifier si cette URL est déjà en cache
  if (imageUrlCache[cacheKey]) {
    return imageUrlCache[cacheKey];
  }
  
  // Sinon on applique des transformations d'optimisation
  const optimizedUrl = url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  
  // Mettre en cache pour les futures utilisations
  imageUrlCache[cacheKey] = optimizedUrl;
  
  return optimizedUrl;
};

/**
 * Construit une URL vidéo optimisée
 */
export const buildVideoUrl = (url: string): string => {
  // Si ce n'est pas une URL Cloudinary ou si elle est vide, on la retourne telle quelle
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Sinon on applique des transformations d'optimisation
  return url.replace('/upload/', '/upload/q_auto/');
};

/**
 * Extrait l'ID public à partir d'une URL Cloudinary
 */
export const extractPublicIdFromUrl = (url: string): string => {
  // Format d'URL Cloudinary: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.jpg
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Le public ID commence après "upload" et inclut le chemin complet sans l'extension
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
      return '';
    }
    
    // Récupérer toutes les parties du chemin après "upload", sauf la dernière partie (le nom de fichier avec extension)
    const pathAfterUpload = pathParts.slice(uploadIndex + 1);
    
    // Obtenir le nom de fichier et enlever l'extension
    const filename = pathAfterUpload[pathAfterUpload.length - 1];
    const filenameParts = filename.split('.');
    
    // Si le nom du fichier contient plusieurs points, on supprime juste la dernière partie
    filenameParts.pop();
    
    // Reconstruire le nom de fichier sans extension
    pathAfterUpload[pathAfterUpload.length - 1] = filenameParts.join('.');
    
    // Joindre tous les segments pour former l'ID public complet
    return pathAfterUpload.join('/');
  } catch (error) {
    console.error('Erreur lors de l\'extraction de l\'ID public:', error);
    return '';
  }
};

/**
 * Supprime un média de Cloudinary
 * Note: Cette fonction nécessite généralement un backend sécurisé
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // NOTE: Cette opération requiert une signature côté serveur pour des raisons de sécurité
    // Pour une implémentation complète, vous auriez besoin d'une fonction serverless ou d'un backend
    // Ceci est un placeholder qui simule la suppression
    
    console.log(`Média à supprimer de Cloudinary: ${publicId}`);
    console.log('ATTENTION: Cette opération nécessite un backend avec API_SECRET pour fonctionner réellement');
    
    // Pour une implémentation réelle avec un backend:
    /*
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload`,
      {
        public_ids: [publicId],
        type: 'upload'
      },
      {
        headers: {
          Authorization: `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
        }
      }
    );
    return response.status === 200;
    */
    
    return true; // Simuler une suppression réussie
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    return false;
  }
};
