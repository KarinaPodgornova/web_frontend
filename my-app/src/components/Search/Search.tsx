// components/Search/Search.tsx
import './Search.css';

interface SearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

export default function Search({ query, onQueryChange, onSearch }: SearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="search-container">
      <input 
        type="text" 
        className="search-field" 
        placeholder="Поиск по названию..." 
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <button type="submit" className="search-button">
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
}