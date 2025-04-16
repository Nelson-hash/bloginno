import React, { useState, useEffect } from 'react';
import { useArticles } from '../../context/ArticleContext';
import { Category } from '../../types';
import * as LucideIcons from 'lucide-react';
import { CheckCircle } from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onSaved?: () => void;
}

const commonIcons = [
  'Lightbulb', 'Rocket', 'ExternalLink', 'Bookmark', 'Book', 
  'FileText', 'Image', 'Video', 'Music', 'Code', 'Terminal',
  'Globe', 'Map', 'Compass', 'Award', 'Star', 'Heart',
  'Users', 'UserPlus', 'Briefcase', 'Building', 'Home',
  'ShoppingBag', 'Gift', 'Calendar', 'Clock', 'Bell',
  'MessageCircle', 'Mail', 'Phone', 'Smartphone', 'Laptop',
  'Monitor', 'Camera', 'Aperture', 'Palette', 'PenTool'
];

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSaved }) => {
  const { addCategory, updateCategory } = useArticles();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
    } else {
      setIcon('Tag');
    }
  }, [category]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!icon) newErrors.icon = 'Icon is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const categoryData = {
        name,
        icon
      };
      
      if (category) {
        await updateCategory({ ...categoryData, id: category.id });
      } else {
        await addCategory(categoryData);
      }
      
      setShowSuccess(true);
      
      // Reset form or redirect after showing success message
      setTimeout(() => {
        if (!category) {
          setName('');
          setIcon('Tag');
          setShowSuccess(false);
        }
        if (onSaved) {
          onSaved();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIcons = searchTerm 
    ? commonIcons.filter(iconName => 
        iconName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : commonIcons;

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 relative">
      {showSuccess && (
        <div className="absolute top-0 left-0 right-0 bg-green-100 p-4 rounded-t-lg flex items-center justify-center text-green-700">
          <CheckCircle className="w-5 h-5 mr-2" />
          Category saved successfully!
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Category Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className={`grid grid-cols-6 gap-2 p-4 border rounded-md ${
          errors.icon ? 'border-red-500' : 'border-gray-300'
        }`}>
          {filteredIcons.map((iconName) => {
            const IconComponent = (LucideIcons as any)[iconName];
            return IconComponent ? (
              <div
                key={iconName}
                onClick={() => setIcon(iconName)}
                className={`p-3 rounded-md cursor-pointer flex flex-col items-center justify-center ${
                  icon === iconName 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-6 w-6 mb-1" />
                <span className="text-xs text-gray-600 truncate w-full text-center">{iconName}</span>
              </div>
            ) : null;
          })}
        </div>
        {errors.icon && <p className="mt-1 text-sm text-red-600">{errors.icon}</p>}
      </div>
      
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
          {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;