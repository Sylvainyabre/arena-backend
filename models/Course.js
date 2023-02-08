const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageURL:{
      type:String,
      required:true,
      

    },
    class:{
      type:String,
      required:true

    },
    subject:{
      type:String,//will be one of math,physics,chemistry,computer science
      required:true

    },
    overview: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      require: true,
      default: false,
    },

    modules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module",
      },
    ],

    slug: { type: String, slug: "title" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
