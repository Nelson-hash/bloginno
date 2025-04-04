import React, { useState } from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import { useArticles } from '../../context/ArticleContext';
import CategoryForm from './CategoryForm';
import * as LucideIcons from 'lucide-react';

const CategoryList: React.FC = () => {
  const { categories, deleteCategory } = useArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  if (editingCategory !== null) {
    const category = categories.find(c => c.id === editingCategory);
    if (category) {
      return (
        <div>
          <button 
            onClick={() => setEditingCategory(null)}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 flex items-center"
          >
            ← Back to Categories
          </button>
          <CategoryForm category={category} onSaved={() => setEditingCategory(null)} />
        </div>
      );
    }
  }

  // Dynamically render the icon from Lucide
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  return (
    <div>
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No categories found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-blue-600">
                      {renderIcon(category.icon)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setEditingCategory(category.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
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

export default CategoryList;