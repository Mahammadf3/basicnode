
const express=require("express");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
const app=express();
const {open}=require("sqlite");
const sqlite3=require("sqlite3");
const path=require("path");

const database=path.join(__dirname,"storage.db");
app.use(express.json());
let db=null;

const connection=async()=>{
    try{
        db=await open({
           filename:database,
           driver:sqlite3.Database, 
        })
        app.listen(3000,()=>{
            console.log("server run succesfully");
        })
    }
    catch(e){
        console.log(`error ${e}`)
    }
}

connection();

app.post("/register/",async(request,response)=>{
    const r=request.body;
    const {id,name,password}=r;
    const hashPassword=await bcrypt.hash(password,10);
    const a=`select * from student where name='${name}';`;
    const b=await db.get(a);
    if(b === undefined){
        const new1=`insert into student
        (id,name,password)
        values
        (${id},'${name}','${hashPassword}');`;
    await db.run(new1);
       
    response.send("register");
    }else{
        response.send("alredy exist")
    }
}
)

app.post("/login",async(request,response)=>{
    const a=request.body;
    const {name,password}=a;
    const b=`select * from student where name='${name}'; `;
    const c=await db.get(b);
    if(c===undefined){
        response.status(400);
        response.send("invalid")

    }else{
        const d=await bcrypt.compare(password,c.password);
        if(d===true){
            const payLoad={
                name:name
            }
            const jwtToken=await jwt.sign(payLoad,"key")
         
            response.send(jwtToken)
        }else{
            response.send("failure")
        }
    }
})

const middleFunction=async(request,response,next)=>{
    let jwtToken;
    const authHeader=request.headers["authorization"];
    if(authHeader !==undefined){
        jwtToken=authHeader.split(" ")[1];
    }
    if(jwtToken===undefined){
        response.send("errorInvalid")
    }else{
        jwt.verify(jwtToken,"key",async(error,payload)=>{
            if(error){
                response.send(`error${error}`)
            }else{
                next()
            }
        })
       
    }

}




app.get("/getData",middleFunction,async(request,response)=>{
const dd=`select * from school;`;
const aa=await db.all(dd);
response.send(aa)
})

app.get("/data/:Id",middleFunction,async(request,response)=>{
    const {Id}=request.params;
    const ddd=`select * from school where id=${Id};`;
const aaa=await db.all(ddd);
response.send(aaa)
})