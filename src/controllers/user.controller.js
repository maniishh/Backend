import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User}  from "../models/user.model.js";

const registerUser =asyncHandler(async(req,res)=>{
    //get user data from frontend
    //validation -not empty
    //chack if user already exists:username or email
    //chack for images ,check for avatar
    //upload them to cloudinary,avatar
    //create user object -create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return response 
    const {fullName,email,username,password} = req.body;
    console.log("email:",email);
    
   if(//validation
    [fullName,email,username,password].some((field)=>field?.trim()==="")
    )  {
    throw new ApiError(400,"All fields are required")
    }
    const existedUser = await User.findOne({
        $or:[
            {email},
            {username}
        ]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists with this email or username")
    }

   })

    
export {registerUser}
