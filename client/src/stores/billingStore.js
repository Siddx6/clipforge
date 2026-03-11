import { create } from 'zustand';
import { createOrder, verifyPayment, getBillingHistory, initiatePayment } from '../api/billing.api';

// eslint-disable-next-line no-unused-vars
const useBillingStore = create((set, _get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchHistory: async () => {
    try {
      const data = await getBillingHistory();
      set({ transactions: data });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch history' });
    }
  },

  purchasePlan: async (plan, user, onSuccess, onFailure) => {
    set({ loading: true, error: null });
    try {
      const orderData = await createOrder('plan', plan);
      initiatePayment(orderData, user, async (response) => {
        const result = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          type: 'plan',
          item: plan
        });
        set({ loading: false });
        onSuccess(result);
      }, (error) => {
        set({ loading: false, error: error });
        onFailure(error);
      });
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Payment failed' });
      onFailure(error);
    }
  },

  purchaseTokens: async (pack, user, onSuccess, onFailure) => {
    set({ loading: true, error: null });
    try {
      const orderData = await createOrder('tokens', pack);
      initiatePayment(orderData, user, async (response) => {
        const result = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          type: 'tokens',
          item: pack
        });
        set({ loading: false });
        onSuccess(result);
      }, (error) => {
        set({ loading: false, error: error });
        onFailure(error);
      });
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Payment failed' });
      onFailure(error);
    }
  }
}));

export default useBillingStore;