import axios from "axios";

/**
 * Paystack API Configuration
 * Using getters to ensure environment variables are loaded after dotenv initialization
 */
export const PAYSTACK_CONFIG = {
  get apiBaseUrl() {
    return "https://api.paystack.co";
  },
  get secretKey() {
    return process.env.PAYSTACK_SECRET_KEY || "";
  },
  get publicKey() {
    return process.env.PAYSTACK_PUBLIC_KEY || "";
  },
  get callbackUrl() {
    return process.env.CLIENT_URL || "";
  },
};

/**
 * Validate Paystack configuration
 */
export const validatePaystackConfig = (): {
  isValid: boolean;
  error?: string;
} => {
  if (!PAYSTACK_CONFIG.secretKey) {
    return { isValid: false, error: "PAYSTACK_SECRET_KEY is not configured" };
  }
  if (!PAYSTACK_CONFIG.callbackUrl) {
    return { isValid: false, error: "CLIENT_URL is not configured" };
  }
  return { isValid: true };
};

/**
 * Initialize a Paystack payment transaction
 */
export const initializePaystackTransaction = async (params: {
  amount: number; // in kobo (₦1 = 100 kobo)
  email: string;
  reference: string;
  callbackUrl: string;
}) => {
  const { secretKey, apiBaseUrl } = PAYSTACK_CONFIG;

  const response = await axios.post(
    `${apiBaseUrl}/transaction/initialize`,
    {
      amount: params.amount,
      email: params.email,
      reference: params.reference,
      callback_url: params.callbackUrl,
    },
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  return {
    authorizationUrl: response.data?.data?.authorization_url,
    accessCode: response.data?.data?.access_code,
    reference: response.data?.data?.reference,
  };
};

/**
 * Verify a Paystack payment transaction
 */
export const verifyPaystackTransaction = async (reference: string) => {
  const { secretKey, apiBaseUrl } = PAYSTACK_CONFIG;

  const response = await axios.get(
    `${apiBaseUrl}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  return {
    status: response.data?.data?.status,
    amount: response.data?.data?.amount,
    reference: response.data?.data?.reference,
    paidAt: response.data?.data?.paid_at,
    currency: response.data?.data?.currency,
  };
};

/**
 * Helper to convert Naira to Kobo
 */
export const nairaToKobo = (amountInNaira: number): number => {
  return Math.round(amountInNaira * 100);
};

/**
 * Helper to convert Kobo to Naira
 */
export const koboToNaira = (amountInKobo: number): number => {
  return amountInKobo / 100;
};
