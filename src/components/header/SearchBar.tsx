import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ 
  placeholder = "Buscar produtos, serviços...", 
  className = "",
  onSearch
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const MAX_SEARCH_LENGTH = 100;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length > MAX_SEARCH_LENGTH) {
      toast.error(`Busca muito longa. Use no máximo ${MAX_SEARCH_LENGTH} caracteres.`);
      return;
    }
    
    if (trimmedQuery) {
      // Lista de categorias de prestadores de serviços
      const serviceProviderCategories = [
        'pedreiro',
        'pintor',
        'eletricista',
        'encanador',
        'engenheiro',
        'arquiteto',
        'marceneiro'
      ];
      
      // Verificar se o termo de busca corresponde a alguma categoria de prestador
      const normalizedQuery = trimmedQuery.toLowerCase();
      const matchedCategory = serviceProviderCategories.find(
        category => category === normalizedQuery
      );
      
      if (matchedCategory) {
        // Redirecionar para página de prestadores com a categoria específica
        navigate(`/servicos/${matchedCategory}`);
      } else {
        // Navegar para página de resultados com o termo de busca
        navigate(`/busca?q=${encodeURIComponent(trimmedQuery)}`);
      }
      
      // Callback opcional
      if (onSearch) {
        onSearch(trimmedQuery);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <form onSubmit={handleSearch} className={`w-full min-w-0 max-w-md relative ${className}`}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={`w-full py-2 pl-4 pr-20 border rounded-full focus:outline-none text-sm transition-all bg-white/20 text-white placeholder-white/70 ${
          isFocused 
            ? 'border-white/40 shadow-md bg-white/30' 
            : 'border-white/20'
        }`}
      />
      
      {/* Botões do lado direito */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <button
          type="submit"
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;