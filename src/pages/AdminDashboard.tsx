import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Tag, 
  LogOut, 
  Plus, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ArticleList from '../components/admin/ArticleList';
import ArticleForm from '../components/admin/ArticleForm';
import CategoryList from '../components/admin/CategoryList';
import CategoryForm from '../components/admin/CategoryForm';

type Tab = 'articles' | 'categories' | 'new-article' | 'new-category';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('articles');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold flex items-center text-gray-800">
            <Sparkles className="mr-2 text-blue-600" />
            Admin Panel
          </h1>
        </div>
        
        <nav className="p-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'articles' 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="mr-3 h-5 w-5" />
              Articles
            </button>
            
            <button
              onClick={() => setActiveTab('new-article')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'new-article' 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="mr-3 h-5 w-5" />
              New Article
            </button>
            
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'categories' 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Tag className="mr-3 h-5 w-5" />
              Categories
            </button>
            
            <button
              onClick={() => setActiveTab('new-category')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                activeTab === 'new-category' 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="mr-3 h-5 w-5" />
              New Category
            </button>
          </div>
          
          <div className="pt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              {activeTab === 'articles' && <FileText className="mr-2" />}
              {activeTab === 'new-article' && <Plus className="mr-2" />}
              {activeTab === 'categories' && <Tag className="mr-2" />}
              {activeTab === 'new-category' && <Plus className="mr-2" />}
              
              {activeTab === 'articles' && 'Manage Articles'}
              {activeTab === 'new-article' && 'Create New Article'}
              {activeTab === 'categories' && 'Manage Categories'}
              {activeTab === 'new-category' && 'Create New Category'}
            </h2>
          </div>
        </header>
        
        <main className="p-6">
          {activeTab === 'articles' && <ArticleList />}
          {activeTab === 'new-article' && <ArticleForm />}
          {activeTab === 'categories' && <CategoryList />}
          {activeTab === 'new-category' && <CategoryForm />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;