import jwt from "jsonwebtoken";
import User from "../models/User.js"

// const response = await fetch(`http://localhost:3000/api/books`,{
//     method: "POST",
//     body : JSON.stringify({
//         title,
//         caption
//     }),
//     headers : {Authorization : `Bearer ${token}`}
// })

const protectedRoute = async (req,res,next) => {
    try{
        // get token
        const token = req.header("Authorization").replace("Bearer","");
        
        if(!token) return res.status(401).json({
            message : "No authentication token, access Denied"
        })

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.stats(401).json({
            message: "token is not valid"
        })

        req.user = user;
        next();
    }catch(e){
        console.log("error in the middleware Protected Route",e)
        res.status(401).json({
            message:"Error in the token"
        })
    }
}

export default protectedRoute;