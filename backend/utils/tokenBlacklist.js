const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

const BlacklistedToken = mongoose.models.BlacklistedToken || mongoose.model('BlacklistedToken', blacklistSchema);

module.exports = {
  add: async (token, exp) => {
    const expiresAt = new Date(Date.now() + exp * 1000);
    await BlacklistedToken.create({ token, expiresAt });
  },
  has: async (token) => {
    const found = await BlacklistedToken.findOne({ token, expiresAt: { $gt: new Date() } });
    return !!found;
  },
};
