'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  BookmarkIcon,
  CheckCircle,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const mockProblems = [
    {
      id: 1,
      title: 'Two Sum',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['Array', 'Hash Table'],
      solved: true,
      bookmarked: false,
      company: 'Amazon',
    },
    {
      id: 2,
      title: 'Add Two Numbers',
      platform: 'LeetCode',
      difficulty: 'Medium',
      topics: ['Linked List', 'Math'],
      solved: true,
      bookmarked: true,
      company: 'Google',
    },
    {
      id: 3,
      title: 'Longest Substring Without Repeating Characters',
      platform: 'LeetCode',
      difficulty: 'Medium',
      topics: ['Hash Table', 'String', 'Sliding Window'],
      solved: false,
      bookmarked: true,
      company: 'Microsoft',
    },
    {
      id: 4,
      title: 'Median of Two Sorted Arrays',
      platform: 'LeetCode',
      difficulty: 'Hard',
      topics: ['Array', 'Binary Search', 'Divide and Conquer'],
      solved: false,
      bookmarked: false,
      company: 'Google',
    },
    {
      id: 5,
      title: 'Beautiful Arrangement',
      platform: 'Codeforces',
      difficulty: 'Medium',
      topics: ['Backtracking', 'Permutation'],
      solved: true,
      bookmarked: false,
      company: 'Facebook',
    },
    {
      id: 6,
      title: 'Palindrome Partitioning',
      platform: 'CodeChef',
      difficulty: 'Hard',
      topics: ['Backtracking', 'Dynamic Programming'],
      solved: false,
      bookmarked: true,
      company: 'Amazon',
    },
    {
      id: 7,
      title: 'Valid Palindrome',
      platform: 'LeetCode',
      difficulty: 'Easy',
      topics: ['String', 'Two Pointers'],
      solved: true,
      bookmarked: false,
      company: 'Meta',
    },
    {
      id: 8,
      title: 'Integer to Roman',
      platform: 'LeetCode',
      difficulty: 'Medium',
      topics: ['String', 'Math'],
      solved: false,
      bookmarked: false,
      company: 'Microsoft',
    },
    {
      id: 9,
      title: 'Merge k Sorted Lists',
      platform: 'LeetCode',
      difficulty: 'Hard',
      topics: ['Linked List', 'Heap', 'Divide and Conquer'],
      solved: false,
      bookmarked: false,
      company: 'Google',
    },
    {
      id: 10,
      title: 'LRU Cache',
      platform: 'LeetCode',
      difficulty: 'Hard',
      topics: ['Design', 'Hash Table', 'Linked List'],
      solved: false,
      bookmarked: true,
      company: 'Amazon',
    },
  ];

  const filteredProblems = useMemo(() => {
    return mockProblems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty.length === 0 ||
        selectedDifficulty.includes(problem.difficulty);

      const matchesPlatforms =
        selectedPlatforms.length === 0 ||
        selectedPlatforms.includes(problem.platform);

      const matchesTopics =
        selectedTopics.length === 0 ||
        problem.topics.some((topic) => selectedTopics.includes(topic));

      return matchesSearch && matchesDifficulty && matchesPlatforms && matchesTopics;
    });
  }, [searchTerm, selectedDifficulty, selectedPlatforms, selectedTopics]);

  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProblems, currentPage]);

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const platforms = ['LeetCode', 'Codeforces', 'CodeChef'];
  const allTopics = Array.from(new Set(mockProblems.flatMap((p) => p.topics)));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">Problems</h1>
        <p className="text-slate-400">
          {filteredProblems.length} problems • {mockProblems.filter((p) => p.solved).length} solved
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <Input
            placeholder="Search problems or companies..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-slate-700/50 border-slate-600 text-white"
          />
        </div>

        {/* Filter Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Difficulty Filter */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-orange-500" />
              <h3 className="font-medium">Difficulty</h3>
            </div>
            <div className="space-y-2">
              {difficulties.map((difficulty) => (
                <label key={difficulty} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulty.includes(difficulty)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDifficulty([...selectedDifficulty, difficulty]);
                      } else {
                        setSelectedDifficulty(
                          selectedDifficulty.filter((d) => d !== difficulty)
                        );
                      }
                      setCurrentPage(1);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">{difficulty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-orange-500" />
              <h3 className="font-medium">Platform</h3>
            </div>
            <div className="space-y-2">
              {platforms.map((platform) => (
                <label key={platform} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, platform]);
                      } else {
                        setSelectedPlatforms(
                          selectedPlatforms.filter((p) => p !== platform)
                        );
                      }
                      setCurrentPage(1);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Topic Filter */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 max-h-56 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 sticky top-0">
              <Tag className="w-4 h-4 text-orange-500" />
              <h3 className="font-medium">Topics</h3>
            </div>
            <div className="space-y-2">
              {allTopics.map((topic) => (
                <label key={topic} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTopics([...selectedTopics, topic]);
                      } else {
                        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
                      }
                      setCurrentPage(1);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">{topic}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedDifficulty.length > 0 ||
          selectedPlatforms.length > 0 ||
          selectedTopics.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {selectedDifficulty.map((d) => (
              <div
                key={d}
                className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {d}
                <button
                  onClick={() =>
                    setSelectedDifficulty(selectedDifficulty.filter((x) => x !== d))
                  }
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedPlatforms.map((p) => (
              <div
                key={p}
                className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {p}
                <button
                  onClick={() =>
                    setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p))
                  }
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedTopics.map((t) => (
              <div
                key={t}
                className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {t}
                <button
                  onClick={() =>
                    setSelectedTopics(selectedTopics.filter((x) => x !== t))
                  }
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Problems List */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden"
      >
        {paginatedProblems.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {paginatedProblems.map((problem) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-slate-700/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {problem.solved && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      <h3 className="font-medium text-lg">{problem.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                        {problem.platform}
                      </span>
                      <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                        {problem.company}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {problem.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 bg-slate-700/30 rounded text-xs text-slate-400"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-700/50 rounded-lg">
                    <BookmarkIcon
                      className={`w-5 h-5 ${
                        problem.bookmarked
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-slate-500'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            No problems found. Try adjusting your filters.
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="text-sm text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProblems.length)} of{' '}
            {filteredProblems.length} problems
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 1 || p === 1 || p === totalPages)
              .map((page, i, arr) => (
                <div key={page}>
                  {i > 0 && arr[i - 1] !== page - 1 && <span className="px-2">...</span>}
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    {page}
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
