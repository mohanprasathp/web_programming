import React, { useState, useCallback } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import axiosInstance from '../services/api'

const AdvancedSearch = ({ onSearch, resourceType = 'inspections' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
    role: '',
    sortBy: 'recent',
  })
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && !Object.values(filters).some((v) => v)) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const params = {
        q: searchQuery,
        ...filters,
        type: resourceType,
      }

      const response = await axiosInstance.get('/api/search', { params })
      setResults(response.data.results || [])
      if (onSearch) {
        onSearch(response.data.results)
      }
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, filters, resourceType, onSearch])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      dateFrom: '',
      dateTo: '',
      role: '',
      sortBy: 'recent',
    })
    setSearchQuery('')
    setResults([])
  }

  const activeFilterCount = Object.values(filters).filter((v) => v).length + (searchQuery ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Search ${resourceType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 pl-10 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-surface-400"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-3 border border-surface-200 rounded-lg hover:bg-surface-50 flex items-center gap-2 relative"
          >
            <Filter size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="bg-white border border-surface-200 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-surface-950">Advanced Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-surface-100 rounded"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-surface-950 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-surface-950 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-surface-950 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-950 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-surface-950 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 pt-4 border-t border-surface-200">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-surface-200 rounded-lg hover:bg-surface-50 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <p className="text-sm text-surface-600 mb-3">
            Found <strong>{results.length}</strong> result(s)
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result._id}
                className="p-3 border border-surface-100 rounded-lg hover:bg-surface-50 cursor-pointer transition"
                onClick={() => {
                  if (onSearch) onSearch([result])
                }}
              >
                <p className="font-medium text-surface-950">{result.title || result.name}</p>
                <p className="text-sm text-surface-600">
                  {result.description || result.type || ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
