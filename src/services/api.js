import axios from 'axios';

export const fetchFeaturedProducts = async () => {
    const { data } = await axios.get('/api/products/featured');
    return data;
  };