import express from 'express'

import cors from 'cors'
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(
    cors({
        origin: '*', // Adjust based on your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true, // For cookies or auth headers
    })
);




// app.get('/create',async(req,res)=>{
//     const uid=uuidv4();
//     console.log(uid);
//     res.status(200).json({
//         uid
//     })
// })

export default app
