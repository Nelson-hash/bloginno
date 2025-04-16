import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../../context/ArticleContext';
import { Article } from '../../types';
import FileUpload from '../FileUpload';
import { Calendar, Clock, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { uploadFile } from '../../lib/upload';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

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
    
    // For new articles, either image or video is required
    if (!article && !imageFile && !videoFile && !imageUrl) {
      newErrors.media = 'Either an image or video is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const tempUrl = URL.createObjectURL(file);
    setImageUrl(tempUrl);
  };

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    setVideoUrl('video-uploaded');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle file uploads if needed
      let finalImageUrl = imageUrl;
      let finalVideoUrl = videoUrl;
      
      if (imageFile) {
        const uploadedImageUrl = await uploadFile(imageFile, 'images');
        if (uploadedImageUrl) {
          finalImageUrl = uploadedImageUrl;
        }
      }
      
      if (videoFile) {
        const uploadedVideoUrl = await uploadFile(videoFile, 'videos');
        if (uploadedVideoUrl) {
          finalVideoUrl = uploadedVideoUrl;
        }
      }
      
      const articleData = {
        title,
        summary,
        content,
        category,
        date,
        readTime,
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl !== '' ? finalVideoUrl : undefined
      };
      
      let success = false;
      
      if (article) {
        success = await updateArticle({ ...articleData, id: article.id });
      } else {
        const newArticle = await addArticle(articleData);
        success = !!newArticle;
      }
      
      if (success) {
        setShowSuccess(true);
        
        setTimeout(() => {
          if (onSaved) {
            onSaved();
          } else {
            navigate('/admin');
          }
        }, 1500);
      } else {
        setErrors({ submit: 'Failed to save article. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const PreviewPanel = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Article Preview</h2>
      
      <div className="mb-6">
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-4" />
        )}
        
        <div className="flex items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            category === 'innovation' 
              ? 'bg-blue-100 text-blue-800' 
              : category === 'project'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-indigo-100 text-indigo-800'
          }`}>
            {categories.find(c => c.id === category)?.name || category}
          </span>
          <div className="flex items-center text-gray-500 text-sm ml-4">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm ml-4">
            <Clock className="w-3 h-3 mr-1" />
            <span>{readTime}</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title || 'Article Title'}</h1>
        <p className="text-xl text-gray-600 mb-6">{summary || 'Article summary will appear here'}</p>
        
        <div className="prose max-w-none">
          {content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700">
              {paragraph || 'Article content will appear here'}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Rest of the component remains the same */}
    </div>
  );
};

export default ArticleForm;
