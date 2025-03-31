const axios = require('axios');

/**
 * performMoMoPayout - Calls a real MoMo API endpoint.
 * @param {string} phone - Recipient's phone number in E.164 format.
 * @param {number} amount - The payout amount.
 * @returns {Promise<Object>} - Returns API response data.
 */
async function performMoMoPayout(phone, amount) {
  try {
    // Example payload; modify according to your provider's specification.
    const payload = {
      phoneNumber: phone,
      amount: amount,
      currency: 'GHS',
      // other fields, e.g., transactionReference, callbackUrl, etc.
    };

    // The endpoint and headers should be provided by your MoMo provider.
    const response = await axios.post(
      process.env.MOMO_API_URL, // e.g., 'https://api.mtn.com/payout'
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.MOMO_API_KEY}`,
          'Content-Type': 'application/json',
          // Additional headers as required by the provider
        },
        timeout: 10000 // optional timeout in milliseconds
      }
    );

    console.log(`📲 Payout successful: ${response.data.transactionId}`);
    return {
      status: 'success',
      transactionId: response.data.transactionId,
      message: response.data.message || `Payout of GH¢${amount} to ${phone} processed successfully.`
    };
  } catch (error) {
    // Log detailed error info for debugging.
    console.error('MoMo payout error:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.error || 'MoMo payout failed' : error.message);
  }
}

module.exports = { performMoMoPayout };
