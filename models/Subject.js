const slug = require("mongoose-slug-generator");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.plugin(slug)
const SubjectSchema = new Schema({

  title:{
      type:String,
      required:true,
  },
  slug:{
      type:String,
      slug:"title",
      required:true
      
  },
   courses:[
        {type:mongoose.Schema.Types.ObjectId,
        ref:'Course'}
    ],

});

module.exports = mongoose.model("Subject", SubjectSchema)