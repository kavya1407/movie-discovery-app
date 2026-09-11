import { useEffect, useRef, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import MovieCard from "../components/MovieCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

import {
  searchMovies,
  getBrowseMovies,
} from "../services/api";

function Home() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const initialQuery =
    searchParams.get("q") || "";

  const initialPage = Number(
    searchParams.get("page") || 1
  );

  const initialCategory =
    searchParams.get("category") || "popular";

  const initialSort =
    searchParams.get("sort") || "default";

  const [movies, setMovies] = useState([]);

  const [query, setQuery] =
    useState(initialQuery);

  const [searched, setSearched] =
    useState(Boolean(initialQuery));

  const [category, setCategory] =
    useState(initialCategory);

  const [page, setPage] =
    useState(initialPage);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [browseLoading, setBrowseLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [browseError, setBrowseError] =
    useState("");

  const [sortBy, setSortBy] =
    useState(initialSort);

  const searchControllerRef =
    useRef(null);

  // =========================================
  // UPDATE URL
  // =========================================

  function updateUrl({
    queryValue = query,
    pageValue = page,
    categoryValue = category,
    sortValue = sortBy,
    isSearching = searched,
  }) {
    const params = {};

    if (
      isSearching &&
      queryValue.trim()
    ) {
      params.q = queryValue.trim();
    }

    if (pageValue > 1) {
      params.page = pageValue;
    }

    if (
      !isSearching &&
      categoryValue !== "popular"
    ) {
      params.category = categoryValue;
    }

    if (sortValue !== "default") {
      params.sort = sortValue;
    }

    setSearchParams(params);
  }

  // =========================================
  // SORT MOVIES
  // =========================================

  function sortMovies(
    movieList,
    sortValue
  ) {
    const sortedMovies = [
      ...movieList,
    ];

    if (sortValue === "title-asc") {
      sortedMovies.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (sortValue === "title-desc") {
      sortedMovies.sort((a, b) =>
        b.title.localeCompare(a.title)
      );
    }

    if (sortValue === "year-desc") {
      sortedMovies.sort(
        (a, b) =>
          parseInt(b.year) -
          parseInt(a.year)
      );
    }

    if (sortValue === "year-asc") {
      sortedMovies.sort(
        (a, b) =>
          parseInt(a.year) -
          parseInt(b.year)
      );
    }

    return sortedMovies;
  }

  // =========================================
  // LOAD MOVIES
  // =========================================

  async function loadMovies({
    queryValue = initialQuery,
    pageValue = initialPage,
    categoryValue = initialCategory,
    sortValue = initialSort,
  } = {}) {
    try {
      setLoading(true);
      setError("");
      setBrowseError("");

      let data;

      if (queryValue) {
        data = await searchMovies(
          queryValue,
          pageValue
        );
      } else {
        data = await getBrowseMovies(
          categoryValue,
          pageValue
        );
      }

      setMovies(
        sortMovies(
          data.movies || [],
          sortValue
        )
      );

      setPage(
        data.currentPage ||
          pageValue
      );

      setTotalPages(
        data.totalPages || 1
      );

      setQuery(queryValue);
      setCategory(categoryValue);
      setSortBy(sortValue);
      setSearched(
        Boolean(queryValue)
      );
    } catch (error) {
      console.error(error);

      setMovies([]);

      if (queryValue) {
        setError(
          error.message ||
            "Failed to load search results."
        );
      } else {
        setBrowseError(
          error.message ||
            "Failed to load movies."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadMovies();
  }, []);

  // =========================================
  // RETRY
  // =========================================

  async function handleRetry() {
    await loadMovies({
      queryValue: searched
        ? query.trim()
        : "",
      pageValue: page,
      categoryValue: category,
      sortValue: sortBy,
    });
  }

  // =========================================
  // SEARCH
  // =========================================

  async function handleSearch(event) {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      return;
    }

    if (
      searchControllerRef.current
    ) {
      searchControllerRef.current.abort();
    }

    const controller =
      new AbortController();

    searchControllerRef.current =
      controller;

    try {
      setLoading(true);
      setError("");
      setBrowseError("");

      setSearched(true);
      setPage(1);
      setSortBy("default");

      updateUrl({
        queryValue:
          trimmedQuery,
        pageValue: 1,
        categoryValue:
          category,
        sortValue: "default",
        isSearching: true,
      });

      const data =
        await searchMovies(
          trimmedQuery,
          1,
          controller.signal
        );

      setMovies(
        data.movies || []
      );

      setTotalPages(
        data.totalPages || 1
      );
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(error);

      setMovies([]);

      setError(
        error.message ||
          "Failed to search movies. Please try again."
      );
    } finally {
      if (
        !controller.signal.aborted
      ) {
        setLoading(false);
      }
    }
  }

  // =========================================
  // LOAD MORE
  // =========================================

  async function handleLoadMore() {
    if (loadingMore) {
      return;
    }

    if (page >= totalPages) {
      return;
    }

    try {
      setLoadingMore(true);
      setError("");

      const nextPage =
        page + 1;

      let data;

      if (searched) {
        data =
          await searchMovies(
            query.trim(),
            nextPage
          );
      } else {
        data =
          await getBrowseMovies(
            category,
            nextPage
          );
      }

      const newMovies =
        data.movies || [];

      setMovies(
        (previousMovies) =>
          sortMovies(
            [
              ...previousMovies,
              ...newMovies,
            ],
            sortBy
          )
      );

      setPage(
        data.currentPage ||
          nextPage
      );

      setTotalPages(
        data.totalPages ||
          totalPages
      );

      updateUrl({
        queryValue: query,
        pageValue: nextPage,
        categoryValue:
          category,
        sortValue: sortBy,
        isSearching: searched,
      });
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load more movies. Please try again."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  // =========================================
  // CATEGORY CHANGE
  // =========================================

  async function handleCategoryChange(
    selectedCategory
  ) {
    try {
      setBrowseLoading(true);
      setBrowseError("");
      setError("");

      setSearched(false);
      setQuery("");
      setCategory(
        selectedCategory
      );
      setPage(1);
      setTotalPages(1);
      setSortBy("default");

      updateUrl({
        queryValue: "",
        pageValue: 1,
        categoryValue:
          selectedCategory,
        sortValue: "default",
        isSearching: false,
      });

      const data =
        await getBrowseMovies(
          selectedCategory,
          1
        );

      setMovies(
        data.movies || []
      );

      setPage(
        data.currentPage || 1
      );

      setTotalPages(
        data.totalPages || 1
      );
    } catch (error) {
      console.error(error);

      setMovies([]);

      setBrowseError(
        error.message ||
          "Failed to load movies. Please try again."
      );
    } finally {
      setBrowseLoading(false);
      setLoading(false);
    }
  }

  // =========================================
  // SORT
  // =========================================

  function handleSort(event) {
    const value =
      event.target.value;

    setSortBy(value);

    setMovies(
      (previousMovies) =>
        sortMovies(
          previousMovies,
          value
        )
    );

    updateUrl({
      queryValue: query,
      pageValue: page,
      categoryValue:
        category,
      sortValue: value,
      isSearching: searched,
    });
  }

  // =========================================
  // INITIAL LOADING
  // =========================================

  if (
    loading &&
    movies.length === 0
  ) {
    return (
      <div className="app">

        <header className="header">

          <div className="header-top">

            <h1>
              🎬 Movie Discovery App
            </h1>

          </div>

        </header>

        <LoadingSkeleton
          count={10}
        />

      </div>
    );
  }

  // =========================================
  // MAIN PAGE
  // =========================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="header-top">

          <h1>
            🎬 Movie Discovery App
          </h1>

          <Link
            to="/wishlist"
            className="wishlist-link"
          >
            ❤️ Wishlist
          </Link>

        </div>

        {/* SEARCH */}

        <form
          onSubmit={handleSearch}
          className="search-form"
        >

          <input
            type="text"
            placeholder="Search for a movie..."
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
          />

          <button type="submit">
            Search
          </button>

        </form>

      </header>

      {/* BROWSE CATEGORIES */}

      {!searched && (
        <section className="browse-section">

          <h2>
            Browse Movies
          </h2>

          <div className="category-buttons">

            <button
              className={`category-button ${
                category === "popular"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleCategoryChange(
                  "popular"
                )
              }
            >
              🔥 Popular
            </button>

            <button
              className={`category-button ${
                category === "action"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleCategoryChange(
                  "action"
                )
              }
            >
              💥 Action
            </button>

            <button
              className={`category-button ${
                category === "comedy"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleCategoryChange(
                  "comedy"
                )
              }
            >
              😂 Comedy
            </button>

            <button
              className={`category-button ${
                category === "sciFi"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleCategoryChange(
                  "sciFi"
                )
              }
            >
              🚀 Sci-Fi
            </button>

            <button
              className={`category-button ${
                category === "animation"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleCategoryChange(
                  "animation"
                )
              }
            >
              🧸 Animation
            </button>

          </div>

        </section>
      )}

      {/* SORT */}

      {movies.length > 0 && (
        <div className="sort-container">

          <label htmlFor="sort">
            Sort by:
          </label>

          <select
            id="sort"
            value={sortBy}
            onChange={handleSort}
          >

            <option value="default">
              Default
            </option>

            <option value="title-asc">
              Title A → Z
            </option>

            <option value="title-desc">
              Title Z → A
            </option>

            <option value="year-desc">
              Newest First
            </option>

            <option value="year-asc">
              Oldest First
            </option>

          </select>

        </div>
      )}

      {/* SEARCH ERROR */}

      {error && (
        <div className="message error-box">

          <p>{error}</p>

          <button
            onClick={handleRetry}
            className="retry-button"
          >
            🔄 Retry
          </button>

        </div>
      )}

      {/* BROWSE ERROR */}

      {browseError && (
        <div className="message error-box">

          <p>{browseError}</p>

          <button
            onClick={handleRetry}
            className="retry-button"
          >
            🔄 Retry
          </button>

        </div>
      )}

      {/* MOVIE GRID */}

      {movies.length > 0 ? (

        <main className="movie-grid">

          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
            />
          ))}

        </main>

      ) : (

        !loading &&
        !browseLoading &&
        !error &&
        !browseError && (
          <p className="message">
            No movies found 🎬
          </p>
        )

      )}

      {/* LOAD MORE */}

      {page < totalPages &&
        movies.length > 0 && (

          <div className="load-more-container">

            <button
              onClick={
                handleLoadMore
              }
              disabled={
                loadingMore
              }
              className="load-more-button"
            >

              {loadingMore
                ? "Loading..."
                : "Load More"}

            </button>

          </div>

        )}

      {/* BROWSE LOADING */}

      {browseLoading &&
        movies.length > 0 && (

          <p className="message">
            Loading movies...
          </p>

        )}

    </div>
  );
}

export default Home;