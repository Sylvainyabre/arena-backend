const slug = require("mongoose-slug-generator");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.plugin(slug)
const ForumPostSchema = new Schema({

  title:{
      type:String,
      required:true,
  },
   content:{
      type:Schema.Types.Mixed,
      required:true,
  },
  slug:{
      type:String,
      slug:"title",
      required:true
      
  },
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
   replies:[
        {type:mongoose.Schema.Types.ObjectId,
        ref:'ForumPost'}
    ],

});

module.exports = mongoose.model("ForumPost", ForumPostSchema)