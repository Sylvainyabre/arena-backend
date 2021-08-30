
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status:{
      type:String,
      required:true,
  },
  education:[{
      from:{
          type:Date,
          
      },
      to:{
          type:Date,
          
      },
      institution:{
          type:String,
          
      }
      ,
      degree:{
          type:String,
          
      }
      
  }],
  bio:{
      type:String,
      
  }

});

module.exports = mongoose.model("Profile", ProfileSchema)
