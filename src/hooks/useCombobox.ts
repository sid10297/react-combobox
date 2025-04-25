import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "./useDebounce";
import { Option } from "../components/Combobox/Combobox";

interface UseComboboxProps {
  options: Option[];
  onSelect?: (option: Option) => void;
  initialValue?: string;
  debounceTime?: number;
  isMulti?: boolean;
}

export const useCombobox = ({
  options,
  onSelect,
  initialValue = "",
  debounceTime = 300,
  isMulti = false,
}: UseComboboxProps) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const debouncedValue = useDebounce(inputValue, debounceTime);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!debouncedValue) {
      const filtered = isMulti
        ? options.filter(
            (option) => !selectedItems.some((item) => item.id === option.id)
          )
        : options;
      setFilteredOptions(filtered);
      return;
    }

    try {
      setIsLoading(true);
      const filtered = (
        isMulti
          ? options.filter(
              (option) => !selectedItems.some((item) => item.id === option.id)
            )
          : options
      ).filter((option) =>
        option.label.toLowerCase().includes(debouncedValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setSelectedId(null);
    } catch (err) {
      setError("Error filtering options");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedValue, options, selectedItems, isMulti]);

  const handleSelect = useCallback(
    (option: Option) => {
      if (isMulti) {
        setSelectedItems((prev) => [...prev, option]);
        setInputValue("");
        setIsOpen(true);
        inputRef.current?.focus();
      } else {
        setSelectedOption(option);
        setInputValue(option.label);
        setIsOpen(false);
      }
      setSelectedId(null);
      onSelect?.(option);
    },
    [onSelect, isMulti]
  );

  const removeSelectedItem = useCallback(
    (option: Option) => {
      if (isMulti) {
        setSelectedItems((prev) =>
          prev.filter((item) => item.id !== option.id)
        );
      } else {
        setSelectedId(null);
        setSelectedOption(null);
        setInputValue("");
        setTimeout(() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }, 0);
      }
    },
    [isMulti]
  );

  const clearInput = useCallback(() => {
    if (isMulti) {
      setInputValue("");
    } else {
      setSelectedOption(null);
      setInputValue("");
    }
    setSelectedId(null);
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
      setIsOpen(true);
    }, 0);
  }, [isMulti]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      let nextIndex: number;
      let nextOption: Option | undefined;
      let prevIndex: number;
      let prevOption: Option | undefined;
      let selectedOption: Option | undefined;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          nextIndex = filteredOptions.findIndex(
            (option) => option.id === selectedId
          );
          nextOption = filteredOptions[nextIndex + 1];
          if (nextOption) {
            setSelectedId(nextOption.id);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          prevIndex = filteredOptions.findIndex(
            (option) => option.id === selectedId
          );
          prevOption = filteredOptions[prevIndex - 1];
          if (prevOption) {
            setSelectedId(prevOption.id);
          }
          break;
        case "Enter":
          e.preventDefault();
          selectedOption = filteredOptions.find(
            (option) => option.id === selectedId
          );
          if (selectedOption) {
            handleSelect(selectedOption);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedId(null);
          break;
        case "Tab":
          setIsOpen(false);
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const char = e.key.toLowerCase();
            const matchingOption = filteredOptions.find((option) =>
              option.label.toLowerCase().startsWith(char)
            );
            if (matchingOption) {
              setSelectedId(matchingOption.id);
            }
          }
      }
    },
    [filteredOptions, handleSelect, isOpen, selectedId]
  );

  return {
    inputValue,
    setInputValue,
    filteredOptions,
    isOpen,
    setIsOpen,
    selectedId,
    setSelectedId,
    isLoading,
    error,
    inputRef,
    handleSelect,
    handleKeyDown,
    clearInput,
    selectedItems,
    removeSelectedItem,
    isMulti,
    selectedOption,
  };
};
