import { Link, useLocation } from "react-router-dom";

function MovieCard({ movie }) {
  const location = useLocation();

  return (
    <Link
      to={`/movies/${movie.id}`}
      state={{
        from:
          location.pathname +
          location.search,
      }}
      className="movie-card-link"
    >
      <div className="movie-card">

        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="movie-poster"
          />
        ) : (
          <div className="no-poster">
            No Poster
          </div>
        )}

        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p>{movie.year}</p>
        </div>

      </div>
    </Link>
  );
}

export default MovieCard;