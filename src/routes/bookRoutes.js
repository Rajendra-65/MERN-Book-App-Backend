import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectedRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectedRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        let imageUrl = ""

        if (!image || !title || !caption || !rating) {
            return res.status(400).json({
                message: "Please provide all details",
            });
        }

        // Upload to Cloudinary
        try{
            const result = await cloudinary.uploader.upload(image);
            imageUrl = result.secure_url;
        }catch(e){
            console.log("error in the cloudinary",e)
        }
        
        

        // const imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFYqoKTu_o3Zns2yExbst2Co84Gpc2Q1RJbA&s"

        // Save to DB
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook);
    } catch (e) {
        console.log("Error in creating book:", e);
        res.status(500).json({ message: e.message });
    }
});


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
            totalPages :Math.ceil(totalBooks / limit)
        })
    }catch(e){
        console.log("error in getting books",e)
    }
})

router.get("/user/books",protectedRoute, async(req,res)=>{
    try{
        const book = await Book.find({user:req.user._id}).sort({
            createdAt : -1
        });
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