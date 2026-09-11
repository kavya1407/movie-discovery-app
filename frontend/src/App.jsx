import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/movies/:id"
        element={<MovieDetails />}
      />

      <Route
        path="/wishlist"
        element={<Wishlist />}
      />
    </Routes>
  );
}

export default App;