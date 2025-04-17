import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '../../context/ArticleContext';
import { Article } from '../../types';
import FileUpload from '../FileUpload';
import { Calendar, Clock, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { uploadFile } from '../../utils/fileUtils';

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
        } else {
          throw new Error('Failed to upload image');
        }
      }
      
      if (videoFile) {
        const uploadedVideoUrl = await uploadFile(videoFile, 'videos');
        if (uploadedVideoUrl) {
          finalVideoUrl = uploadedVideoUrl;
        } else {
          throw new Error('Failed to upload video');
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
            data-error={!!errors.title}
            placeholder="Enter a compelling title"
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
            data-error={!!errors.summary}
            placeholder="Write a brief summary of your article"
          />
          {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
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
              data-error={!!errors.category}
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
            <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Read Time
            </label>
            <select
              id="readTime"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.readTime ? 'border-red-500' : 'border-gray-300'
              }`}
              data-error={!!errors.readTime}
            >
              <option value="3 min read">3 min read</option>
              <option value="5 min read">5 min read</option>
              <option value="7 min read">7 min read</option>
              <option value="10 min read">10 min read</option>
              <option value="15 min read">15 min read</option>
            </select>
            {errors.readTime && <p className="mt-1 text-sm text-red-600">{errors.readTime}</p>}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            data-error={!!errors.content}
            placeholder="Write your article content here..."
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          <p className="mt-2 text-sm text-gray-500">
            Use line breaks to separate paragraphs. Basic text formatting is supported.
          </p>
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
        
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Preview
              </>
            )}
          </button>
          
          <div className="flex items-center">
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
        </div>
        
        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}
        
        {Object.keys(errors).length > 0 && errors.submit === undefined && (
          <div className="mt-4 p-4 bg-red-50 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </form>

      {/* Live Preview Panel */}
      {showPreview && (
        <div className="sticky top-6">
          <PreviewPanel />
        </div>
      )}
    </div>
  );
};

export default ArticleForm;
