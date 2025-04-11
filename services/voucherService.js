const Voucher = require('../models/Voucher');

async function getVouchersAvailableToUser(userIdOrPhone) {
  return await Voucher.find({
    recipientPhone: userIdOrPhone,  // assuming recipient is identified by phone
    isRedeemed: false
  }).exec(); // optional, for a true promise
}

module.exports = { getVouchersAvailableToUser };
