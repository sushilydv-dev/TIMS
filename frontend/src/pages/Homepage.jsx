import React from "react";
import { Navbar } from "../components/Navbar";
import background from "../assets/background.jpg";

export const Homepage = () => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-20 ">
        <Navbar />
      </div>
      <div
        className="w-screen h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})` }}
      ></div>
    </>
  );
};
