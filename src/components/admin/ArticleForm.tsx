import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../../context/ArticleContext';
import { Article } from '../../types';
import FileUpload from '../FileUpload';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

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
    if (!article && !imageFile && !videoFile) {
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
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = imageUrl;
      let finalVideoUrl = videoUrl;
      
      if (imageFile) {
        finalImageUrl = imageUrl;
      }
      
      if (videoFile) {
        finalVideoUrl = 'https://example.com/videos/sample-video.mp4';
      }
      
      const articleData = {
        title,
        summary,
        content,
        category: category as 'innovation' | 'project' | 'update',
        date,
        readTime,
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl !== '' ? finalVideoUrl : undefined
      };
      
      if (article) {
        await updateArticle({ ...articleData, id: article.id });
      } else {
        await addArticle(articleData);
      }
      
      setShowSuccess(true);
      
      // Redirect to home page after a brief delay to show success message
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 relative">
      {showSuccess && (
        <div className="absolute top-0 left-0 right-0 bg-green-100 p-4 rounded-t-lg flex items-center justify-center text-green-700">
          <CheckCircle className="w-5 h-5 mr-2" />
          Article saved successfully! Redirecting...
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
          accept="image/*"
          maxSize={25}
          label="Featured Image"
          currentUrl={imageUrl}
        />
      </div>
      
      <div className="mb-6">
        <FileUpload
          onFileSelect={handleVideoSelect}
          accept="video/*"
          maxSize={25}
          label="Video (optional)"
          currentUrl={videoUrl}
        />
      </div>
      
      {errors.media && <p className="mt-1 text-sm text-red-600 mb-4">{errors.media}</p>}
      
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