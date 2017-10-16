import mongoose from 'mongoose'

// User Schema 
let saleSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required."] },
  deadline: { type: Date, required: [true, "Deadline is required."] },  
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "customer", required: [true, "Customer is required."] },
  status: { type: String, required: [true, "Status is required."] },
  description: { type: String, default: '' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "item" }],
  total: { type: Number, default: 0 },

  createdAt: Date,
  updatedAt: Date
})

saleSchema.pre('validate', function (next) {
  this.status = "new"
  next()
}) 

saleSchema.methods.addItems = function(items) {
  this.items.push(items)
}

let Sale = module.exports = mongoose.model('sale', saleSchema)
