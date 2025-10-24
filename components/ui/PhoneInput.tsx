import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Country, countries } from '../../data/countries';

interface PhoneInputProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  phoneNumber: string;
  onPhoneNumberChange: (number: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  selectedCountry,
  onCountryChange,
  phoneNumber,
  onPhoneNumberChange,
  disabled,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) {
      return countries;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return countries.filter(country =>
      country.name.toLowerCase().includes(lowerCaseSearch) ||
      country.dial_code.includes(searchTerm) ||
      country.code.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative flex items-center w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 transition-colors focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center pl-4 pr-2 py-3 h-full bg-transparent"
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="text-xl mr-1">{selectedCountry.flag}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute top-full mt-1 w-72 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto" role="listbox">
              {filteredCountries.map(country => (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="option"
                    aria-selected={country.code === selectedCountry.code}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="flex-grow">{country.name}</span>
                    <span className="text-gray-500">{country.dial_code}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="h-6 w-px bg-gray-300" />

      <input
        id="phone"
        type="tel"
        value={phoneNumber}
        onChange={(e) => onPhoneNumberChange(e.target.value.replace(/[^0-9]/g, ''))}
        className="block w-full bg-transparent py-3 px-4 focus:outline-none"
        placeholder={placeholder}
        required
        disabled={disabled}
      />
    </div>
  );
};

export default PhoneInput;