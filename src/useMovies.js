import { useEffect, useState } from "react";

const KEY = `42ca181b`;
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoaded, setisLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();
      //   setWatched(tempWatchedData);
      async function fetchMovie() {
        try {
          setError("");

          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) {
            throw new Error("Something went wrong with fetching movie :(");
          }

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error("Movie not found.");
          }

          setMovies(data?.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
            console.log(err.message);
          }
        } finally {
          setisLoaded(true);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovie();

      return function () {
        controller.abort();
      };
    },
    [query, movies.length]
  );

  return { movies, isLoaded, error };
}
