// momo.js (Production version)
const axios = require('axios');
const crypto = require('crypto');

// Create an HMAC signature for the request (if required by the provider)
const createSignature = (data, secret) => {
  return crypto.createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('hex');
};

const initiateMoMoPayout = async (phone, amount) => {
  const payload = {
    phone,
    amount,
    // Additional fields per provider documentation
  };

  // Generate the signature if required
  const signature = createSignature(payload, process.env.MOMO_API_SECRET);

  try {
    const response = await axios.post(process.env.MOMO_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MOMO_API_KEY}`,
        'X-Signature': signature
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error("MoMo API Error:", error);
    throw new Error("Mobile money payout failed");
  }
};

module.exports = { initiateMoMoPayout };
