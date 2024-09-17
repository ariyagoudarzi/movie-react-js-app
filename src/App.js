import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import popcorn from "./popcorn.png";
import { useMovies } from "./useMovies";

const KEY = `42ca181b`;

const average = (arr) =>
  arr?.reduce((acc, cur, i, arr) => acc + cur / arr?.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useState(() => {
    if (typeof window !== "undefined")
      return JSON.parse(localStorage.getItem("watched"));
  });
  // const [watched, setWatched] = useState([]);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleDeleteMovie(id) {
    setWatched((movies) =>
      movies.filter((movie) => (movie.id !== id ? movie : ""))
    );
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  const { movies, isLoaded, error } = useMovies(query);

  return (
    <>
      <NavBar movies={movies} query={query} setQuery={setQuery} />
      <Main>
        <Box>
          {!isLoaded && <Loader />}
          {isLoaded && !error && (
            <MovieList onSelectMoovie={handleSelectMovie} movies={movies} />
          )}
          {error && <ErrorMessage msg={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              onCloseMovie={handleCloseMovie}
              selectedId={selectedId}
              watched={watched}
              onWatched={setWatched}
            />
          ) : (
            <>
              <WatchedSummery watched={watched} />
              <WatchedMovieList
                watched={watched}
                key={selectedId}
                onDeleteMovie={handleDeleteMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return (
    <div className="loader">
      <lord-icon
        src="https://cdn.lordicon.com/ktsahwvc.json"
        trigger="loop"
        state="loop-transparency"
        colors="primary:#dee2e6"
        style={{ width: "70px", height: "70px" }}
      ></lord-icon>
    </div>
  );
}
function ErrorMessage({ msg }) {
  return (
    <p className="error">
      <i className="fa-solid fa-circle-exclamation"></i>
      {msg}
    </p>
  );
}

function NavBar({ movies, query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      function callBack(e) {
        if (document.activeElement === inputEl.current) return;

        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }

      document.addEventListener("keydown", callBack);
      return () => document.removeEventListener("keydown", callBack);
    },
    [setQuery]
  );

  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">
          <img src={popcorn} alt="USEPOPCORN" />
        </span>
        <h1>usePopcorn</h1>
      </div>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      <p className="num-results">
        Found <strong>{movies?.length}</strong> results
      </p>
    </nav>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <Button
        classNameStyle="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <i className="fa-solid fa-minus"></i>
        ) : (
          <i className="fa-solid fa-plus"></i>
        )}
      </Button>
      {isOpen && children}
    </div>
  );
}

// function WatchedBox() {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <Button
//         classNameStyle="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </Button>
//       {isOpen2 && (
//         <>
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies, onSelectMoovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectMoovie={onSelectMoovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMoovie }) {
  return (
    <li onClick={() => onSelectMoovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} Poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>
            <lord-icon
              src="https://cdn.lordicon.com/abfverha.json"
              trigger="hover"
              colors="primary:#dee2e6"
              style={{ width: "20px", height: "20px" }}
            ></lord-icon>
          </span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onWatched }) {
  const [movie, setMovie] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAddMovie(movie) {
    const newMovie = {
      id: movie.imdbID,
      imdbRating: +movie.imdbRating,
      userRating,
      runtime: +movie.Runtime.slice(0, -3),
      Poster: movie.Poster,
      Title: movie.Title,
    };

    onWatched((movies) =>
      movies.some((m) => m.id === newMovie.id)
        ? movies.map((m) =>
            m.id === newMovie.id ? { ...m, userRating: newMovie.userRating } : m
          )
        : [...movies, newMovie]
    );

    setUserRating(0);
    onCloseMovie(true);
  }

  useEffect(
    function () {
      async function getMovieDetail() {
        try {
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );

          if (!res.ok) {
            throw new Error(
              "Something went wrong with fetching movie's details :("
            );
          }

          const data = await res.json();
          setMovie(data);
        } catch (err) {
          console.log(err.message);
          setError(err.message);
        } finally {
          setIsLoaded(true);
        }
      }
      getMovieDetail();
    },
    [selectedId, title]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = title;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener("keydown", callBack);

      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onCloseMovie]
  );

  return (
    <div className="details">
      <button className="btn-back" onClick={onCloseMovie}>
        <lord-icon
          src="https://cdn.lordicon.com/whtfgdfm.json"
          trigger="hover"
          colors="primary:#121212"
          state="hover-ternd-flat-6"
          style={{ width: "30px", height: "30px", transform: "rotate(180deg)" }}
        ></lord-icon>
      </button>
      {!isLoaded && <Loader />}
      {isLoaded && !error && (
        <>
          <header>
            <img src={poster} alt={`poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>
                <i
                  className="fa-solid fa-star"
                  style={{ color: "#fcc419" }}
                ></i>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating
                maxRating={10}
                size={2.1}
                onSetMovieStar={setUserRating}
                key={imdbRating}
              />
              {userRating ? (
                <button
                  className="btn-add"
                  onClick={() => handleAddMovie(movie)}
                >
                  Add movie
                </button>
              ) : (
                ""
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by {director}</p>
            <p>Genre: {genre}</p>
            <p className="download-movie">
              <i className="fa-solid fa-download"></i>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://avamovie.shop/search/?s=${selectedId}`}
              >
                Download the movie
              </a>
            </p>
          </section>
        </>
      )}
      {error && <ErrorMessage msg={error} />}
    </div>
  );
}

function WatchedSummery({ watched }) {
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched?.map((movie) => movie.userRating));
  const avgRuntime = average(watched?.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched?.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteMovie }) {
  return (
    <ul className="list">
      {watched?.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={Date.now().toString(10) + Math.random().toString(10)}
          onDeleteMovie={onDeleteMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button className="btn-delete" onClick={() => onDeleteMovie(movie.id)}>
          <lord-icon
            src="https://cdn.lordicon.com/skkahier.json"
            trigger="hover"
            colors="primary:#ffffff"
            style={{ width: "22px", height: "22px" }}
          ></lord-icon>
        </button>
      </div>
    </li>
  );
}

function Button({ classNameStyle, onClick, children }) {
  return (
    <button className={classNameStyle} onClick={onClick}>
      {children}
    </button>
  );
}
