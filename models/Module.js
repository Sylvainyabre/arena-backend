const slug = require('mongoose-slug-generator');
const mongoose = require('mongoose'); 
const Schema = mongoose.Schema

mongoose.plugin(slug);

const ModuleSchema = new mongoose.Schema({
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:true
    },

    title:{
        type:String,
        required:true
    },

    overview:{
        type:String,
        required:true
    },
    
    body:{
        type:Schema.Types.Mixed,
        required:true
    },
    isPublished:{
      type:Boolean,
      require:true,
      default:false
    },
});

module.exports = mongoose.model('Module', ModuleSchema);