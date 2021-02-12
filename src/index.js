const express= require("express");
const cors= require("cors");
const port= process.env.PORT;
const path= require('path');
const publicDirectoryPath=path.join(__dirname,'../public');

const app= express();

app.use(express.static(publicDirectoryPath))
app.use(express.json());
app.use(cors());

app.listen(port,()=>{
    console.log("Server connected, port: ", port);
});