const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  manager: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true },
  notes: { type: String },
});

const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
