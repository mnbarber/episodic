import ShowCard from './ShowCard';

function ShowShelf({ title, shows, loading }) {
    if (!loading && (!shows || shows.length === 0)) {
        return null;
    }

    return (
        <section className="show-shelf-section">
            <h2>{title}</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="show-shelf">
                    {shows.map((show) => (
                        <ShowCard key={show.id} show={show} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default ShowShelf;
