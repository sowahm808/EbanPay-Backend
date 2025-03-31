// utils/momoAT.js
const africasTalking = require('../config/africastalking');

const mobileMoney = africasTalking.Money;

/**
 * Initiates a mobile money checkout using Africa's Talking.
 * @param {string} phoneNumber - The customer's phone number in international format (e.g., "+233...").
 * @param {number|string} amount - The amount to be charged (as a number or string).
 * @param {string} productName - The product name registered with Africa's Talking.
 * @param {Object} metadata - Additional metadata to be sent (optional).
 * @returns {Promise<Object>} - Returns the response from Africa's Talking.
 */
async function initiateMoMoCheckout(phoneNumber, amount, productName, metadata = {}) {
  try {
    const response = await mobileMoney.mobileCheckout({
      productName,
      phoneNumber,
      currencyCode: 'GHS',
      amount: amount.toString(),
      metadata
    });
    console.log("MoMo Checkout Response:", response);
    return response;
  } catch (error) {
    console.error("MoMo Checkout Error:", error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data.error || 'MoMo checkout failed' : error.message);
  }
}

module.exports = { initiateMoMoCheckout };
