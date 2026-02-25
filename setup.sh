#!/usr/bin/env bash
set -e

echo "Creating backend..."
mkdir -p backend/src/routes backend/src/sessions

cat > backend/package.json <<'EOF'
{
  "name": "codex2-backend",
  "private": true,
  "scripts": {
    "dev": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5"
  }
}
EOF

cat > backend/src/index.js <<'EOF'
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
EOF

echo "Creating mobile..."

mkdir -p mobile

cat > mobile/package.json <<'EOF'
{
  "name":"codex2-mobile",
  "private":true,
  "main":"expo/AppEntry",
  "scripts":{
    "start":"expo start",
    "web":"expo start --web"
  },
  "dependencies":{
    "expo":"~52.0.28",
    "react":"18.3.1",
    "react-native":"0.76.6",
    "react-native-web":"~0.19.13"
  }
}
EOF

cat > mobile/App.js <<'EOF'
import React,{useState} from "react";
import {View,Text,TextInput,Pressable} from "react-native";

export default function App(){

const [url,setUrl]=useState("");
const [cmd,setCmd]=useState("");

return (
<View style={{padding:40}}>
<Text>Computer Use</Text>

<TextInput
placeholder="https://example.com"
value={url}
onChangeText={setUrl}
/>

<TextInput
placeholder="command"
value={cmd}
onChangeText={setCmd}
/>

<Pressable>
<Text>Start</Text>
</Pressable>

</View>
);
}
EOF

echo "DONE"
