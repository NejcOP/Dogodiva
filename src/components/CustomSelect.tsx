import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type CustomSelectProps = {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
};

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Izberi...',
  label,
  icon,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="custom-select-wrapper">
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {icon && <span className="custom-select-icon">{icon}</span>}
        <span className="custom-select-label-top">{label}</span>
        <span className="custom-select-value">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`custom-select-arrow ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
