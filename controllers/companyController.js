const Company = require("../models/Company");

// Add a new company
exports.addCompany = async (req, res) => {
  const { name, address, manager, number, email, notes } = req.body;
  try {
    const company = new Company({
      name,
      address,
      manager,
      number,
      email,
      notes,
    });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all companies
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Company by ID
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const company = await Company.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Company by ID
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByIdAndDelete(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
