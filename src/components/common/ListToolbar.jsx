import { useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid } from 'lucide-react';
import './ListToolbar.css';

export default function ListToolbar({
  onSearch,
  searchPlaceholder = 'Search...',
  filters = [],
  sortOptions = [],
  groupOptions = [],
  onFilterChange,
  onSortChange,
  onGroupChange,
  activeFilter,
  activeSort,
  activeGroup,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="list-toolbar">
      <div className="toolbar-search">
        <Search size={16} className="toolbar-search-icon" />
        <input
          type="text"
          className="toolbar-search-input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearch}
        />
      </div>

      <div className="toolbar-controls">
        {groupOptions.length > 0 && (
          <div className="toolbar-dropdown">
            <button className="toolbar-btn" onClick={() => {}}>
              <LayoutGrid size={14} />
              <span>Group by</span>
            </button>
            <div className="toolbar-dropdown-menu">
              {groupOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`toolbar-dropdown-item ${activeGroup === opt.value ? 'active' : ''}`}
                  onClick={() => onGroupChange?.(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {filters.length > 0 && (
          <div className="toolbar-dropdown">
            <button
              className={`toolbar-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
            </button>
            <div className={`toolbar-dropdown-menu ${showFilters ? 'show' : ''}`}>
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  className={`toolbar-dropdown-item ${activeFilter === filter.value ? 'active' : ''}`}
                  onClick={() => { onFilterChange?.(filter.value); setShowFilters(false); }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {sortOptions.length > 0 && (
          <div className="toolbar-dropdown">
            <button className="toolbar-btn">
              <ArrowUpDown size={14} />
              <span>Sort by</span>
            </button>
            <div className="toolbar-dropdown-menu">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`toolbar-dropdown-item ${activeSort === opt.value ? 'active' : ''}`}
                  onClick={() => onSortChange?.(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
