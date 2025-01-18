import './SearchComponent.css';

interface SearchComponentProps {
  searchQuery: string;
  searchWalletQuery: string;
  onSearchChange: (query: string) => void;
  onSearchWalletChange: (query: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  searchQuery,
  searchWalletQuery,
  onSearchChange,
  onSearchWalletChange,
}) => {
  return (
    <div className="search">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by employee name"
        className="search__input"
      />
      <input
        type="text"
        value={searchWalletQuery}
        onChange={(e) => onSearchWalletChange(e.target.value)}
        placeholder="Search by wallet address"
        className="search__input"
      />
    </div>
  );
};

export default SearchComponent;
