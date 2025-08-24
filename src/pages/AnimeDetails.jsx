import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useNotification } from '../hooks/useNotification'

const AnimeDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useUser()
  const { showNotification } = useNotification()
  
  const [anime, setAnime] = useState(location.state?.anime || null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(!anime)

  useEffect(() => {
    if (!anime) {
      // Load anime data from localStorage or API if not passed via state
      loadAnimeData()
    } else {
      loadUserData()
      loadComments()
    }
  }, [id, anime])

  const loadAnimeData = () => {
    // Try to load from localStorage first
    const cached = localStorage.getItem(`anime_${id}`)
    if (cached) {
      try {
        const animeData = JSON.parse(cached)
        setAnime(animeData)
        loadUserData()
        loadComments()
      } catch (error) {
        console.error('Error parsing cached anime data:', error)
      }
    }
    setLoading(false)
  }

  const loadUserData = () => {
    if (!isLoggedIn) return
    
    // Load favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.includes(id))
    
    // Load user rating
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}')
    setUserRating(ratings[id] || 0)
  }

  const loadComments = () => {
    const key = `comments_${id}`
    const savedComments = JSON.parse(localStorage.getItem(key) || '[]')
    setComments(savedComments)
  }

  const handleFavoriteToggle = () => {
    if (!isLoggedIn) {
      showNotification('يجب تسجيل الدخول لإضافة المفضلة', 'warning')
      return
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    let newFavorites
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav !== id)
      showNotification('تم إزالة الأنمي من المفضلة', 'info')
    } else {
      newFavorites = [...favorites, id]
      showNotification('تم إضافة الأنمي للمفضلة', 'success')
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const handleRating = (rating) => {
    if (!isLoggedIn) {
      showNotification('يجب تسجيل الدخول للتقييم', 'warning')
      return
    }

    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}')
    ratings[id] = rating
    localStorage.setItem('ratings', JSON.stringify(ratings))
    setUserRating(rating)
    showNotification(`تم تقييم الأنمي بـ ${rating} نجوم`, 'success')
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      showNotification('يجب تسجيل الدخول للتعليق', 'warning')
      return
    }
    
    const text = newComment.trim()
    if (!text) {
      showNotification('اكتب تعليقاً أولاً', 'warning')
      return
    }
    
    const key = `comments_${id}`
    const savedComments = JSON.parse(localStorage.getItem(key) || '[]')
    const comment = {
      content: text,
      username: user?.username || 'مستخدم',
      createdAt: new Date().toISOString()
    }
    
    savedComments.push(comment)
    localStorage.setItem(key, JSON.stringify(savedComments))
    setComments(savedComments)
    setNewComment('')
    showNotification('تم نشر التعليق', 'success')
  }

  const handleWatchNow = () => {
    showNotification('جارٍ التحقق من الحلقات...')
    // In a real app, this would check for available episodes
    setTimeout(() => {
      showNotification('لا توجد حلقات متاحة حالياً', 'warning')
    }, 1000)
  }

  const translateStatus = (status) => {
    const statusMap = {
      'Currently Airing': 'يعرض حالياً',
      'Finished Airing': 'انتهى العرض',
      'Not yet aired': 'لم يعرض بعد',
      'مستمر': 'مستمر',
      'منتهي': 'منتهي'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="anime-details-page">
        <div className="loader-container">
          <div className="loader"></div>
          <p>جاري تحميل تفاصيل الأنمي...</p>
        </div>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="anime-details-page">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>لم يتم العثور على الأنمي</h2>
          <button onClick={() => navigate('/anime')} className="action-btn">
            العودة لقائمة الأنمي
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="anime-details-page">
      <div className="container glass">
        {/* Hero Section */}
        <section className="anime-hero">
          <div className="anime-poster-large">
            <img src={anime.image} alt={anime.title} />
          </div>
          
          <div className="anime-info-section">
            <h1 className="anime-title">{anime.title}</h1>
            
            <div className="anime-meta-info">
              <div className="meta-item">
                <span className="meta-label">التقييم:</span>
                <span className="meta-value">
                  <i className="fas fa-star"></i> {anime.rating}/10
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">الحالة:</span>
                <span className="meta-value">{translateStatus(anime.status)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">عدد الحلقات:</span>
                <span className="meta-value">{anime.episodes} حلقة</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">السنة:</span>
                <span className="meta-value">{anime.year}</span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn primary" onClick={handleWatchNow}>
                <i className="fas fa-play"></i> مشاهدة الآن
              </button>
              <button 
                className={`btn ${isFavorite ? 'favorite active' : 'favorite'}`}
                onClick={handleFavoriteToggle}
              >
                <i className={`fas ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`}></i>
                {isFavorite ? 'مضاف للمفضلة' : 'إضافة للمفضلة'}
              </button>
              <button className="btn share">
                <i className="fas fa-share"></i> مشاركة
              </button>
            </div>

            {/* User Rating */}
            <div className="user-rating-section">
              <h3>قيّم هذا الأنمي</h3>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star ${star <= userRating ? 'active' : ''}`}
                    onClick={() => handleRating(star)}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <span className="user-rating-text">تقييمك: {userRating}/5</span>
              )}
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="description-box glass">
          <h2><i className="fas fa-book-open"></i> القصة</h2>
          <p>{anime.description || 'لا يوجد وصف.'}</p>
        </section>

        {/* Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <section className="genres-section glass">
            <h2><i className="fas fa-tags"></i> التصنيفات</h2>
            <div className="genres-list">
              {anime.genres.map(genre => (
                <span key={genre} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="comment-section glass">
          <h2><i className="fas fa-comments"></i> التعليقات</h2>
          
          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-author">{comment.username}</div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          {isLoggedIn ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                rows="3"
                placeholder="أكتب تعليقك هنا..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="glass-btn">نشر</button>
            </form>
          ) : (
            <div className="comment-warning">
              يجب تسجيل الدخول للتعليق
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AnimeDetails