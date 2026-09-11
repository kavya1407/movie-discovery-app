function LoadingSkeleton({ count = 10 }) {
  return (
    <div className="movie-grid">
      {Array.from({ length: count }).map(
        (_, index) => (
          <div
            className="skeleton-card"
            key={index}
          >
            <div className="skeleton-poster"></div>

            <div className="skeleton-info">
              <div className="skeleton-title"></div>
              <div className="skeleton-year"></div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default LoadingSkeleton;