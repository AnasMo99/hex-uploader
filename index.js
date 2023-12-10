import express from "express";
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import database from "./prisma.js";
import multer from "multer";
import path from "path"





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
//web page to upload the hexfile
app.get('/',(req,res)=>{
    res.render('index')
})
//see all files object uploaded in database
app.get("/hexfiles", async (req,res)=>{
    try {
        const hexFiles = await database.hex.findMany({})
        res.status(200).json({hexFiles})
    } catch (error) {
        res.status(400).json({message:error.message})
        console.log(error);
    }
})

app.post("/uploadfile", upload.single('file'),async (req, res) => {
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
        return res.status(400).json({ error: error });
    }
})
//see newest file object uploaded in database
app.get("/hexfiles/latestfile", async (req, res)=>{
    try {
        const hexFile = await database.hex.findMany({})
    // const buffer = Buffer.from(hexFile.file.buffer, "base64");
    // res.writeHead(200, {'Content-Type': 'application/octet-stream','Content-disposition':`attachment; filename=${hexFile.file.originalname.slice(0,-4)}${new Date().getTime()}.hex`});

    // res.end( buffer );
    res.status(201).json({file:hexFile[hexFile.length-1]})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
//see newest file in hex form in the browser
app.get("/hexfiles/latestfile/hex-content", async (req, res)=>{
    try {
        const hexFile = await database.hex.findMany({})
    const buffer = Buffer.from(hexFile[hexFile.length-1].file.buffer, "base64");
    // console.log(buffer.toString("hex"));
    res.end( buffer );
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
//direct link to download the newest hex file
app.get("/hexfiles/latestfile/download", async (req, res)=>{
    try {
        const hexFile = await database.hex.findMany({})
        //this if to check if the file downloaded before or not 
        //if you didn't download it before it will be false and will download the file otherwise it will be true and return this json object {message:"you downloaded this file before"}
        if(!hexFile[hexFile.length-1].downloaded){
            const buffer = Buffer.from(hexFile[hexFile.length-1].file.buffer, "base64");
            res.writeHead(200, {'Content-Type': 'application/octet-stream','Content-disposition':`attachment; filename=${hexFile[hexFile.length-1].file.originalname.slice(0,-4)}${new Date().getTime()}.hex`});
            await database.hex.update({
                where:{
                    id:+hexFile[hexFile.length-1].id
                },
                data:{
                    downloaded:true
                }
            })
            res.end( buffer );
            // res.status(201).json({file:hexFile})
        } else {
            res.json({message:"you downloaded this file before"})
        }
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
//see specific file object uploaded in database by Id
app.get("/hexfiles/:id", async (req, res)=>{
    try {
        const hexFile = await database.hex.findFirst({
        where:{
            id:+req.params.id
        },
    })
    // const buffer = Buffer.from(hexFile.file.buffer, "base64");
    // res.writeHead(200, {'Content-Type': 'application/octet-stream','Content-disposition':`attachment; filename=${hexFile.file.originalname.slice(0,-4)}${new Date().getTime()}.hex`});

    // res.end( buffer );
    res.status(201).json({file:hexFile})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
//see specific file in hex form in the browser by Id
app.get("/hexfiles/:id/hex-content", async (req, res)=>{
    try {
        const hexFile = await database.hex.findFirst({
        where:{
            id:+req.params.id
        },
    })
    const buffer = Buffer.from(hexFile.file.buffer, "base64");
    res.end( buffer );
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})
//direct link to download specific hex file by Id
app.get("/hexfiles/:id/download", async (req, res)=>{
    try {
        const hexFile = await database.hex.findFirst({
        where:{
            id:+req.params.id
        },
    })
    const buffer = Buffer.from(hexFile.file.buffer, "base64");
    res.writeHead(200, {'Content-Type': 'application/octet-stream','Content-disposition':`attachment; filename=${hexFile.file.originalname.slice(0,-4)}${new Date().getTime()}.hex`});
    await database.hex.update({
        where:{
            id:+hexFile.id
        },
        data:{
            downloaded:true
        }
    })
    res.end( buffer );
    // res.status(201).json({file:hexFile})
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})


app.listen(process.env.PORT,()=>{
    console.log(`app listening on port ${PORT}`);
})

