// models/GroupApproval.js
const mongoose = require("mongoose");

const GroupApprovalSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true },
  isEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model("GroupApproval", GroupApprovalSchema);