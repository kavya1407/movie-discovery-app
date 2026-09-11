const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// Get all wishlist movies
router.get("/", async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(wishlist);
  } catch (error) {
    console.error("Wishlist GET Error:", error);

    res.status(500).json({
      message: "Failed to fetch wishlist",
    });
  }
});

// Add a movie to wishlist
router.post("/", async (req, res) => {
  try {
    const { movieId, title, year, posterUrl } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        message: "movieId and title are required",
      });
    }

    const existingMovie = await prisma.wishlist.findUnique({
      where: {
        movieId,
      },
    });

    if (existingMovie) {
      return res.status(409).json({
        message: "Movie is already in wishlist",
        movie: existingMovie,
      });
    }

    const movie = await prisma.wishlist.create({
      data: {
        movieId,
        title,
        year,
        posterUrl,
      },
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error("Wishlist POST Error:", error);

    res.status(500).json({
      message: "Failed to add movie to wishlist",
    });
  }
});

// Remove a movie from wishlist
router.delete("/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    const existingMovie = await prisma.wishlist.findUnique({
      where: {
        movieId,
      },
    });

    if (!existingMovie) {
      return res.status(404).json({
        message: "Movie not found in wishlist",
      });
    }

    await prisma.wishlist.delete({
      where: {
        movieId,
      },
    });

    res.json({
      message: "Movie removed from wishlist",
    });
  } catch (error) {
    console.error("Wishlist DELETE Error:", error);

    res.status(500).json({
      message: "Failed to remove movie from wishlist",
    });
  }
});

module.exports = router;