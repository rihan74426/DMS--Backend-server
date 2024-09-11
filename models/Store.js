const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: String,
    address: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
