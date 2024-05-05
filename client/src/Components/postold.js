import React from 'react'
import { get, getDatabase } from "firebase/database";
import { useState, useEffect } from "react";
import {ref, onValue,child} from "firebase/database";
export default function Post(index) {
 
    //read

  return (
    <div>
    <p className='pt-8 text-xl font-semibold'> </p>
    <p className='text-gray-500 font-light text-sm'></p>
    <p className="pt-6"></p>
    </div>
  )
}

{posts.map((post, index) => (
  <div key={index}>
    <div>
    <p className='pt-8 text-xl font-semibold'>{post.title} </p>
    <p className='text-gray-500 font-light text-sm'>{post.author}</p>
    <p className="pt-6">{post.content}</p>
    </div>
  </div>
))}
