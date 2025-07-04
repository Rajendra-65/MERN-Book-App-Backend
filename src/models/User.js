import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userSchema = new mongoose.Schema ({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    profileImage : {
        type : String,
    }
},{
    timestamps: true
})

userSchema.pre("save",async function(next){
    const salt =  10;
    const hashed = await bcrypt.hash(this.password,salt);
    this.password = hashed
    next()
})

userSchema.pre("save",function(next){
    if(!this.profileImage){
        this.profileImage = this.username.charAt(0)
    }
    next()
})

userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword,this.password)
}

const User = mongoose.model("user",userSchema)

export default User;