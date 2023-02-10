import { Link } from "@tanstack/react-location";

export const Header = () => {
  return (
    <header>
      <nav>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Link to="/" style={{ margin: "0 1rem" }}>
            Home
          </Link>
          <Link to="/posts" style={{ margin: "0 1rem" }}>
            Posts
          </Link>
        </ul>
      </nav>
    </header>
  );
};
