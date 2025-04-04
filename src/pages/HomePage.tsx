import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, ExternalLink, Lightbulb, Rocket, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useArticles } from '../context/ArticleContext';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { articles, categories } = useArticles();
  const { isAuthenticated } = useAuth();
  
  // Filter functions for categories
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const filteredArticles = activeFilter === 'all' 
    ? articles 
    : articles.filter(article => article.category === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center">
                <Sparkles className="mr-3" />
                Service Innovation
              </h1>
              <p className="text-xl opacity-90 max-w-2xl">
                Exploring the future of services through innovation, design, and technology
              </p>
            </div>
            {isAuthenticated && (
              <Link 
                to="/admin" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2 rounded-full text-sm font-medium transition-all"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        {/* Category filters */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'all' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Updates
            </button>
            
            {categories.map(category => {
              const IconComponent = (LucideIcons as any)[category.icon];
              
              return (
                <button 
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                    activeFilter === category.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => {
            const categoryName = categories.find(c => c.id === article.category)?.name || 
              article.category.charAt(0).toUpperCase() + article.category.slice(1);
            
            return (
              <article 
                key={article.id} 
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-56 overflow-hidden">
                  {article.videoUrl && article.videoUrl !== 'video-uploaded' ? (
                    <video 
                      src={article.videoUrl} 
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.category === 'innovation' 
                        ? 'bg-blue-100 text-blue-800' 
                        : article.category === 'project'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {categoryName}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm ml-auto">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-gray-800">{article.title}</h2>
                  <p className="text-gray-600 mb-4">{article.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{article.readTime}</span>
                    </div>
                    <Link 
                      to={`/article/${article.id}`}
                      className="text-blue-600 hover:text-purple-600 font-medium flex items-center transition-colors"
                    >
                      Read more <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Newsletter subscription */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="opacity-90">Get the latest innovation insights delivered to your inbox</p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-3 rounded-l-lg w-full md:w-64 text-gray-800 focus:outline-none"
                />
                <button className="bg-purple-800 hover:bg-purple-900 px-6 py-3 rounded-r-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="mr-2" />
                Service Innovation
              </h2>
              <p className="text-gray-400 mt-2">Exploring the future of services</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Projects</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              {!isAuthenticated && (
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Admin</Link>
              )}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left text-gray-500">
            <p>© 2025 Service Innovation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;