import axios from 'axios';

const clientId = process.env.HUBTEL_CLIENT_ID;
const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
const baseURL = process.env.HUBTEL_BASE_URL;

export async function sendMobileMoneyCashOut(payload) {
  const {
    recipientName,
    recipientMobileNumber,
    amount,
    clientReference,
    description,
  } = payload;

  try {
    const response = await axios.post(
      `${baseURL}/v1/merchantaccount/merchants/${clientId}/receive/mobilemoney`,
      {
        CustomerName: recipientName,
        CustomerMsisdn: recipientMobileNumber,
        Amount: amount,
        Channel: "mtn-gh", // change to "vodafone-gh", "tigo-gh" etc. if needed
        PrimaryCallbackUrl: "https://ebanpay-backend.onrender.com/callback/hubtel-callback",
        Description: description,
        ClientReference: clientReference,
      },
      {
        auth: {
          username: clientId,
          password: clientSecret,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Hubtel MoMo Error:', error.response?.data || error.message);
    throw new Error('Hubtel MoMo cashout failed');
  }
}
