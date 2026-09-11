const express = require("express");
const axios = require("axios");

const router = express.Router();

const OMDB_URL = "https://www.omdbapi.com/";

// =========================================
// BROWSE CATEGORIES
// =========================================

const categories = {
  popular: "avengers",
  action: "batman",
  comedy: "friends",
  sciFi: "star",
  animation: "toy",
};

// =========================================
// CACHE
// =========================================

const CACHE_DURATION = 5 * 60 * 1000;

const cache = new Map();

function getCachedData(key) {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  const isExpired =
    Date.now() - cached.timestamp > CACHE_DURATION;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// =========================================
// OMDb ERROR HANDLER
// =========================================

function handleOmdbError(response, res) {
  const message =
    response?.data?.Error ||
    "Failed to fetch data from OMDb";

  // OMDb daily request limit
  if (
    message
      .toLowerCase()
      .includes("request limit")
  ) {
    return res.status(429).json({
      message:
        "Movie API request limit reached. Please try again later.",
    });
  }

  // Movie not found
  if (
    message
      .toLowerCase()
      .includes("not found")
  ) {
    return res.status(404).json({
      message: "Movie not found.",
    });
  }

  // Other OMDb errors
  return res.status(502).json({
    message,
  });
}

// =========================================
// SEARCH MOVIES
// =========================================

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    const page = Number(req.query.page) || 1;

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    if (page < 1) {
      return res.status(400).json({
        message: "Page must be greater than 0",
      });
    }

    const cacheKey = `search:${query.toLowerCase()}:page:${page}`;

    const cachedData =
      getCachedData(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(
      OMDB_URL,
      {
        params: {
          apikey: process.env.OMDB_API_KEY,
          s: query,
          page,
          type: "movie",
        },
        timeout: 5000,
      }
    );

    // OMDb can return HTTP 200 with Response: "False"
    if (response.data.Response === "False") {
      return handleOmdbError(
        response,
        res
      );
    }

    // Unexpected response format
    if (
      !Array.isArray(
        response.data.Search
      )
    ) {
      return res.status(502).json({
        message:
          "Unexpected response received from movie API.",
      });
    }

    const totalResults = Number(
      response.data.totalResults
    ) || 0;

    const totalPages = Math.ceil(
      totalResults / 10
    );

    // Remove incomplete movie objects
    // before sending data to frontend
    const movies =
      response.data.Search
        .filter(
          (movie) =>
            movie &&
            movie.imdbID &&
            movie.Title
        )
        .map((movie) => ({
          id: movie.imdbID,
          title: movie.Title,
          year: movie.Year || "N/A",
          type: movie.Type || "movie",
          posterUrl:
            movie.Poster &&
            movie.Poster !== "N/A"
              ? movie.Poster
              : null,
        }));

    const result = {
      query,
      movies,
      totalResults,
      totalPages,
      currentPage: page,
      hasNextPage:
        page < totalPages,
    };

    setCachedData(
      cacheKey,
      result
    );

    res.json(result);
  } catch (error) {
    console.error(
      "Search API Error:",
      error.message
    );

    // Request timeout
    if (
      error.code ===
      "ECONNABORTED"
    ) {
      return res.status(504).json({
        message:
          "Movie service took too long to respond. Please try again.",
      });
    }

    // External API/network failure
    return res.status(502).json({
      message:
        "Unable to connect to the movie service. Please try again later.",
    });
  }
});

// =========================================
// BROWSE MOVIES
// =========================================

