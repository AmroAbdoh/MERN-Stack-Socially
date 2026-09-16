import "./search.css"

function SearchField() {
  return (
    <div className="navbar__search-wrap">
      <svg
        viewBox="0 0 24 24"
        className="navbar__search-icon"
        aria-hidden="true"
      >
        <path d="M10.5 3a7.5 7.5 0 015.94 12.44l4.36 4.36 1.41-1.41-4.36-4.36A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 104.12 9.42A5.5 5.5 0 0010.5 5z" />
      </svg>
      <input
        type="search"
        name="search"
        // value={searchTerm}
        // onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search"
        className="navbar__search-input"
      />

      {/* {searchTerm.trim() && filteredProducts.length > 0 && (
            <div className="navbar__search-dropdown">
              {filteredProducts.slice(0, 6).map((product) => (
                <button
                  key={product._id}
                  type="button"
                  className="navbar__search-result"
                  onClick={() => goToProduct(product._id)}
                >
                  <span>{product.name}</span>
                  <small>${product.price}</small>
                </button>
              ))}
            </div>
          )} */}
    </div>
  );
}

export default SearchField;
