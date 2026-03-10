"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import orders from "@/mock/orders.json"
import Badge from "@/components/badge.js"

export default function OrdersPage(){

const [tokens,setTokens] = useState([])

useEffect(() => {
  const generatedTokens = orders.map(() =>
    Math.random().toString(36).substring(2,8)
  )
  setTokens(generatedTokens)
}, [])

return(

<div style={{padding:"20px"}}>

<h1>canteen menu</h1>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:"20px"
}}>

{orders.map((item,index)=>{

const token = tokens[index]

return(

<div key={index}
style={{
border:"1px solid #ccc",
padding:"10px",
borderRadius:"10px"
}}>

<img
src={item.image}
alt={item.name}
style={{
width:"100%",
height:"200px",
objectFit:"cover"
}}
/>

<h3>{item.name}</h3>

<p>₹{item.price}</p>

<Badge status={item.status}/>

<br/><br/>

<Link href={`/pay/${token}`}>
<button style={{
background:"green",
color:"white",
padding:"8px 15px",
border:"none",
borderRadius:"5px"
}}>
Order Now
</button>
</Link>

</div>

)

})}

</div>

</div>

)

}