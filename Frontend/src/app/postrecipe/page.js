'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { UserAuth } from "../context/AuthContext";
import { useRouter } from 'next/navigation'; 

import {
  Bold,
  Italic,
  Underline,
  Heading1,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Quote,
  Code,
  Sun,
  Moon,
} from 'lucide-react';
import { useDarkMode } from '../DarkModeContext'; // Import the dark mode hook

// Dynamically import Draft.js
const DraftJs = dynamic(() => import('draft-js'), { ssr: false });

const PostRecipePage = () => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [coverImage, setImageUrl] = useState('');
  const [youtube, setYoutube] = useState('');
  const [category, setCategory] = useState('');
  const [editorState, setEditorState] = useState(null);
  const [DraftModules, setDraftModules] = useState(null);
  const [loading, setLoading] = useState(false);

  // user auth 
  const {user}= UserAuth();
  const router = useRouter();
  

  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const loadDraftJs = async () => {
      const draftJs = await import('draft-js');
      setDraftModules(draftJs);
      setEditorState(draftJs.EditorState.createEmpty());
      setMounted(true);
    };

    loadDraftJs();
  }, []);

  const handleKeyCommand = (command) => {
    if (!DraftModules || !editorState) return 'not-handled';
    const newState = DraftModules.RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    if (DraftModules && editorState) {
      setEditorState(DraftModules.RichUtils.toggleInlineStyle(editorState, style));
    }
  };

  const toggleBlockType = (blockType) => {
    if (DraftModules && editorState) {
      setEditorState(DraftModules.RichUtils.toggleBlockType(editorState, blockType));
    }
  };

  const handlePost = async () => {
    if (!mounted || !editorState) return;

    const { convertToRaw } = DraftModules;
    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));

    // Validate input fields
    if (!title.trim() || contentState.getPlainText().trim() === '' || !coverImage.trim() || !category.trim()) {
      alert('All fields are required!');
      return;
    }

    setLoading(true);
    try {
      const userDetails = {
        username: user.displayName || 'Anonymous', // Replace with dynamic username
        email: user.email ||'Not Available', // Replace with dynamic email
      };

      // Post the recipe data
      const response = await axios.post('http://localhost:5000/api/recipes', {
        title,
        content,
        coverImage,
        youtube,
        category,
        ...userDetails,
      });

      alert('Recipe posted successfully!');
      setTitle('');
      setImageUrl('');
      setCategory('');
      setEditorState(DraftModules.EditorState.createEmpty());
      router.push('/recipes');
    } catch (error) {
      console.error('Error posting recipe:', error);
      alert('Failed to post recipe.');
    } finally {
      setLoading(false);
    }
  };

  const ToolbarButton = ({ onClick, children, active }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition duration-200 ease-in-out ${
        active
          ? 'bg-blue-500 text-white shadow'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-gray-200'
      }`}
    >
      {children}
    </button>
  );

  if (!mounted) return null;

  return (
    <div
      className={`container mt-10 mx-auto max-w-5xl p-8 shadow-lg rounded-lg ${
        darkMode ? 'dark bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">Create Your Recipe</h1>
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-semibold border-b-2 border-gray-300 dark:border-gray-600 px-4 py-2 focus:border-blue-500 transition placeholder-gray-400 bg-transparent"
          placeholder="Recipe Title"
          required
        />
      </div>

      {/* Image URL Input */}
      <div className="mb-4">
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full text-lg border-b-2 border-gray-300 dark:border-gray-600 px-4 py-2 focus:border-blue-500 transition placeholder-gray-400 bg-transparent"
          placeholder="Image URL"
          required
        />
      </div>

      {/* Youtube URL Input */}
      <div className="mb-4">
        <input
          type="url"
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          className="w-full text-lg border-b-2 border-gray-300 dark:border-gray-600 px-4 py-2 focus:border-blue-500 transition placeholder-gray-400 bg-transparent"
          placeholder="Provide Youtube Link (Optional)"
        />
      </div>

      {/* Category Input */}
     {/* Category Dropdown */}
     <div className="mb-6">
            <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none w-full text-lg px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white dark:bg-gray-800 cursor-pointer"
            required
          >
            <option value="" disabled>Select a Category</option>
            <option value="Appetizer">🥗 Appetizer</option>
            <option value="Main Course">🍽️ Main Course</option>
            <option value="Dessert">🍰 Dessert</option>
            <option value="Breakfast">🍳 Breakfast</option>
            <option value="Lunch">🥪 Lunch</option>
            <option value="Dinner">🍖 Dinner</option>
            <option value="Snack">🍿 Snack</option>
            <option value="Beverage">🥤 Beverage</option>
            <option value="Salad">🥬 Salad</option>
            <option value="Soup">🥣 Soup</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
            </div>
          </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-x-2 mb-4">
        <ToolbarButton onClick={() => toggleInlineStyle('BOLD')}>
          <Bold size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleInlineStyle('ITALIC')}>
          <Italic size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleInlineStyle('UNDERLINE')}>
          <Underline size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleInlineStyle('STRIKETHROUGH')}>
          <Strikethrough size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('header-one')}>
          <Heading1 size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('unordered-list-item')}>
          <List size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('blockquote')}>
          <Quote size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('code-block')}>
          <Code size={20} />
        </ToolbarButton>
        <ToolbarButton>
          <AlignLeft size={20} />
        </ToolbarButton>
        <ToolbarButton>
          <AlignCenter size={20} />
        </ToolbarButton>
        <ToolbarButton>
          <AlignRight size={20} />
        </ToolbarButton>
      </div>

      {/* Text Editor */}
      <div
        className="min-h-[300px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-inner p-4 text-gray-700 dark:text-gray-200"
      >
        {DraftModules && (
          <DraftModules.Editor
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            placeholder="Start writing your recipe..."
            className="prose prose-lg focus:outline-none max-w-none dark:prose-invert"
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handlePost}
          disabled={loading}
          className={`px-8 py-3 font-semibold rounded-lg shadow-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Posting...' : 'Post Recipe'}
        </button>
      </div>
    </div>
  );
};

export default PostRecipePage;
