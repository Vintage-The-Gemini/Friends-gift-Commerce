import React from 'react';

const ProductSort = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className='px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]'
    >
      <option value='newest'>Newest First</option>
      <option value='price_asc'>Price: Low to High</option>
      <option value='price_desc'>Price: High to Low</option>
      <option value='popular'>Most Popular</option>
    </select>
  );
};

export default ProductSort;
