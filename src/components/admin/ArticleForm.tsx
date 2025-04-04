import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../../context/ArticleContext';
import { Article } from '../../types';
import FileUpload from '../FileUpload';
import { Calendar, Clock, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';
import axios from 'axios';

interface ArticleFormProps {
  article?: Article;
  onSaved?: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSaved }) => {
  const navigate = useNavigate();
  const { categories, addArticle, updateArticle } = useArticles();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [readTime, setReadTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadStep, setCurrentUploadStep] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSummary(article.summary);
      setContent(article.content);
      setCategory(article.category);
      setDate(article.date);
      setReadTime(article.readTime);
      setImageUrl(article.imageUrl);
      setVideoUrl(article.videoUrl || '');
    } else {
      // Set default values for new article
      const today = new Date();
      setDate(`${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`);
      setReadTime('5 min read');
      if (categories.length > 0) {
        setCategory(categories[0].id);
      }
    }
  }, [article, categories]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!summary.trim()) newErrors.summary = 'Summary is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (!category) newErrors.category = 'Category is required';
    if (!date.trim()) newErrors.date = 'Date is required';
    if (!readTime.trim()) newErrors.readTime = 'Read time is required';
    
    // Pour un nouvel article, soit une image URL soit un fichier image est requis
    if (!article && !imageUrl && !imageFile) {
      newErrors.media = 'Either an image URL or file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    // On créé une prévisualisation temporaire
    const tempUrl = URL.createObjectURL(file);
    setImageUrl(tempUrl);
  };

  const handleImageUrlEnter = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
  };

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    setVideoUrl('video-selected');
  };

  const handleVideoUrlEnter = (url: string) => {
    setVideoUrl(url);
    setVideoFile(null);
  };

  // Fonction pour gérer l'upload avec progression
  const uploadFileWithProgress = async (file: File, mediaType: 'image' | 'video'): Promise<string> => {
    try {
      setCurrentUploadStep(`Uploading ${mediaType}...`);
      
      // Création d'un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'bloginno_uploads');
      
      // Configuration pour suivre la progression
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/ddjjnwkcj/auto/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              // Ajuster la progression en fonction du type de média
              if (mediaType === 'image') {
                setUploadProgress(Math.min(progress / 2, 50)); // Image = première moitié de la progression
              } else {
                setUploadProgress(50 + Math.min(progress / 2, 50)); // Vidéo = seconde moitié
              }
            }
          }
        }
      );
      
      // On retourne l'URL sécurisée
      return response.data.secure_url;
    } catch (error) {
      console.error(`Erreur lors de l'upload du ${mediaType}:`, error);
      setUploadError(`Échec du téléchargement du ${mediaType}. Veuillez réessayer.`);
      throw new Error(`Échec du téléchargement du ${mediaType}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      let finalImageUrl = imageUrl;
      let finalVideoUrl = videoUrl;
      
      // Si un fichier image est fourni, l'uploader vers Cloudinary
      if (imageFile) {
        setCurrentUploadStep('Uploading image...');
        finalImageUrl = await uploadFileWithProgress(imageFile, 'image');
        
        if (!finalImageUrl) {
          throw new Error('Failed to upload image');
        }
      }
      
      // Si un fichier vidéo est fourni, l'uploader vers Cloudinary
      if (videoFile) {
        setCurrentUploadStep('Uploading video...');
        finalVideoUrl = await uploadFileWithProgress(videoFile, 'video');
        
        if (!finalVideoUrl) {
          throw new Error('Failed to upload video');
        }
      }
      
      setCurrentUploadStep('Saving article...');
      setUploadProgress(90);
      
      const articleData = {
        title,
        summary,
        content,
        category,
        date,
        readTime,
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl !== '' && finalVideoUrl !== 'video-selected' ? finalVideoUrl : undefined
      };
      
      if (article) {
        await updateArticle({ ...articleData, id: article.id, user_id: article.user_id || 'admin-user' });
      } else {
        await addArticle(articleData);
      }
      
      setUploadProgress(100);
      setCurrentUploadStep('Complete!');
      setShowSuccess(true);
      
      // Redirect or call onSaved after a brief delay
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else {
          navigate('/');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error saving article:', error);
      setErrors({...errors, submit: 'Error saving article. Please try again.'});
      setUploadError(`Une erreur s'est produite. Veuillez réessayer.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour afficher une description plus détaillée de la progression
  const getProgressDescription = () => {
    if (uploadProgress === 0) return 'Préparation...';
    if (uploadProgress === 100) return 'Terminé!';
    return currentUploadStep;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 relative">
      {showSuccess && (
        <div className="absolute top-0 left-0 right-0 bg-green-100 p-4 rounded-t-lg flex items-center justify-center text-green-700">
          <CheckCircle className="w-5 h-5 mr-2" />
          Article saved successfully! Redirecting...
        </div>
      )}
      
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="w-80 bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center mb-4">
              <Upload className={`h-8 w-8 mx-auto ${uploadProgress < 100 ? 'animate-bounce' : ''}`} />
              <h3 className="text-lg font-semibold mt-2">{getProgressDescription()}</h3>
              <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div className="mb-6">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
          Summary
        </label>
        <input
          type="text"
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.summary ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
      </div>
      
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1" /> Date
          </label>
          <input
            type="text"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>
        
        <div>
          <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" /> Read Time
          </label>
          <input
            type="text"
            id="readTime"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.readTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.readTime && <p className="mt-1 text-sm text-red-600">{errors.readTime}</p>}
        </div>
      </div>
      
      <div className="mb-6">
        <FileUpload
          onFileSelect={handleImageSelect}
          onUrlEnter={handleImageUrlEnter}
          accept="image/*"
          maxSize={25}
          label="Featured Image"
          currentUrl={imageUrl}
        />
      </div>
      
      <div className="mb-6">
        <FileUpload
          onFileSelect={handleVideoSelect}
          onUrlEnter={handleVideoUrlEnter}
          accept="video/*"
          maxSize={100}
          label="Video (optional)"
          currentUrl={videoUrl}
        />
      </div>
      
      {errors.media && <p className="mt-1 text-sm text-red-600 mb-4">{errors.media}</p>}
      {errors.submit && <p className="mt-1 text-sm text-red-600 mb-4">{errors.submit}</p>}
      
      <div className="flex justify-end">
        {onSaved && (
          <button
            type="button"
            onClick={onSaved}
            className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md text-white ${
            isSubmitting 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
