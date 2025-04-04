import React, { useState } from 'react';
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import { useArticles } from '../../context/ArticleContext';
import ArticleForm from './ArticleForm';

const ArticleList: React.FC = () => {
  const { articles, deleteArticle } = useArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArticle, setEditingArticle] = useState<number | null>(null);

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteArticle(id);
    }
  };

  if (editingArticle !== null) {
    const article = articles.find(a => a.id === editingArticle);
    if (article) {
      return (
        <div>
          <button 
            onClick={() => setEditingArticle(null)}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 flex items-center"
          >
            ← Back to Articles
          </button>
          <ArticleForm article={article} onSaved={() => setEditingArticle(null)} />
        </div>
      );
    }
  }

  return (
    <div>
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No articles found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{article.summary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      article.category === 'innovation' 
                        ? 'bg-blue-100 text-blue-800' 
                        : article.category === 'project'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.imageUrl && <span className="text-green-600">Image</span>}
                    {article.videoUrl && <span className="ml-2 text-blue-600">Video</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setEditingArticle(article.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArticleList;