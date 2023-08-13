import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDuHBu165mQbaxUb01QIpKd6w8UnP-lVo8",
  authDomain: "my-react-blog-4f336.firebaseapp.com",
  projectId: "my-react-blog-4f336",
  storageBucket: "my-react-blog-4f336.appspot.com",
  messagingSenderId: "421424314600",
  appId: "1:421424314600:web:62c0a16fa9ab6b5efe315d"
};

const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
