const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// =========================================
// SEARCH MOVIES
// =========================================

export async function searchMovies(
  query,
  page = 1,
  signal
) {
  const response = await fetch(
    `${API_BASE_URL}/movies/search?q=${encodeURIComponent(
      query
    )}&page=${page}`,
    {
      signal,
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(
      () => ({})
    );

    throw new Error(
      data.message ||
        "Failed to fetch movies"
    );
  }

  return response.json();
}

// =========================================
// BROWSE MOVIES
// =========================================

export async function getBrowseMovies(
  category,
  page = 1
) {
  const response = await fetch(
    `${API_BASE_URL}/movies/browse?category=${encodeURIComponent(
      category
    )}&page=${page}`
  );

  if (!response.ok) {
    const data = await response.json().catch(
      () => ({})
    );

    throw new Error(
      data.message ||
        "Failed to fetch browse movies"
    );
  }

  return response.json();
}

// =========================================
// GET MOVIE DETAILS
// =========================================

export async function getMovieDetails(
  movieId
) {
  const response = await fetch(
    `${API_BASE_URL}/movies/${movieId}`
  );

  if (!response.ok) {
    const data = await response.json().catch(
      () => ({})
    );

    throw new Error(
      data.message ||
        "Failed to fetch movie details"
    );
  }

  return response.json();
}

// =========================================
// GET WISHLIST
// =========================================

export async function getWishlist() {
  const response = await fetch(
    `${API_BASE_URL}/wishlist`
  );

  if (!response.ok) {
    const data = await response.json().catch(
      () => ({})
    );

    throw new Error(
      data.message ||
        "Failed to fetch wishlist"
    );
  }

  return response.json();
}

// =========================================
// ADD TO WISHLIST
// =========================================

export async function addToWishlist(movie) {
  const response = await fetch(
    `${API_BASE_URL}/wishlist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to add movie to wishlist"
    );
  }

  return data;
}

// =========================================
// REMOVE FROM WISHLIST
// =========================================

export async function removeFromWishlist(
  movieId
) {
  const response = await fetch(
    `${API_BASE_URL}/wishlist/${movieId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to remove movie from wishlist"
    );
  }

  return data;
}