import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <button 
        type="button" 
        className={`custom-select-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', minWidth: '16px' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div className={`custom-select-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="custom-select-search">
          <input 
            type="text" 
            placeholder="Search number or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {filteredOptions.map((opt) => (
          <div 
            key={opt.value} 
            className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
              setSearchTerm('');
            }}
          >
            {opt.label}
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <div className="custom-select-option" style={{ opacity: 0.5 }}>
            No results found
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
