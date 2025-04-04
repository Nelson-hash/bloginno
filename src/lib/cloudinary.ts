// src/lib/cloudinary.ts
import axios from 'axios';

// Vos informations Cloudinary
const CLOUD_NAME = 'ddjjnwkcj';
// Votre preset non-signé (créez-le dans le dashboard Cloudinary comme expliqué plus bas)
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

/**
 * Construit une URL d'image optimisée
 */
export const buildImageUrl = (url: string, width = 800): string => {
  // Si ce n'est pas une URL Cloudinary, on la retourne telle quelle
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Sinon on applique des transformations d'optimisation
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
};

/**
 * Construit une URL vidéo optimisée
 */
export const buildVideoUrl = (url: string): string => {
  // Si ce n'est pas une URL Cloudinary, on la retourne telle quelle
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Sinon on applique des transformations d'optimisation
  return url.replace('/upload/', '/upload/q_auto/');
};
