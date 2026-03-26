import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User}  from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAcessTokenAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Error generating tokens")
    }
}

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
    console.log("body:",req.body);
    
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
    //console.log(req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;//multer saves the uploaded file in req.files object,avatar is the field name we used in multer middleware,0 is the index of the file in case of multiple files with same field name,path is the local path of the uploaded file
    //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar is required")//if avatar is not uploaded,throw an error with status code 400 and message "Avatar is required"
        }
        // if(!coverImageLocalPath){
        //     throw new ApiError(400,"Cover image is required")
        // }
     
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
        username:username.toLowerCase(),
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
const loginUser=asyncHandler(async(req,res)=>{
    //req  body -email,username,password
    //find user by email or username
    //password comparison
    //generate refresh token and access token
    //send cookies and response

    const {email,username,password}= req.body;
     if(!username || !email){
        throw new ApiError(400,"Email or username is required")
     }

     const user=await User.findOne({
        $or:[
            {email},
            {username}]
     })
if(!user){  
  throw new ApiError(404,"User not found with this email or username")
}
const isPasswordValid=await user.isPasswordCorrect(password)
if(!isPasswordValid){
    throw new ApiError(401,"Invalid password")  }

const {accessToken,refreshToken}=await generateAcessTokenAndRefreshToken(user._id)
const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

const options={
    httpOnly:true,
    secure:true
}
return res.status(200)
.cookie("refreshToken",refreshToken,options)
.cookie("accessToken",accessToken,options)
.json(new ApiResponse(200,
    {
       user: loggedInUser,
        accessToken,
        refreshToken
    },
    "User logged in successfully"
)
)

})
const logOutUser=asyncHandler(async(req,res)=>{
    //get user id from req.user
    //find user in db and remove refresh token
    //clear cookies and send response
    User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
        }
    },
    {
        new:true
    }
    )
    const options={
    httpOnly:true,
    secure:true
}
return res.status(200)
.clearCookie("refreshToken",options)
.clearCookie("accessToken",options)
.json(new ApiResponse(200,{},"User logged out successfully")) 
     })

export {registerUser,
    loginUser,
    logOutUser
}
