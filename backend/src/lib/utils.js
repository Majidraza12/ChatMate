import jwt from 'jsonwebtoken'

export const generateToken = (userId,res) =>{
    //userId -> playload -> Refers to the data that we want to decode using the JWT_SECRET Key
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn : "1d" //expires in 1 day
    })

    res.cookie("jwt",token,{
        //maxage should be in milliseconds
        maxAge : 1 * 24 * 60 * 60 * 1000, //1 day in ms
        httpOnly : true, //prevents XSS attacks -> cross site scripting attacks -> as its only accessible via http
        sameSite: "strict", //CRSF -> prevents cross-site request forgery attacks
        secure : process.env.NODE_ENV !== "development"
        //Means this is going to be true if we are in Production

        //InShort what we are doing here is that we are creating a JsonWebToken and then sending that token to the user via cookie -> the token will expire in a day i.e user has to login again after one day
    })
    

}