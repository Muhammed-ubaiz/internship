

const adminemail = "admin@gmail.com"
const adminpass = "admin123"



const Login = (req,res)=>{
    const {email , password}= req.body

    if(email === adminemail && password === adminpass){
        return res.json({ success: true });
    }else{
        res.send("error")
    }
}


export{Login,}
