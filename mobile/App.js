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
