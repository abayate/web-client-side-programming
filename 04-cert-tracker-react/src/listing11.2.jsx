// Listing 11.2 from chapter11.zip (Tasks 5-8)
// Renamed App -> App2, exported everything, commented out the last line

const App2 = (props) => {
    const movieData = [
        { id: 17, title: "American Beauty", year: 1999 },
        { id: 651, title: "Sense and Sensibility", year: 1995 },
        { id: 1144, title: "Casablanca", year: 1942 }
    ];
    return (
        <main className="movie-section">
            <Title label="Iterating a Props Array" />
            <MovieList movies={movieData} />
        </main>
    );
}

const MovieList = (props) => {
    return (
        <ul>
            {props.movies.map(m => <MovieListItem movie={m} key={m.id} />)}
        </ul>
    );
}

const MovieListItem = (props) => {
    return <li>{props.movie.title}</li>;
}

const Title = function (props) {
    return <h2>{props.label}</h2>;
};

// ReactDOM.render(<App />, document.querySelector('#react-container'));

export { App2, MovieList, MovieListItem, Title };
