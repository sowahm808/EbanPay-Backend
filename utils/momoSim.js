const generateTransactionId = () => {
    return 'MOMO-' + Math.floor(100000000 + Math.random() * 900000000);
  };
  
  const simulateMoMoPayout = (phone, amount) => {
    console.log(`📲 Simulating MoMo payout of GH¢${amount} to ${phone}`);
    const transactionId = generateTransactionId();
  
    return {
      status: 'success',
      transactionId,
      message: `Payout of GH¢${amount} to ${phone} simulated`
    };
  };
  
  module.exports = { simulateMoMoPayout };
  