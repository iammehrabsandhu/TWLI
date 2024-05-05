import React,{ useState,useEffect } from 'react'
import '../App.css';
import { Link } from 'react-router-dom'
import PostForm from './PostForm';
import axios from "axios"
import 'firebase/storage';

const Page2 = () => {

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      margin:"1%",
      
    },
  };
  
  const [showObject, setShowObject] = useState(false);
  const [posts, setPosts] = useState([]);
  const [searchQuery,setSearchQuery] = useState();

  const clicked =() =>{
    console.log("clicked");
    setShowObject(!showObject);
    return (console.log('exexexexexex'))
  }

  useEffect(() => {
  
    const fetcher= async()=>{
      try{
        const res = await axios.get('http://localhost:3000/');
        const postObject = res.data;
        const postArray = Object.keys(postObject).map((key) => postObject[key]);
        setPosts(postArray);
      }
      catch(err){
        console.log(err)
      }
    };


  fetcher();
  
  },[]);

  const search = async()=>{

    console.log("phunchgya")

    const res = await axios.get('http://localhost:3000/search',{params: {q: searchQuery}} );
    const postObject = res.data;
    const postArray = Object.keys(postObject).map((key) => postObject[key]);
    setPosts(postArray);
  }

  console.log(searchQuery);



return (
  
    <div>

    <nav className="bg-primary w-full h-14 flex flex-row justify-between navbar fixed">
      <h1 className='text-white text-center text-bold py-3 text-2xl ml-3'><Link to="/">The world we live in.</Link></h1>
    </nav>
    <div className="md:mx-16 mx-2"><div className='flex justify-between'>
      <button type='submit' className=' mt-20 mb-6 text-white bg-black md:px-4 px-3 p-2 rounded-3xl ' onClick={clicked} >CREATE POST</button>
      {showObject &&<PostForm  />}
      
     <div><input type="text" className=" mt-20 mb-6 ml-5 p-2 pl-3 rounded-l-3xl border border-black" placeholder=' Search tags / titles'  onChange={(e)=>{setSearchQuery(e.target.value);}}></input>
      <button onClick={()=>{search();}} className="bg-primary text-white p-2 px-3 rounded-r-3xl border border-black">Search</button></div>
      </div>
      <hr className='mb-12'/>
      <div className="grid grid-cols-1 gap-20 md:grid-cols-3">

      {posts.map((post, index) => (
  <div key={index}>
    <div className='hover:shadow-md'>
    <img className='object-cover  h-60 w-full' src={post.imageUrl}></img>
    <div className='hover:px-2'>
    <p className='pt-8 text-xl font-semibold'>{post.title} </p>
    <p className='text-gray-500 font-light text-sm'>{post.author}</p>
    <p className="pt-6">{post.content}</p>
    </div>
    </div>
  </div>
))}

</div>
    </div>
   
    </div>
    
  )
  
};


export default Page2
