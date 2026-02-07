import React, { useState } from 'react'

const FilterPanel = ({
  onApplyFilters,
}: {
  onApplyFilters: (filters: any) => void;
}) => {
  const [priceRange, setPriceRange] = useState([0, 6000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<{
       [key: string]: boolean;
     }>({
       price: false,
       category: false,
       tags: false,
       sizes: false,
       colors: false,
     });

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = Number(event.target.value);
    setPriceRange((prev) => [prev[0], newPrice]);
  };

  const toggleSelection = (
    item: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      priceRange,
      selectedCategory,
      selectedTags,
      selectedSizes,
      selectedColors,
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full bg-white p-6 border border-border rounded-xl shadow-sm sticky top-24">
      <h2 className="text-2xl font-serif mb-6 text-primary border-b pb-4">Filters</h2>

      {/* Price Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("price")}>
          <h3 className="font-medium text-foreground">Price</h3>
          <span className="text-primary text-xl">
            {expandedSections.price ? "−" : "+"}
          </span>
        </div>
        {expandedSections.price && (
          <div className="flex flex-col items-center gap-4 mt-4 animate-fade-in">
            <input
              type="range"
              min={0}
              max={20000}
              step={500}
              value={priceRange[1]}
              onChange={handlePriceChange}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex w-full justify-between text-sm font-medium text-muted-foreground">
              <span>₹0</span>
              <span className="text-primary">₹{priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-border my-4" />

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("category")}>
          <h3 className="font-medium text-foreground">Category</h3>
          <span className="text-primary text-xl">
            {expandedSections.category ? "−" : "+"}
          </span>
        </div>
        {expandedSections.category && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full mt-3 p-2 border border-input rounded-md bg-background focus:ring-1 focus:ring-primary outline-none text-sm"
          >
            <option value="">All Categories</option>
            <option value="saree">Saree</option>
            <option value="lehenga">Lehenga</option>
            <option value="suits">Suits</option>
            <option value="kurti">Kurti</option>
            <option value="dupatta">Dupatta</option>
            <option value="gowns">Gowns</option>
          </select>
        )}
      </div>
      
      <div className="h-px bg-border my-4" />

      {/* Tags Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("tags")}>
          <h3 className="font-medium text-foreground">Collections</h3>
          <span className="text-primary text-xl">
            {expandedSections.tags ? "−" : "+"}
          </span>
        </div>
        {expandedSections.tags && (
          <div className="flex flex-col gap-2 mt-3 animate-fade-in">
            {[
              "Banarsi Saree",
              "Ghatchola Saree",
              "Georgette",
              "Dola Silk",
              "Kota Doirya",
              "Art Silk",
            ].map((tag) => (
              <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleSelection(tag, setSelectedTags)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">{tag}</span>
              </label>
            ))}
          </div>
        )}
      </div>
     
      <div className="h-px bg-border my-4" />

      {/* Sizes Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("sizes")}>
          <h3 className="font-medium text-foreground">Sizes</h3>
          <span className="text-primary text-xl">
            {expandedSections.sizes ? "−" : "+"}
          </span>
        </div>
        {expandedSections.sizes && (
          <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
            {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((size) => (
              <label 
                key={size} 
                className={`
                  cursor-pointer px-3 py-1 rounded-md text-sm border transition-all
                  ${selectedSizes.includes(size) 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary"}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSelection(size, setSelectedSizes)}
                  className="hidden"
                />
                {size}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border my-4" />

      {/* Colors Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("colors")}>
          <h3 className="font-medium text-foreground">Colors</h3>
          <span className="text-primary text-xl">
            {expandedSections.colors ? "−" : "+"}
          </span>
        </div>
        {expandedSections.colors && (
          <div className="flex flex-wrap gap-3 mt-3 animate-fade-in">
            {[
              "Multicolor", "Black", "Red", "Blue", "Green", "Yellow", 
              "Orange", "Purple", "Pink", "White", "Grey", "Brown"
            ].map((color) => (
              <label key={color} className="cursor-pointer relative group">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => toggleSelection(color, setSelectedColors)}
                  className="hidden"
                />
                <div 
                  className={`w-8 h-8 rounded-full border shadow-sm transition-transform ${selectedColors.includes(color) ? "ring-2 ring-offset-2 ring-primary scale-110" : "group-hover:scale-105"}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleApplyFilters}
        className="w-full bg-primary text-white py-3 rounded-lg shadow-md hover:bg-primary/90 transition-all font-medium tracking-wide mt-4"
      >
        APPLY FILTERS
      </button>
    </div>
  );
};

export default FilterPanel