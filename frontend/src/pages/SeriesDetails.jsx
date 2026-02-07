import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Heart, 
  Download, 
  Calendar, 
  FileText,
  Check,
  Tv,
  Play,
  Clock,
  Eye
} from 'lucide-react'
import { useSeriesDetails, useRelatedMovies } from '../hooks/useMovies'
import { useWatchlist } from '../contexts/WatchlistContext'
import MovieCard from '../components/MovieCard'
import MovieSkeleton from '../components/MovieSkeleton'
import ShareButtons from '../components/ShareButtons'
import EmptyState from '../components/EmptyState'
import MetaTags from '../components/MetaTags'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SeriesDetails = () => {
  const { id } = useParams()
  const { series, loading, error } = useSeriesDetails(id)
  const { movies: relatedMovies, loading: relatedLoading } = useRelatedMovies(id)
  const { toggleWatchlist, isInWatchlist } = useWatchlist()
  const [posterLoaded, setPosterLoaded] = useState(false)
  const [episodes, setEpisodes] = useState([])
  const [episodesLoading, setEpisodesLoading] = useState(true)
  const [episodesError, setEpisodesError] = useState(null)
  const [downloadingEpisode, setDownloadingEpisode] = useState(null)
  const [renderError, setRenderError] = useState(null)

  // Add early debugging
  console.log('SeriesDetails - id:', id)
  console.log('SeriesDetails - series:', series)
  console.log('SeriesDetails - loading:', loading)
  console.log('SeriesDetails - error:', error)

  try {

  const inWatchlist = isInWatchlist(id)

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id) return
      
      try {
        setEpisodesLoading(true)
        const response = await axios.get(`${API_URL}/movies/${id}/episodes`)
        setEpisodes(response.data.episodes)
        setEpisodesError(null)
      } catch (err) {
        console.error('Failed to fetch episodes:', err)
        setEpisodesError(err.response?.data?.message || 'Failed to fetch episodes')
      } finally {
        setEpisodesLoading(false)
      }
    }

    fetchEpisodes()
  }, [id])

  const handleDownload = async (episodeNumber, link) => {
    setDownloadingEpisode(`${episodeNumber}-${link.quality}`)
    
    try {
      // Increment download count for the series
      await axios.post(`${API_URL}/movies/${id}/download`)
      
      // Trigger download
      const a = document.createElement('a')
      a.href = link.url
      a.download = `${series.title}_S${series.currentSeason || 1}E${episodeNumber}_${link.quality}.mp4`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to increment download count:', err)
    }
    
    setTimeout(() => setDownloadingEpisode(null), 2000)
  }

  const getQualityColor = (quality) => {
    switch (quality) {
      case '480p': return 'bg-yellow-500 hover:bg-yellow-600'
      case '720p': return 'bg-green-500 hover:bg-green-600'
      case '1080p': return 'bg-blue-500 hover:bg-blue-600'
      case '4K': return 'bg-purple-500 hover:bg-purple-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getLanguageColor = (language) => {
    switch (language) {
      case 'Telugu': return 'bg-orange-100 text-orange-700'
      case 'Tamil': return 'bg-red-100 text-red-700'
      case 'Hindi': return 'bg-green-100 text-green-700'
      case 'English': return 'bg-blue-100 text-blue-700'
      case 'Dubbed': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Web Series': return 'bg-indigo-100 text-indigo-700'
      case 'TV Series': return 'bg-cyan-100 text-cyan-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MovieSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    console.error('SeriesDetails - Error state:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">Error: {error}</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!series) {
    console.error('SeriesDetails - No series data')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">Series not found</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (series.category !== 'Web Series' && series.category !== 'TV Series') {
    console.error('SeriesDetails - Not a series:', series.category)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">This is not a series (Category: {series.category})</p>
          <Link to={`/movie/${id}`} className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            View as Movie
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags 
        title={`${series.title} - ${series.category} | MovieHub`}
        description={series.description}
        image={series.posterUrl}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleWatchlist(series)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  inWatchlist
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWatchlist ? 'fill-current' : ''}`} />
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Series Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-72 lg:h-80 bg-gradient-to-br from-primary-600 to-secondary-700">
                {!posterLoaded && (
                  <div className="absolute inset-0 skeleton-shimmer" />
                )}
                <img
                  src={series.posterUrl || 'https://via.placeholder.com/400x600'}
                  alt={series.title}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    posterLoaded ? 'opacity-30' : 'opacity-0'
                  }`}
                  onLoad={() => setPosterLoaded(true)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x600'
                    setPosterLoaded(true)
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                          {series.title || 'Untitled Series'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
                          <span className={`badge ${getCategoryColor(series.category)}`}>
                            <Tv className="w-3 h-3 mr-1" />
                            {series.category || 'Unknown'}
                          </span>
                          <span className={`badge ${getLanguageColor(series.language)}`}>
                            {series.language || 'Unknown'}
                          </span>
                          <span className="text-white/80">{series.year || 'Unknown'}</span>
                          {series.totalEpisodes && (
                            <span className="text-white/80">
                              {series.totalEpisodes} Episodes
                            </span>
                          )}
                          {series.seasons > 1 && (
                            <span className="text-white/80">
                              {series.seasons} Seasons
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {series.isTrending && (
                        <span className="badge bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          Trending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {series.description || 'No description available.'}
                  </p>
                </div>

                {/* Genre Tags */}
                {series.genre && series.genre.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {series.genre.map((genre, index) => (
                        <span
                          key={index}
                          className="badge bg-gray-100 text-gray-700"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Episodes Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Episodes
                  {series.currentSeason && series.seasons > 1 && (
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      (Season {series.currentSeason})
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Tv className="w-4 h-4" />
                  <span>{episodes.length} Episodes</span>
                </div>
              </div>

              {episodesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : episodesError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Failed to load episodes</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              ) : episodes.length === 0 ? (
                <div className="text-center py-8">
                  <Tv className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Episodes Available</h3>
                  <p className="text-gray-600">This series doesn't have any episodes yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {episodes.map((episode, index) => (
                    <div 
                      key={episode._id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              Episode {episode.episodeNumber}
                            </h3>
                            {episode.duration && (
                              <span className="flex items-center space-x-1 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{episode.duration}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-gray-800 mb-2">{episode.title}</h4>
                        </div>
                      </div>

                      {/* Download Links */}
                      {episode.downloadLinks && episode.downloadLinks.length > 0 && (
                        <div className="space-y-2">
                          {episode.downloadLinks.map((link, linkIndex) => (
                            <div 
                              key={linkIndex}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`badge text-xs ${getQualityColor(link.quality)}`}>
                                  {link.quality}
                                </span>
                                <span className="text-sm text-gray-600">HD Quality</span>
                              </div>
                              
                              <button
                                onClick={() => handleDownload(episode.episodeNumber, link)}
                                disabled={downloadingEpisode === `${episode.episodeNumber}-${link.quality}`}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                  downloadingEpisode === `${episode.episodeNumber}-${link.quality}`
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : getQualityColor(link.quality)
                                }`}
                              >
                                {downloadingEpisode === `${episode.episodeNumber}-${link.quality}` ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Downloaded</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Series Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Series Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className={`badge ${getCategoryColor(series.category)}`}>
                    {series.category}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Language</span>
                  <span className={`badge ${getLanguageColor(series.language)}`}>
                    {series.language}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Year</span>
                  <span className="font-medium">{series.year}</span>
                </div>
                
                {series.totalEpisodes && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Episodes</span>
                    <span className="font-medium">{series.totalEpisodes}</span>
                  </div>
                )}
                
                {series.seasons > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Seasons</span>
                    <span className="font-medium">{series.seasons}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Added</span>
                  <span className="font-medium">
                    {new Date(series.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Content */}
            {relatedMovies && relatedMovies.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Related Content</h3>
                <div className="space-y-4">
                  {relatedMovies.slice(0, 4).map((movie) => (
                    <MovieCard 
                      key={movie._id} 
                      movie={movie}
                      showQuality={false}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
  } catch (err) {
    console.error('SeriesDetails render error:', err)
    setRenderError(err.message)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">Render Error: {err.message}</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }
}

export default SeriesDetails