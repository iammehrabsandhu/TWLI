import  express  from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, get } from "firebase/database";
import {uid} from "uid";

const firebaseConfig = {
    apiKey: "AIzaSyBlPF8enfCLyjAA7oZvS24NT7h_DBC68IY",
    authDomain: "this-world-of-mine.firebaseapp.com",
    databaseURL: "https://this-world-of-mine-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "this-world-of-mine",
    storageBucket: "this-world-of-mine.appspot.com",
    messagingSenderId: "525542354809",
    appId: "1:525542354809:web:f2df0ea6551f36c68189a8"
  };
const app = initializeApp(firebaseConfig);
const Exapp = express();
const PORT = 3000;
Exapp.use(express.json());
Exapp.use(cors());


// Get a reference to the Firebase Realtime Database
const db = getDatabase();

// Reference to 'posts' node in the database
const postsRef = ref(db, 'posts');


Exapp.get('/',async (req,res)=>{
    onValue(postsRef, (snapshot) => {
        const posts = snapshot.val();
        res.json(posts);
      });
});
Exapp.get('/search',async (req,res)=>{
    const term = req.query.q;
    console.log(term);
    const snapshot = await get(postsRef);
    const posts = snapshot.val();
    if(term === ''){res.json(posts);}
    
    else{const filteredPosts = Object.values(posts).filter(post =>
        post.title == term || post.author == term
    );
    res.json(filteredPosts);}
});
Exapp.post('/post',async(req,res)=>{
    const jsonData = req.body;
    const uuid=uid();
    // Get a reference to the 'posts' node in the database
    const postsRef = ref(db, 'posts');
    const newPostRef = ref(postsRef.child(uuid));
    await set(newPostRef, jsonData);
    console.log(req.body);
    // Push the JSON data to the 'posts' node in the database
    //const newPostRef = push(postsRef); // Generate a new unique key
    //await set(newPostRef, jsonData);
    res.sendStatus(201);
}

);

Exapp.listen(PORT,()=>{console.log("port runnin");});