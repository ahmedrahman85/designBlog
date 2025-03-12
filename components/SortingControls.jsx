'use client'

import { useRouter } from "next/navigation";

export default function SortingControls({ currentSort }) {
  const router = useRouter();
  
  // Handle sort change
  const handleSortChange = (event) => {
    const newSortOrder = event.target.value;
    router.push(`/posts?sort=${newSortOrder}`);
  };
  
  return (
    <div className="sortingControls">
      <label htmlFor="sortOrder" className="sortLabel">Sort by:</label>
      <select 
        id="sortOrder" 
        value={currentSort} 
        onChange={handleSortChange}
        className="formSelect sortSelect"
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
    </div>
  );
}