import React, { useState } from "react";
import '../App.css';
import Modal from "react-modal";
import { Link } from "react-router-dom";
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    width: 400,
    
  },
};


function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div>
       <style>
        {`
          @media (max-width: 768px) {
            .re-flex {
              flex-direction: column; 
            }
            .re-b{
              padding-bottom:20%;
            
            }
          }
        `}
      </style>
      <nav className="bg-primary w-full h-14 flex flex-row justify-between fixed navbar"><h1 className='text-white text-center text-bold py-3 text-2xl ml-3'><Link to="/">The world we live in.</Link></h1>
      <button className='text-white float-right mr-3 px-2 p-1 font-semibold'onClick={setModalOpen}>Login</button>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={customStyles}
      >
        <div className='text-2xl font-bold pb-1'>Sign up</div><div className='pb-5'>It's quick and easy.</div><hr className='mb-8'></hr>
        <form className='flex flex-col'>
              <input className='border w-full p-1 mb-3' placeholder='Username'></input>
              <input type={'password'} className='border w-full p-1 mb-3' placeholder='Password'></input>
              <input type={'email'} className='border w-full p-1 mb-3' placeholder='Email / mobile no.'></input>
             
              <div className="flex justify-between">
              <button className='text-white bg-black mt-8 p-2 px-4 rounded-lg float-left' onClick={() => alert("Use guest login for now, thenks :)")}>Create Account</button>
              <Link to="/Page2"><a className="float-right mt-8 p-2 text-blue-800 italic">Use guest login</a></Link>
              </div>
        </form>
      </Modal>
      </nav>
      <div id="bck" className='bg-cover pt-80 bg-fixed'>
        <h1 className='text-6xl text-center text-white'>The world we live in.</h1>
        <h2 className='text-3xl text-center pt-5 text-white'>For exploring new perspectives</h2>
        <div className="w-full text-center">
        <button className='bg-black text-white p-3 rounded-lg  mt-16 hover:bg-white hover:text-black min-w-max'onClick={setModalOpen} id='signup'>Sign up for free!</button>
        </div>
        <div className='bg-white w-full justify-center mt-56 pt-20 md:px-24 px-5 rounded-t-[50px] '>
          <h1 className='text-5xl font-bold'>Catch a glimpse !</h1>
          <p className='text-xl pt-6'>See what others have shared.</p>
          <div className="flex flex-row py-16 gap-x-12 re-flex" >
         
            <div className="basis-1/3 re-b">
              <img id='share1' src="images/post1.JPG"></img>
              <p className='pt-10 text-xl font-semibold'>The Concrete Jungle. </p>
              <p className='text-gray-500 font-light text-sm'>@whiskeyno1ce</p>
              <p className="pt-6">Grey weather with minimalistic architecture, biomes of the future. </p>
            </div>
            <div className="basis-1/3 re-b">
              <img id='share2' src='images/post2.jpg'></img>
              <p className='pt-10 text-xl font-semibold'>Flowers of the night.</p>
              <p className='text-gray-500 font-light text-sm'>@redswan909</p>
              <p className="pt-6">The kind of view that makes you stop in the cold and live a moment.</p>
            </div>
            <div className="basis-1/3 re-b">
              <img id='share3' src='images/post3.jpg'></img>
              <p className='pt-10 text-xl font-semibold'>Dayout!</p>
              <p className='text-gray-500 font-light text-sm'>@totallyripemango</p>
              <p className="pt-6">Sunny weather with your own people, what more you need? </p>
            </div>
          </div>
        </div>
      </div>
      <div id='section2' className='md:px-36 px-5 pb-20 pt-12 '>
        
          <div className="bg-white md:px-20 px-10 pb-28 mt-12 rounded-[50px] opacity-90">
          <h1 className='text-4xl min-w-full font-bold text-black text-center pt-20 pb-12'>What it's all about.</h1>
          <p className="text-left pl-2">Do you really need those likes and shares and short form video content to fry your brain dry?<br /><br /> Not really,<br /> with this site you can expect to elegantly look at pictures and the emotions they encompass by real people.
          The content is heavily moderated to make sure no unintended or irrelevant posts are made as the objective here is to have more than an image, a whole new prespective that is to be shared with each post.</p>
          </div>
        
      </div>
        <div className='text-center bg-black text-white'>© 2022 Copyright: Mehrab Sandhu</div>
      </div>
      
  )
}
export default Home