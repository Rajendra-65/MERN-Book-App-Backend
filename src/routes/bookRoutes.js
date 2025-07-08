import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectedRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",protectedRoute,async(req,res)=>{
    try{
        
        const { title , caption , rating , image } = req.body;

        if(!image || !title || !caption || !rating ){
            return res.status(400).json({
                message: "please provide all details"
            })
        }

        // upload to cloudinary
        const result = await cloudinary.uploader.upload(image);
        const imageUrl = result.secure_url;
        // Save to Db
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user : req.user._id,
    
        })

        await newBook.save()

        res.status(201).json(newBook)

    }catch(e){
        console.log("error in the creating book",e)
        res.status(500).json({
            message:e
        })
    }
})

// pagination => Infinite Scrolling
router.get("/",protectedRoute, async(req,res) => {
    try{
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page-1) * limit
        const books = await Book.find()
                                .sort({createdAt : -1}) 
                                .skip(skip)
                                .limit(limit)
                                .populate("user","username profileImage")
        
        const totalBooks = await Book.countDocuments()

        res.send({
            books,
            currentPage :page,
            totalBooks : totalBooks,
            totalPages :Match.ceil(totalBooks / limit)
        })
    }catch(e){
        console.log("error in getting books",e)
    }
})

router.get("/:id",protectedRoute, async(req,res)=>{
    try{
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({
            message:"Book not found"
        })
        if(book.user.toString() != req.user._id.toString()){
            return res.status(401).json({message : "unauthorized"})
        }

        // Delete from cloudinary

        if(book.image && book.image.includes("cloudinary")){
            try{
                const publicId = book.image.split("/").pop().split(".")[0]
                await cloudinary.uploader.destroy(publicId)
            }catch(e){
                console.log("Error in deleting the data from cloudinary",e)
            }
        }

        await book.deleteOne()

        res.json({
            message: "Book Deleted Successfully"
        })
    }catch(e){
        console.log(e)
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
})

export default router;