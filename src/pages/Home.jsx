import { Link } from "react-router-dom";
import { inspirationLocations, experienceCategories } from "../data/locations.js";

const Home = () => {
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Not sure where to go? Perfect.</p>
          <h1>Find your next stay on Airbnb</h1>
          <p className="hero-copy">
            Explore entire homes, unique experiences, and places to stay with people who welcome you.
          </p>
          <Link className="primary" to="/locations">Start searching</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Inspiration for your next trip</h2>
          <Link to="/locations">Show all</Link>
        </div>
        <div className="grid inspiration-grid">
          {inspirationLocations.map((item) => (
            <Link
              to={`/locations?location=${encodeURIComponent(item.name)}&q=${encodeURIComponent(item.name)}`}
              className="card destination-card"
              key={item.id}
            >
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>{item.distance}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Discover Airbnb Experiences</h2>
        <div className="grid experience-grid">
          {experienceCategories.map((item) => (
            <article className="card experience-card" key={item.id}>
              <img src={item.image} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="split">
          <div>
            <p className="eyebrow">Hosting</p>
            <h2>Open your door to hosting</h2>
            <p>Earn extra income and unlock new opportunities by sharing your space.</p>
            <Link className="primary ghost" to="/admin">Learn more</Link>
          </div>
          <div className="media">Become a host</div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>Support</h4>
            <p>Help Center</p>
            <p>AirCover</p>
            <p>Anti-discrimination</p>
          </div>
          <div>
            <h4>Hosting</h4>
            <p>Airbnb your home</p>
            <p>Hosting resources</p>
            <p>Community forum</p>
          </div>
          <div>
            <h4>Airbnb</h4>
            <p>Newsroom</p>
            <p>Careers</p>
            <p>Investors</p>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Airbnb Clone · Privacy · Terms · Sitemap</div>
      </footer>
    </div>
  );
};

export default Home;
