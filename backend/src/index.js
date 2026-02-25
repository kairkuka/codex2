const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_,res)=>res.json({ok:true}));

app.post("/sessions",(req,res)=>{
  res.json({ sessionId: crypto.randomUUID() });
});

const port = process.env.PORT || 3001;
app.listen(port, ()=> console.log("Backend on",port));
