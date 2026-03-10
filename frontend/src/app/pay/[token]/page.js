"use client"

import { useState, useEffect, use } from "react"

export default function PayPage({ params }) {

const resolvedParams = use(params)
const token = resolvedParams.token

const amount = 30
const [timeLeft, setTimeLeft] = useState(null)
const [expired, setExpired] = useState(false)

useEffect(() => {

setTimeLeft(180)

const timer = setInterval(() => {
  setTimeLeft((t) => {
    if (t <= 1) {
      clearInterval(timer)
      setExpired(true)
      return 0
    }
    return t - 1
  })
}, 1000)

return () => clearInterval(timer)

}, [])

return (

<div className="container">

<div className="card">

<h2>💳 Payment Page</h2>

<p><b>Order Token:</b> {token}</p>

<p><b>Amount to Pay:</b> ₹{amount}</p>

{expired ? (

<h3 style={{color:"red"}}>❌ Payment Expired</h3>

) : (

<>
<img
src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=pay-${token}`}
alt="QR Code"
/>

<p>⏳ Time Left: {timeLeft ?? "..."}s</p>
</>

)}

</div>

</div>

)
}