router.get("/browse", async (req, res) => {
  try {
    const category =
      req.query.category || "popular";

    const page =
      Number(req.query.page) || 1;

    if (!categories[category]) {
      return res.status(400).json({
        message:
          "Invalid movie category",
      });
    }

    if (page < 1) {
      return res.status(400).json({
        message:
          "Page must be greater than 0",
      });
    }

    const searchTerm =
      categories[category];

    const cacheKey =
      `browse:${category}:page:${page}`;

    const cachedData =
      getCachedData(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(
      OMDB_URL,
      {
        params: {
          apikey: process.env.OMDB_API_KEY,
          s: searchTerm,
          page,
          type: "movie",
        },
        timeout: 5000,
      }
    );

    // Handle OMDb errors
    if (response.data.Response === "False") {
      return handleOmdbError(
        response,
        res
      );
    }

    // Validate response
    if (
      !Array.isArray(
        response.data.Search
      )
    ) {
      return res.status(502).json({
        message:
          "Unexpected response received from movie API.",
      });
    }

    const totalResults = Number(
      response.data.totalResults
    ) || 0;

    const totalPages = Math.ceil(
      totalResults / 10
    );

    // Remove incomplete movie objects
    // before sending data to frontend
    const movies =
      response.data.Search
        .filter(
          (movie) =>
            movie &&
            movie.imdbID &&
            movie.Title
        )
        .map((movie) => ({
          id: movie.imdbID,
          title: movie.Title,
          year: movie.Year || "N/A",
          type: movie.Type || "movie",
          posterUrl:
            movie.Poster &&
            movie.Poster !== "N/A"
              ? movie.Poster
              : null,
        }));

    const result = {
      category,
      movies,
      totalResults,
      totalPages,
      currentPage: page,
      hasNextPage:
        page < totalPages,
    };

    setCachedData(
      cacheKey,
      result
    );

    res.json(result);
  } catch (error) {
    console.error(
      "Browse API Error:",
      error.message
    );

    // Request timeout
    if (
      error.code ===
      "ECONNABORTED"
    ) {
      return res.status(504).json({
        message:
          "Movie service took too long to respond. Please try again.",
      });
    }

    // External API/network failure
    return res.status(502).json({
      message:
        "Unable to connect to the movie service. Please try again later.",
    });
  }
});

// =========================================
// GET MOVIE DETAILS
// =========================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message:
          "Movie ID is required",
      });
    }

    const cacheKey =
      `details:${id}`;

    const cachedData =
      getCachedData(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(
      OMDB_URL,
      {
        params: {
          apikey: process.env.OMDB_API_KEY,
          i: id,
          plot: "full",
        },
        timeout: 5000,
      }
    );

    // Handle OMDb errors
    if (response.data.Response === "False") {
      return handleOmdbError(
        response,
        res
      );
    }

    // Validate response
    if (
      !response.data ||
      !response.data.imdbID
    ) {
      return res.status(502).json({
        message:
          "Unexpected response received from movie API.",
      });
    }

    const movie = {
      id: response.data.imdbID,
      title:
        response.data.Title ||
        "Unknown Title",
      year:
        response.data.Year ||
        "N/A",
      rated:
        response.data.Rated ||
        "N/A",
      released:
        response.data.Released ||
        "N/A",
      runtime:
        response.data.Runtime ||
        "N/A",
      genre:
        response.data.Genre ||
        "N/A",
      director:
        response.data.Director ||
        "N/A",
      actors:
        response.data.Actors ||
        "N/A",
      plot:
        response.data.Plot ||
        "No plot information available.",
      language:
        response.data.Language ||
        "N/A",
      country:
        response.data.Country ||
        "N/A",
      awards:
        response.data.Awards ||
        "N/A",
      posterUrl:
        response.data.Poster &&
        response.data.Poster !== "N/A"
          ? response.data.Poster
          : null,
      rating:
        response.data.imdbRating ||
        "N/A",
      votes:
        response.data.imdbVotes ||
        "N/A",
    };

    setCachedData(
      cacheKey,
      movie
    );

    res.json(movie);
  } catch (error) {
    console.error(
      "Details API Error:",
      error.message
    );

    // Request timeout
    if (
      error.code ===
      "ECONNABORTED"
    ) {
      return res.status(504).json({
        message:
          "Movie service took too long to respond. Please try again.",
      });
    }

    // External API/network failure
    return res.status(502).json({
      message:
        "Unable to connect to the movie service. Please try again later.",
    });
  }
});

module.exports = router;