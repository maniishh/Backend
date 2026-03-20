import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User}  from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const avatarLocalPath = req.files?.avatar[0]?.path;//multer saves the uploaded file in req.files object,avatar is the field name we used in multer middleware,0 is the index of the file in case of multiple files with same field name,path is the local path of the uploaded file
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar is required")//if avatar is not uploaded,throw an error with status code 400 and message "Avatar is required"
        }
        if(!coverImageLocalPath){
            throw new ApiError(400,"Cover image is required")
        }
     
        const avatar = await uploadOnCloudinary(avatarLocalPath,"avatars")//uploadOnCloudinary is a utility function that uploads the file at the given local path to cloudinary and returns the url of the uploaded file,avatars is the folder name in cloudinary where the file will be stored
        const coverImage = await uploadOnCloudinary(coverImageLocalPath,"coverImages")
        if(!avatar || !coverImage){//if the upload fails,throw an error with status code 500 and message "Error uploading images"
            throw new ApiError(500,"Error uploading images")
        }
     
    const user = await User.create({
        fullname:fullName,
        avatar:avatar.url,
        coverImage:coverImage.url,
        email:email,
        username:username,
        password:password
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Error creating user")
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
})
    
export {registerUser}
