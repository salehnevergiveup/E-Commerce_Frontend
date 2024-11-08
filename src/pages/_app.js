// pages/_app.js
import React from "react";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </AuthProvider>
  );
}
