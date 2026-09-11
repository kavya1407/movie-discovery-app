import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  getMovieDetails,
  getWishlist,
  addToWishlist,
} from "../services/api";

function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);
  const [wishlistMessage, setWishlistMessage] =
    useState("");

  // =========================================
  // REMEMBER WHERE USER CAME FROM
  // =========================================

  const backTo = location.state?.from || "/";

  // =========================================
  // LOAD MOVIE DETAILS
  // =========================================

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true);
        setError("");

        const data = await getMovieDetails(id);

        setMovie(data);
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
            "Failed to load movie details"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  // =========================================
  // CHECK WISHLIST
  // =========================================

  useEffect(() => {
    async function checkWishlist() {
      try {
        const data = await getWishlist();

        const exists = data.some(
          (item) => item.movieId === id
        );

        setInWishlist(exists);
      } catch (error) {
        console.error(error);
      }
    }

    checkWishlist();
  }, [id]);

  // =========================================
  // ADD TO WISHLIST
  // =========================================

  async function handleAddToWishlist() {
    if (inWishlist || !movie) {
      return;
    }

    try {
      setWishlistLoading(true);
      setWishlistMessage("");

      await addToWishlist({
        movieId: movie.id,
        title: movie.title,
        year: movie.year,
        posterUrl: movie.posterUrl,
      });

      setInWishlist(true);

      setWishlistMessage(
        "❤️ Added to wishlist!"
      );
    } catch (error) {
      console.error(error);

      setWishlistMessage(
        error.message ||
          "Failed to add movie to wishlist"
      );
    } finally {
      setWishlistLoading(false);
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <p className="message">
        Loading movie...
      </p>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="message">
        <p className="error">
          {error}
        </p>

        <Link
          to={backTo}
          className="back-link"
        >
          ← Back to movies
        </Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <p className="message">
        Movie not found
      </p>
    );
  }

  // =========================================
  // MOVIE DETAILS
  // =========================================

  return (
    <div className="details-page">

      <Link
        to={backTo}
        className="back-link"
      >
        ← Back to movies
      </Link>

      <div className="details-container">

        {/* POSTER */}

        <div>
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="details-poster"
            />
          ) : (
            <div className="details-no-poster">
              No Poster
            </div>
          )}
        </div>

        {/* MOVIE INFORMATION */}

        <div className="details-info">

          <h1>{movie.title}</h1>

          <p>
            <strong>Year:</strong>{" "}
            {movie.year}
          </p>

          <p>
            <strong>Rated:</strong>{" "}
            {movie.rated}
          </p>

          <p>
            <strong>Released:</strong>{" "}
            {movie.released}
          </p>

          <p>
            <strong>Runtime:</strong>{" "}
            {movie.runtime}
          </p>

          <p>
            <strong>Genre:</strong>{" "}
            {movie.genre}
          </p>

          <p>
            <strong>Director:</strong>{" "}
            {movie.director}
          </p>

          <p>
            <strong>Actors:</strong>{" "}
            {movie.actors}
          </p>

          <p>
            <strong>Language:</strong>{" "}
            {movie.language}
          </p>

          <p>
            <strong>Country:</strong>{" "}
            {movie.country}
          </p>

          <p>
            <strong>IMDb Rating:</strong>{" "}
            {movie.rating}
          </p>

          <p>
            <strong>IMDb Votes:</strong>{" "}
            {movie.votes}
          </p>

          <p className="plot">
            {movie.plot}
          </p>

          {/* WISHLIST BUTTON */}

          <button
            onClick={handleAddToWishlist}
            disabled={
              wishlistLoading ||
              inWishlist
            }
            className="wishlist-button"
          >
            {wishlistLoading
              ? "Adding..."
              : inWishlist
              ? "❤️ In Wishlist"
              : "❤️ Add to Wishlist"}
          </button>

          {wishlistMessage && (
            <p className="wishlist-message">
              {wishlistMessage}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default MovieDetails;