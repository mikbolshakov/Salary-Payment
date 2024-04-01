import { useState } from 'react';
import './SearchEmployee.css';

const SearchEmployee = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchWalletQuery, setSearchWalletQuery] = useState('');

  return (
    <>
      <div className="header-search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by employee name"
          className="header-search-input"
        />
      </div>

      <div className="header-search-container">
        <input
          type="text"
          value={searchWalletQuery}
          onChange={(e) => setSearchWalletQuery(e.target.value)}
          placeholder="Search by wallets"
          className="header-search-input"
        />
      </div>
    </>
  );
};

export default SearchEmployee;
