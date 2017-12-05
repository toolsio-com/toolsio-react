import Sale from '../models/sale'
import Item from '../models/item'

export default {
  
  find: (callback) => {
     Sale.find({}).select('-items').populate({ path: 'customer', select: 'name' }).exec(function(err, sales) {
      if (err) {
        callback(err, null)
        return
      }

      callback(null, sales)
    })
  },

  findById: (id, callback) => {
    Sale.findById(id).populate([{ path: 'customer', select: '_id'}, { path: 'customer', select: 'name'}, { path: 'items' }]).exec(function(err, sale) {
      if (err) {
        callback(err, null)
        return
      }

      callback(null, sale)
    })
  },

  create: (params, callback) => {
    Sale.create(params, function(err, sale) {
      if (err) {
        callback(err, null)
        return
      }
      
      callback(null, sale)
    })
  },

  findByIdAndUpdate: (id, params, callback) => {
    Sale.findByIdAndUpdate(id, params, {new: true}, function(err, sale) {
      if (err) {
        callback(err, null)
        return
      }
    
      callback(null, sale)
    })

  },

  findByIdAndRemove: (id, callback) => {
    Sale.findByIdAndRemove(id, function(err, r) {
      if (err) {
        callback(err, {})
        return
      }

      // Remove related items
      Item.remove({ _creator: id }, function(err, item) {
        if (err) {
          callback(err, null)
          return
        }
        callback(null, null)
      })

       // Remove relateded invoice
      Invoice.remove({ project: id }, function(err, invoice) {
        if (err) {
          callback(err, null)
          return
        }
        callback(null, null)
      })

    })
  }
}