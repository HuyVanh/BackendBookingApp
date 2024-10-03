const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    search_query: { type: String, required: true },
    search_date: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
