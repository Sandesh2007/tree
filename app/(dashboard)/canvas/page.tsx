"use client"
import TreeBuilder from '@/components/custom/treeBuilder';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Cookie from 'js-cookie';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const page = () => {

  const[isloading, setIsLoading] = useState(true);

  const fetchUserData = async ()=>{

    try{
      const response = await axios.post("api/canvas");

      if(response){
        console.log("user data :", response.data)
      }

    }catch(error:any)
    {
      
      if(error.response && error.response.status === 401){

        toast.error("Unauthorized access")
        
       }
    }finally{
      setIsLoading(false)
    }
    
  }

  useEffect(()=>{
    fetchUserData();
  },[])

     const router = useRouter();

 
      if (isloading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        )
    }
     
  return (
     <TreeBuilder />
   
  )
}

export default page
