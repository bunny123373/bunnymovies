import React, { useState, useEffect } from 'react'
import CategoryBar from '../components/CategoryBar'
import MovieSection from '../components/MovieSection'
import FilterPanel from '../components/FilterPanel'
import MetaTags from '../components/MetaTags'
import MovieCard from '../components/MovieCard'
import SeriesCard from '../components/SeriesCard'
import { useMovies, useSeries } from '../hooks/useMovies'
import { useNewMovieNotifications } from '../hooks/useNewMovieNotifications'

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filters, setFilters] = useState({
    language: '',
    category: '',
    genre: '',
    year: '',
    quality: ''
  })
  const [categories, setCategories] = useState([])
  const [categoryMovies, setCategoryMovies] = useState({})

  // Fetch languages data
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data.languages || [])
      } catch (error) {
        console.error('Error fetching languages:', error)
      }
    }
    fetchLanguages()
  }, [])

  // Fetch movies for each language category
  useEffect(() => {
    const fetchLanguageMovies = async () => {
      if (categories.length === 0) return
      
      const moviesData = {}
      for (const language of categories) {
        const { movies } = await fetchMoviesByLanguage(language)
        moviesData[language] = movies
      }
      setCategoryMovies(moviesData)
    }

    fetchLanguageMovies()
  }, [categories])

  // Helper function to fetch movies by language
  const fetchMoviesByLanguage = async (language) => {
    try {
      const params = new URLSearchParams({
        language,
        limit: '8'
      })
      
      const response = await fetch(`/api/movies?${params}`)
      const data = await response.json()
      return { movies: data.movies || [] }
    } catch (error) {
      console.error(`Error fetching ${language} movies:`, error)
      return { movies: [] }
    }
  }

  // Fetch latest movies for notifications
  const { 
    movies: latestMovies, 
    loading: latestLoading, 
    error: latestError 
  } = useMovies({ limit: 12 })

  // Show notifications for new movies
  useNewMovieNotifications(latestMovies)

  // Fetch trending movies for hero section
  const { 
    movies: trendingMovies, 
    loading: trendingLoading, 
    error: trendingError 
  } = useMovies({ isTrending: 'true', limit: 6 })

  // Fetch recent series
  const { 
    series: recentSeries, 
    loading: seriesLoading, 
    error: seriesError 
  } = useSeries({ limit: 8 })
  
  console.log('Home component - recentSeries:', recentSeries)
  console.log('Home component - seriesLoading:', seriesLoading)
  console.log('Home component - seriesError:', seriesError)

  // Fetch category-filtered movies when a category is selected
  const { 
    movies: filteredMovies, 
    loading: categoryLoading, 
    error: categoryError 
  } = useMovies({ 
    language: selectedCategory,
    ...filters,
    limit: 24 
  })

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setFilters(prev => ({ ...prev, language: category }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags 
        title="MovieHub - Download Movies"
        description="Download your favorite movies in high quality. Telugu, Tamil, Hindi, English movies available with fast, free downloads."
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 py-16 lg:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Download Your Favorite Movies
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            High-quality movies in Telugu, Tamil, Hindi, English and more. 
            Fast, free downloads with multiple quality options.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold">HD Quality</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold">Fast Downloads</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold">100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Bar */}
      <CategoryBar 
        selectedCategory={selectedCategory} 
        onSelect={handleCategorySelect} 
      />

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-36">
                <FilterPanel 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <FilterPanel 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* When a specific language category is selected */}
              {selectedCategory ? (
                <MovieSection
                  type={selectedCategory.toLowerCase()}
                  title={`${selectedCategory} Movies`}
                  movies={filteredMovies}
                  loading={categoryLoading}
                  error={categoryError}
                  showViewAll={false}
                />
              ) : (
                <>
                  {/* Trending Section */}
                  <MovieSection
                    type="trending"
                    movies={trendingMovies}
                    loading={trendingLoading}
                    error={trendingError}
                    showViewAll={false}
                  />

                  {/* Recent Series Section */}
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recent Series</h2>
                        <p className="text-gray-600 mt-1">Latest web and TV series added</p>
                      </div>
                      <a
                        href="/series"
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                      >
                        <span>View All</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {seriesLoading && recentSeries.length === 0 ? (
                        [...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        ))
                      ) : seriesError ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-red-600">Failed to load series</p>
                        </div>
                      ) : recentSeries.length === 0 && !seriesLoading ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500">No series available</p>
                        </div>
                      ) : (
                        recentSeries.map((seriesItem) => (
                          <SeriesCard 
                            key={seriesItem._id} 
                            series={seriesItem}
                            showQuality={false}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Language-wise Sections */}
                  {categories.map((language) => (
                    <MovieSection
                      key={language}
                      type={language.toLowerCase()}
                      title={`${language} Movies`}
                      movies={categoryMovies[language] || []}
                      loading={!categoryMovies[language]}
                      error={null}
                      showViewAll={true}
                      viewAllLink={`/movies?language=${encodeURIComponent(language)}`}
                    />
                  ))}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
