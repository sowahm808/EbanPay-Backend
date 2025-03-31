function simulateSMS(phone, message) {
    console.log(`📨 SMS to ${phone}: ${message}`);
    return Promise.resolve({ success: true });

  }
  
  module.exports = { simulateSMS };
  