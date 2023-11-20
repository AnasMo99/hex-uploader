import express from "express";
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import database from "./prisma.js";
import multer from "multer";
import {storage} from "./storage/storage.js";
import path from "path"
import ejs from "ejs"


dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const PORT = process.env.PORT||5000;

const corsoptions = {credentials: true, origin:process.env.url||"*"}


app.use(cors(corsoptions))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

const upload = multer({ 
    // storage 
});



app.get('/',(req,res)=>{
    res.send('hello')
})
app.get("/hexfiles", async (req,res)=>{
    try {
        const hexFiles = await database.hex.findMany({})
        res.status(200).json({hexFiles})
    } catch (error) {
        res.status(400).json({message:error.message})
        console.log(error);
    }
})
app.post("/uploadFile", upload.single('file'),async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
          }
          if(req.file.mimetype==="application/octet-stream"){
      
              const newHex = await database.hex.create({
                  data:{
                      file:req.file
                  }
              })
             return res.json({ message: 'File uploaded successfully', data:newHex });
          } 
          return res.status(400).json({ error: 'not supported file' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
})
app.get("/hexfiles/:id", async (req, res)=>{
    try {
        const hexFile = await database.hex.findFirst({
        where:{
            id:+req.params.id
        },
    })
    res.status(201).json({file:hexFile})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
app.listen(PORT,()=>{
    console.log(`app listening on port ${PORT}`);
})

