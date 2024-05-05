import React,{ useState } from 'react'
import Modal from "react-modal";
import {uid} from "uid";
import 'firebase/storage';
import axios from 'axios';
import { getStorage,uploadBytes,ref as sRef, getDownloadURL } from 'firebase/storage';


const PostForm = ({ addPost }) => {
    const [file, setFile] = useState('');

   
    const [modalOpen, setModalOpen] = useState(true);
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

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [tag, setTag] = useState('');
    const [selectedImage,setSelectedImage] = useState('');
      

    const handleImageChange = (e) =>{ if (e.target.files[0]) { setSelectedImage(e.target.files[0]); }  }
    const handleSubmit = async (e) => {
      e.preventDefault();
      const uuid = uid();
      const formData = new FormData(e.target);
      console.log(FormData);
      const storageRef = sRef(getStorage());
      const imageRef =  sRef(storageRef, selectedImage.name);
      await uploadBytes(imageRef,selectedImage);
      let imageUrl = await getDownloadURL(imageRef);

      document.getElementById("btnnn").textContent="Submitting";
      const newPost = {
        author,
        title,
        content,
        tag,
        imageUrl,
      };
      console.log(newPost);
     
      const uploader= async()=>{
        try{
          const res = await axios.post('http://localhost:3000/post',newPost);
        }
        catch(err){
          console.log(err)
        }
      };
  
  
    uploader();
      
      setAuthor('');
      setTitle('');
      setContent('');
      setTag('');
      setFile('');
      
      document.getElementById("form").reset();
      document.getElementById("btnnn").textContent="Publish";
    };


  return(
    <Modal
    isOpen={modalOpen}
    onRequestClose={() => setModalOpen(false)}
    style={customStyles}>
      
      <div className='text-center my-2 text-xl'>Your new post!</div>
      <form className="m-16" id="form" onSubmit={handleSubmit}>
        <input type="text" className="w-full mb-6 border border-gray-450 rounded-3xl p-2 pl-3" placeholder="Creator's Name"  defaultValue={author}   onChange={(e) => setAuthor(e.target.value)} required></input>
        <input type="text" className="w-full mb-6 border border-gray-450 rounded-3xl p-2 pl-3" placeholder="Title" defaultValue={title} onChange={(e) => setTitle(e.target.value)} required></input>
        <input type="text" className="w-full mb-6 border border-gray-450 rounded-3xl p-2 pl-3" placeholder="Tags (put # in front)" defaultValue={tag} onChange={(e)=>setTag(e.target.value)}></input>
        <input type="text-area" className="w-full mb-6 border border-gray-450 rounded-3xl p-2 pl-3" placeholder="Description" defaultValue={content} onChange={(e) => setContent(e.target.value)} required></input>
  
        <input type="file" multiple={false}  className="mb-6 mt-4" onChange={handleImageChange}></input>
        <button type="submit" className="bg-black text-white p-2 mt-4 rounded-l float-right px-4" id='btnnn'>Publish</button>
      </form>


    </Modal>

  );};

  export default PostForm