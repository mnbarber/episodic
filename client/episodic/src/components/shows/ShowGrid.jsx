import ShowCard from './ShowCard';

function ShowGrid({ shows }) {
    if (!shows || shows.length === 0) {
        return <p>No shows to display.</p>;
    }

    return (
        <div className="show-grid">
            {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
            ))}
        </div>
    );
}

export default ShowGrid;
