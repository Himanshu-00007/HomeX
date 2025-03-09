const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const reviewschema=new Schema({
    comments:String,
    rating:{
        type:Number,
        max:5,
        min:1,
    },
    createdat:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
});
module.exports=mongoose.model("review",reviewschema);