import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../hooks/useNotification'
import DataManager from '../utils/dataManager'

const AnimeList = () => {
  const [animeList, setAnimeList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedMoods, setSelectedMoods] = useState([])
  const [gridColumns, setGridColumns] = useState(4)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  const navigate = useNavigate()
  const { showNotification } = useNotification()

  // Genre and mood mappings
  const genreEmojis = {
    "اكشن": "💥", "كوميديا": "😂", "دراما": "🎭", "رومانسية": "💖", "مغامرات": "🗺️",
    "خيال علمي": "🚀", "فانتازيا": "🧙", "رعب": "👻", "إثارة": "😱", "رياضي": "⚽",
    "تاريخي": "🏛️", "موسيقي": "🎵", "مدرسي": "📚", "عسكري": "⚔️", "جريمة": "🔍"
  }

  const moodEmojis = {
    "سعيد": "😊", "حزين": "😢", "مثير": "🔥", "مضحك": "😆", "مشوق": "😮",
    "رومانسي": "💕", "مخيف": "😨", "ملهم": "✨", "هادئ": "😌", "متحمس": "🤩",
    "نشيط": "🏃", "فضولي": "🤔", "مغامر": "🗺️", "عاطفي": "💕", "مبتكر": "💡",
    "تاريخي": "🏛️", "ساخر": "😆", "سحري": "🪄", "ميكانيكي": "🤖", "مدرسي": "📚",
    "قتالي": "🥊", "موسيقي": "🎵"
  }

  const loadAnimeData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await DataManager.getAnimeList()
      if (result?.data && Array.isArray(result.data)) {
        const processed = result.data.map(processAnimeData)
        const unique = new Map()
        processed.forEach(anime => unique.set(anime.id, anime))
        const uniqueList = Array.from(unique.values())
        
        setAnimeList(uniqueList)
        setFilteredList(uniqueList)
        showNotification("تم تحميل بيانات الأنمي بنجاح", "success")
      } else {
        showNotification("البيانات المسترجعة غير صالحة", "error")
      }
    } catch (error) {
      console.error("Error loading anime list:", error)
      showNotification("حدث خطأ في تحميل بيانات الأنمي", "error")
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const processAnimeData = (data) => {
    return {
      id: data.id || data.mal_id || Math.random().toString(36).substr(2, 9),
      title: data.title || data.name || "غير محدد",
      image: data.image || data.images?.jpg?.image_url || data.poster || "https://via.placeholder.com/300x400",
      rating: data.score || data.rating || Math.floor(Math.random() * 5) + 6,
      status: data.status || "مستمر",
      genres: data.genres || data.genre || [],
      moods: data.moods || [],
      year: data.year || data.aired?.from ? new Date(data.aired.from).getFullYear() : 2023,
      episodes: data.episodes || data.episode || 0,
      description: data.synopsis || data.description || "لا يوجد وصف متاح."
    }
  }

  const handleAnimeClick = (anime) => {
    navigate(`/anime/${anime.id}`, { state: { anime } })
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    filterAnime(query, selectedGenres, selectedMoods)
  }

  const filterAnime = (search, genres, moods) => {
    let filtered = animeList

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(anime => 
        anime.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Genre filter
    if (genres.length > 0) {
      filtered = filtered.filter(anime => 
        genres.some(genre => anime.genres.includes(genre))
      )
    }

    // Mood filter
    if (moods.length > 0) {
      filtered = filtered.filter(anime => 
        moods.some(mood => anime.moods.includes(mood))
      )
    }

    setFilteredList(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    loadAnimeData()
  }, [loadAnimeData])

  const createAnimeCard = (anime) => (
    <div 
      key={anime.id} 
      className="anime-card glass"
      onClick={() => handleAnimeClick(anime)}
    >
      <div className="anime-poster">
        <img src={anime.image} alt={anime.title} loading="lazy" />
        <div className="anime-overlay">
          <button className="play-btn">
            <i className="fas fa-play"></i>
          </button>
        </div>
      </div>
      <div className="anime-info">
        <h3 className="anime-title">{anime.title}</h3>
        <div className="anime-meta">
          <span className="rating">
            <i className="fas fa-star"></i> {anime.rating}
          </span>
          <span className="year">{anime.year}</span>
          <span className="episodes">{anime.episodes} حلقة</span>
        </div>
        {anime.genres.length > 0 && (
          <div className="anime-genres">
            {anime.genres.slice(0, 3).map(genre => (
              <span key={genre} className="genre-tag">
                {genreEmojis[genre] || "🎬"} {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredList.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="anime-page">
        <div className="loader-container">
          <div className="loader"></div>
          <p>جاري تحميل الأنمي...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="anime-page">
      <div className="main-content glass">
        {/* Search and Filters */}
        <section className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="ابحث عن أنمي..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="filter-controls">
            <button className="filter-btn">
              <i className="fas fa-filter"></i> فلترة
            </button>
            <button 
              className="grid-toggle-btn"
              onClick={() => setGridColumns(gridColumns === 4 ? 6 : 4)}
            >
              <i className="fas fa-th"></i>
            </button>
          </div>
        </section>

        {/* Anime Grid */}
        <section className="anime-section">
          <div 
            className="anime-grid" 
            style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
          >
            {currentItems.map(createAnimeCard)}
          </div>
          
          {filteredList.length === 0 && !loading && (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>لا توجد نتائج للبحث</p>
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            <span className="page-info">
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

export default AnimeList