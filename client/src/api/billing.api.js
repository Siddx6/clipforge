import api from '../utils/axiosInstance';

export const getPlans = async () => {
  const { data } = await api.get('/billing/plans');
  return data;
};

export const createOrder = async (type, item) => {
  const { data } = await api.post('/billing/create-order', { type, item });
  return data;
};

export const verifyPayment = async (paymentData) => {
  const { data } = await api.post('/billing/verify', paymentData);
  return data;
};

export const getBillingHistory = async () => {
  const { data } = await api.get('/billing/history');
  return data;
};

export const initiatePayment = (orderData, user, onSuccess, onFailure) => {
  const options = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'ClipForge',
    description: orderData.label,
    order_id: orderData.orderId,
    handler: async (response) => {
      try {
        onSuccess(response);
      } catch (error) {
        onFailure(error);
      }
    },
    prefill: {
      name: user?.name || '',
      email: user?.email || '',
    },
    theme: {
      color: '#7c5cfc'
    },
    modal: {
      ondismiss: () => onFailure('Payment cancelled')
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};