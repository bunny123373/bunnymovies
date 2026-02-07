import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const useMovies = (filters = {}) => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const fetchTimeoutRef = useRef(null)
  
  const fetchMovies = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      }
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value)
        }
      })

      const response = await api.get(`/movies?${params.toString()}`)
      setMovies(response.data.movies)
      setPagination({
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages
      })
      setError(null)
      setIsDataLoaded(true)
    } catch (err) {
      console.error('Failed to fetch movies:', err)
      console.error('Error response:', err.response)
      console.error('Request URL:', `${API_URL}/movies?${params.toString()}`)
      setError(err.response?.data?.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    if (isInitialLoadRef.current) {
      fetchMovies(true)
      isInitialLoadRef.current = false
    } else {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
      fetchTimeoutRef.current = setTimeout(() => fetchMovies(false), 300)
    }
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [filters, fetchMovies])

  return { movies, loading, error, pagination, isDataLoaded, refetch: () => fetchMovies(false) }
}

export const useMovie = (id) => {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/movies/${id}`)
        setMovie(response.data)
        setError(null)
    } catch (err) {
      console.error('Failed to fetch movies:', err)
      console.error('Error response:', err.response)
      console.error('Request URL:', `${API_URL}/movies?${params.toString()}`)
      setError(err.response?.data?.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
    }

    if (id) {
      fetchMovie()
    }
  }, [id])

  return { movie, loading, error }
}

export const useRelatedMovies = (id) => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/movies/related/${id}`)
        setMovies(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch related movies')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRelated()
    }
  }, [id])

  return { movies, loading, error }
}

export const useSearchSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([])
        return
      }

      try {
        setLoading(true)
        const response = await api.get(`/movies/search-suggestions?q=${encodeURIComponent(query)}`)
        setSuggestions(response.data)
      } catch (err) {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  return { suggestions, loading }
}

export const useCategories = () => {
  const [categories, setCategories] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await api.get('/categories')
        setCategories(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

export const useStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await api.get('/categories/stats')
        setStats(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error, refetch: () => fetchStats() }
}

export const useSeries = (filters = {}) => {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const isInitialLoadRef = useRef(true)

  const fetchSeries = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      }
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value)
        }
      })

      const response = await api.get(`/movies/series?${params.toString()}`)
      console.log('Series API Response:', response.data)
      setSeries(response.data.series)
      setPagination({
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch series:', err)
      setError(err.response?.data?.message || 'Failed to fetch series')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      fetchSeries(true)
    }
  }, [fetchSeries])

  return { series, loading, error, pagination, refetch: () => fetchSeries(false) }
}

export const useSeriesDetails = (id) => {
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/movies/${id}`)
        setSeries(response.data)
        setError(null)
    } catch (err) {
      console.error('Failed to fetch series details:', err)
      console.error('Error response:', err.response)
      console.error('Request URL:', `${API_URL}/movies/${id}`)
      setError(err.response?.data?.message || 'Failed to fetch series details')
    } finally {
      setLoading(false)
    }
    }

    if (id) {
      fetchSeries()
    }
  }, [id])

  return { series, loading, error }
}

export const incrementDownloadCount = async (movieId) => {
  try {
    await api.post(`/movies/${movieId}/download`)
  } catch (err) {
    console.error('Failed to increment download count:', err)
  }
}

export const createMovie = async (movieData, adminKey) => {
  console.log('Sending movie data:', JSON.stringify(movieData, null, 2))
  console.log('Admin key:', adminKey ? 'provided' : 'missing')
  const response = await api.post('/movies', movieData, {
    headers: { 'x-admin-key': adminKey }
  })
  return response.data
}

export const updateMovie = async (id, movieData, adminKey) => {
  const response = await api.put(`/movies/${id}`, movieData, {
    headers: { 'x-admin-key': adminKey }
  })
  return response.data
}

export const deleteMovie = async (id, adminKey) => {
  const response = await api.delete(`/movies/${id}`, {
    headers: { 'x-admin-key': adminKey }
  })
  return response.data
}

export const toggleMovieStatus = async (id, action, adminKey) => {
  const response = await api.patch(`/movies/${id}/${action}`, {}, {
    headers: { 'x-admin-key': adminKey }
  })
  return response.data
}

export default api
