import Project from '../models/project'
import Task from '../models/task'

export default {
  
  find: (callback) => {
    Project.find({}).select('-tasks').populate({ path: 'customer', select: 'name' }).exec(function(err, projects) {
      if (err) {
        callback(err, null)
        return
      }

      callback(null, projects)
    })
  },

  findById: (id, callback) => {
    Project.findById(id).populate([{ path: 'customer', select: 'name'}, { path: 'tasks' }]).exec(function(err, project) {
      if (err) {
        callback(err, null)
        return
      }

      callback(null, project)
    })
  },

  create: (params, callback) => {
    Project.create(params, function(err, project) {
      if (err) {
        callback(err, null)
        return
      }
      callback(null, project)
    })
  },

  findByIdAndUpdate: (id, params, callback) => {
    Project.findByIdAndUpdate(id, params, {new: true}, function(err, project) {
      if (err) {
        callback(err, null)
        return
      }

      callback(null, project)
    })
  },

  findByIdAndRemove: (id, callback) => {
    Project.findByIdAndRemove(id, function(err, project) {
      if (err) {
        callback(err, null)
        return
      }

      // Remove related tasks
      Task.remove({ _creator: id }, function(err, task) {
        if (err) {
          callback(err, null)
          return
        }
        callback(null, null)
      })
    })
  }
}