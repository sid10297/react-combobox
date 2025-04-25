import React from "react";
import { useCombobox } from "../../hooks/useCombobox";
import styles from "./Combobox.module.css";

export interface Option {
  id: string;
  label: string;
}

export interface ComboboxProps {
  options: Option[];
  placeholder?: string;
  onSelect?: (option: Option) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  debounceTime?: number;
  isMulti?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  options,
  placeholder = "Select an option",
  onSelect,
  label = "",
  id = "combobox",
  disabled = false,
  error: externalError,
  loading: externalLoading,
  debounceTime = 300,
  isMulti = false,
}) => {
  const {
    inputValue,
    setInputValue,
    filteredOptions,
    isOpen,
    setIsOpen,
    selectedId,
    isLoading,
    error: internalError,
    inputRef,
    handleSelect,
    handleKeyDown,
    clearInput,
    selectedItems,
    removeSelectedItem,
    selectedOption,
    setSelectedId,
  } = useCombobox({
    options,
    onSelect,
    debounceTime,
    isMulti,
  });

  const error = externalError || internalError;
  const loading = externalLoading || isLoading;
  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      if (isMulti) {
        setInputValue("");
      }
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      if (!isMulti && selectedOption) {
        setInputValue(selectedOption.label);
      } else if (isMulti) {
        setInputValue("");
      }
    }, 200);
  };

  const handleOptionMouseDown = (e: React.MouseEvent, option: Option) => {
    e.preventDefault();
    handleSelect(option);
  };

  const getInputWidth = (value: string) => {
    if (!value) return "60px";
    return `${Math.max(60, value.length * 8 + 16)}px`;
  };

  return (
    <div className={styles.container}>
      <label id={labelId} htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-activedescendant={
          selectedId ? `${id}-option-${selectedId}` : undefined
        }
        aria-disabled={disabled}
        aria-invalid={!!error}
        className={`${styles.wrapper} ${disabled ? styles.disabled : ""} ${
          error ? styles.error : ""
        }`}
      >
        <div className={styles.inputWrapper}>
          {isMulti && selectedItems.length > 0 && (
            <div className={styles.selectedItems}>
              {selectedItems.map((item) => (
                <div key={item.id} className={styles.selectedItem}>
                  {item.label}
                  <button
                    type="button"
                    className={styles.removeItem}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => removeSelectedItem(item)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={
              isMulti && selectedItems.length > 0
                ? "Type to search..."
                : placeholder
            }
            disabled={disabled}
            autoComplete="off"
            style={{ width: getInputWidth(inputValue) }}
            className={`${styles.input} ${isMulti ? styles.multiInput : ""}`}
          />
          {((isMulti && inputValue) ||
            (!isMulti && (inputValue || selectedOption))) &&
            !disabled && (
              <button
                type="button"
                className={styles.clear}
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearInput}
              >
                ×
              </button>
            )}
          {loading && <div className={styles.spinner} />}
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            className={styles.dropdown}
            tabIndex={-1}
            onKeyDown={(e: React.KeyboardEvent<HTMLElement>) =>
              handleKeyDown(e)
            }
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.id}
                  id={`${id}-option-${option.id}`}
                  role="option"
                  aria-selected={
                    option.id === selectedId ||
                    (!isMulti && option.id === selectedOption?.id)
                  }
                  className={`${styles.option} ${
                    option.id === selectedId ||
                    (!isMulti && option.id === selectedOption?.id)
                      ? styles.selected
                      : ""
                  }`}
                  onMouseDown={(e) => handleOptionMouseDown(e, option)}
                  onMouseEnter={() => setSelectedId(option.id)}
                  onFocus={() => setSelectedId(option.id)}
                >
                  <span className={styles.optionContent}>
                    {option.label}
                    {(option.id === selectedId ||
                      (!isMulti && option.id === selectedOption?.id)) && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </span>
                </li>
              ))
            ) : (
              <li className={styles.noResults}>
                {loading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className={styles.noResultsContent}>
                    <span className={styles.noResultsIcon}>🔍</span>
                    <span>No results found</span>
                  </div>
                )}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Combobox;
