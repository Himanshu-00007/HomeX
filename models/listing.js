const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const listingschema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        default:"https://images.unsplash.com/photo-1735506266367-d6941df3efdc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        type:String,
        set:(v)=>v===""? "https://images.unsplash.com/photo-1735506266367-d6941df3efdc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      
});
const listing=mongoose.model("listing",listingschema);
module.exports=listing;