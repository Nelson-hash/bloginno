import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, AlertCircle, Image } from 'lucide-react';
import { useArticles } from '../context/ArticleContext';
import { buildImageUrl, buildVideoUrl } from '../lib/cloudinary';

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles, categories } = useArticles();
  const article = articles.find(a => a.id === Number(id));
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Image par défaut en cas d'erreur
  const fallbackImage = 'https://images.unsplash.com/photo-1553484771-689277e6c44c?q=80&w=1770&auto=format&fit=crop';

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Article not found</h1>
          <Link 
            to="/" 
            className="text-blue-600 hover:text-purple-600 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = categories.find(c => c.id === article.category)?.name || 
    article.category.charAt(0).toUpperCase() + article.category.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-purple-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Article Header */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg mb-8">
          <div className="h-96 overflow-hidden relative">
            {article.videoUrl && article.videoUrl !== 'video-uploaded' && !videoError ? (
              <video 
                src={buildVideoUrl(article.videoUrl)} 
                controls
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setVideoError(true)}
              />
            ) : (
              <img 
                src={imageError ? fallbackImage : buildImageUrl(article.imageUrl)} 
                alt={article.title} 
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            )}
            
            {/* Message d'erreur en cas de problème de média */}
            {(imageError || videoError) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                <span className="text-sm">Le média d'origine n'a pas pu être chargé</span>
              </div>
            )}
          </div>
          
          <div className="p-8">
            <div className="flex items-center mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                article.category === 'innovation' 
                  ? 'bg-blue-100 text-blue-800' 
                  : article.category === 'project'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-indigo-100 text-indigo-800'
              }`}>
                {categoryName}
              </span>
              <div className="flex items-center text-gray-500 text-sm ml-4">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm ml-4">
                <Clock className="w-3 h-3 mr-1" />
                <span>{article.readTime}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {article.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              {article.summary}
            </p>
            
            <div className="prose max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Share this article</h2>
          <div className="flex space-x-4">
            <button className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              Twitter
            </button>
            <button className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              LinkedIn
            </button>
            <button className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
