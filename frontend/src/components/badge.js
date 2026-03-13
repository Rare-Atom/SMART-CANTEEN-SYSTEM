"use client"

export default function badge({ status }) {



if (status === "Pending") color = "orange"
if (status === "Preparing") color = "blue"
if (status === "Ready") color = "green"
if (status === "Accepted") color = "blue"
if (status === "rejected") color = "red"

return (

<span
style={{
background: color,
color: "white",
padding: "5px 10px",
borderRadius: "6px"
}}
>
{status}
</span>

)

}