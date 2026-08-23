import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import apiService from '../services/api';
import type { JournalEntry } from '../types';
import toast from 'react-hot-toast';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await apiService.getJournalEntries();
      setEntries(res.data || []);
    } catch {
      toast.error('Failed to load journal entries');
    }
  };

  const handleOpenModal = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setTitle(entry.title || '');
      setContent(entry.content);
    } else {
      setEditingEntry(null);
      setTitle('');
      setContent('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      if (editingEntry && editingEntry.id) {
        await apiService.updateJournalEntry(editingEntry.id, { title: title || 'Untitled Entry', content });
        toast.success('Entry updated');
      } else {
        await apiService.createJournalEntry({
          title: title || 'Untitled Entry',
          content,
        });
        toast.success('Entry saved');
      }
      handleCloseModal();
      fetchEntries(); // Refresh
    } catch {
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await apiService.deleteJournalEntry(id);
        toast.success('Entry deleted');
        fetchEntries();
      } catch {
        toast.error('Failed to delete entry');
      }
    }
  };

  const filteredEntries = entries.filter(e => 
    (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-shield-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-shield-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Private Journal</h1>
              <p className="text-white/60 mt-1">A safe space for your thoughts.</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-shield-500 hover:bg-shield-400 text-white rounded-xl transition-colors shadow-lg shadow-shield-500/25 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Entry</span>
          </button>
        </header>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-shield-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No entries found</h3>
              <p className="text-white/40">Start writing to track your thoughts and feelings.</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{entry.title || 'Untitled Entry'}</h3>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(entry)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/40 mb-4">
                  {new Date(entry.created_at || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-white/80 line-clamp-3">
                  {entry.content}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#12182b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <h2 className="text-xl font-semibold">{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</h2>
                <button onClick={handleCloseModal} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <input 
                  type="text" 
                  placeholder="Title (optional)" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-xl font-medium text-white placeholder-white/30 border-none focus:outline-none focus:ring-0 px-0"
                />
                <textarea 
                  placeholder="Write what's on your mind..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-64 bg-transparent text-white/80 placeholder-white/30 border-none focus:outline-none focus:ring-0 resize-none px-0 leading-relaxed"
                />
              </div>
              <div className="p-6 border-t border-white/5 flex justify-end space-x-3">
                <button 
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-shield-500 hover:bg-shield-400 text-white transition-colors shadow-lg shadow-shield-500/25 font-medium"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalPage;
