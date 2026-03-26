import {Router} from "express";
import { logOutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";


const router=Router();

router.route("/register").post(
    upload.fields([//to upload multiple files with different field names
       {
        name:"avatar",
        maxCount:1
       },
       {
        name:"coverImage",
        maxCount:1
       }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").get(verifyJWT,logOutUser)


export default router
