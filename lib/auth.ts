import jwt, { SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if(!JWT_SECRET){
    throw new Error('Please define JWT_SECRET in .env.local');

}

export interface JWTPayload{
    email: string;
}

export const generateToken = (email:string)=>{
    const payload = {email};
    const options:SignOptions = {algorithm:'HS256', expiresIn:60*60*24};

    return jwt.sign(payload, JWT_SECRET, options);
}

export const verifyToken = (token:string):JWTPayload | null => {
    try{
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error){
        console.error('JWT verification error: ', error);
        return null;
    }
}

export const decodeToken = (token:string): JWTPayload | null =>{
    try{
        return jwt.decode(token) as JWTPayload;

    }catch(error){
        console.error('JWT decode error:', error);
        return null;
    }
}

export const getCurrentUser = async ()=>{
    try{
        const cookieStore = cookies();
        const token = (await cookieStore).get('token')?.value;

        if(!token){
            return null;
        }

        const decoded = verifyToken(token);
        return decoded;
    } catch (error){
        console.error('Get current user error:', error);
        return null;
    }
}