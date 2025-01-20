import server from "./socket.js";

const port=process.env.PORT || 3301

server.listen(port,()=>{
    console.log("server is running at: ",port);
    
})