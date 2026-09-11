import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import {
  getWishlist,
  removeFromWishlist,
} from "../services/api";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingId, setRemovingId] =
    useState(null);

  // =========================================
  // LOAD WISHLIST
  // =========================================

  useEffect(() => {
    async function fetchWishlist() {
      try {
        setLoading(true);
        setError("");

        const data = await getWishlist();

        setWishlist(data);
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
            "Unable to load your wishlist. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, []);

  // =========================================
  // REMOVE FROM WISHLIST
  // =========================================

  async function handleRemove(movieId) {
    try {
      setRemovingId(movieId);
      setError("");

      await removeFromWishlist(movieId);

      setWishlist((previousWishlist) =>
        previousWishlist.filter(
          (movie) =>
            movie.movieId !== movieId
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to remove movie"
      );
    } finally {
      setRemovingId(null);
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <p className="message">
        Loading wishlist...
      </p>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="header-top">

          <h1>
            ❤️ My Wishlist
          </h1>

          <Link
            to="/"
            className="wishlist-link"
          >
            ← Back to Movies
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <main>

        {/* ERROR */}

        {error && (
          <p className="message error">
            {error}
          </p>
        )}

        {/* EMPTY WISHLIST */}

        {wishlist.length === 0 ? (
          <div className="message">

            <p>
              Your wishlist is empty 🎬
            </p>

            <Link
              to="/"
              className="back-link"
            >
              Discover Movies
            </Link>

          </div>
        ) : (

          /* WISHLIST GRID */

          <div className="movie-grid">

            {wishlist.map((movie) => (

              <div
                key={movie.movieId}
              >

                <MovieCard
                  movie={{
                    id: movie.movieId,
                    title: movie.title,
                    year: movie.year,
                    posterUrl:
                      movie.posterUrl,
                  }}
                />

                <button
                  onClick={() =>
                    handleRemove(
                      movie.movieId
                    )
                  }
                  disabled={
                    removingId ===
                    movie.movieId
                  }
                  className="remove-wishlist-button"
                >
                  {removingId ===
                  movie.movieId
                    ? "Removing..."
                    : "Remove"}
                </button>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Wishlist;