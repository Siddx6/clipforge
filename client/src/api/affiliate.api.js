import api from '../utils/axiosInstance';

export const getAffiliateStats = async () => {
  const { data } = await api.get('/affiliate/stats');
  return data;
};

export const trackAffiliateClick = async (affiliateCode) => {
  const { data } = await api.post(`/affiliate/track/${affiliateCode}`);
  return data;
};