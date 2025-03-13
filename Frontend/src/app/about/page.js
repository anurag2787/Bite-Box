"use client";

import React from "react";
import Footer from "../../Components/Footer";
import Navbar from "../../Components/Navbar";
import Image from "next/image";
import { useDarkMode } from "../DarkModeContext";

function About() {
  const { darkMode } = useDarkMode();

  return (
    <div>
      <div className="mt-12 mb-10 text-6xl text-center font-extrabold tracking-wide">
        About Us
      </div>
      <div className="text-center mb-10 px-4">
        <p
          className={`max-w-2xl mx-auto text-sm ${darkMode ? " text-white" : "text-gray-800"
            } animate-fade-in bg-clip-text`}
        >
          We are BiteBox – dedicated to inspiring food lovers by sharing
          mouthwatering recipes and providing a platform for everyone to share
          their culinary creations with the world.
        </p>
      </div>

      <div className="flex flex-col space-y-10 mb-12 mx-4 lg:mx-20">
        <div className="flex flex-col items-center w-full group">
          <div className="w-full md:w-2/3 lg:w-1/2 overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1594179047519-f347310d3322?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzdCUyMGZvb2R8ZW58MHx8MHx8fDA%3D"
              width={900}
              height={600}
              alt="Delicious recipe"
              className="w-full transition duration-500 group-hover:scale-110 group-hover:rotate-2 rounded-lg shadow-lg"
            />
          </div>
          <div className="w-full md:w-4/5 lg:w-4/5 mt-6 text-justify p-4">
            <p className="text-sm leading-relaxed hover:text-gray-600 transition-colors">
              Welcome to BiteBox, your ultimate destination for exploring,
              creating, and sharing incredible recipes. Our mission is to
              inspire a love for cooking and enable everyone to connect through
              their shared passion for delicious food.
            </p>
          </div>
        </div>

        {[
          {
            title: "Our Platform",
            description: "At BiteBox, we offer a space where food enthusiasts can share their favorite recipes, discover new culinary ideas, and connect with like-minded individuals. Whether you're a home cook or a seasoned chef, BiteBox is the perfect place to showcase your culinary creations.",
            image: "https://images.unsplash.com/photo-1610614819513-58e34989848b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZhc3QlMjBmb29kfGVufDB8fDB8fHww",
            reverse: true
          },
          {
            title: "Fresh Ideas",
            description: "From farm-to-table inspirations to fusion recipes, our community members contribute ideas that celebrate diverse cuisines and innovative techniques.",
            image: "https://images.unsplash.com/photo-1613319300832-a105da5bd34e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fGZhc3QlMjBmb29kfGVufDB8fDB8fHww",
            reverse: false
          },
          {
            title: "Quality Content",
            description: "Discover recipes that not only satisfy your taste buds but also inspire your culinary journey. Every recipe shared on BiteBox is crafted with care, ensuring you have the best cooking experience.",
            image: "https://images.unsplash.com/photo-1615996001375-c7ef13294436?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGZhc3QlMjBmb29kfGVufDB8fDB8fHww",
            reverse: true
          },
          {
            title: "Our Values",
            description: "BiteBox thrives on creativity, community, and inclusivity. We aim to create a space where food lovers can learn, share, and grow together, celebrating the joy of cooking and the stories behind every recipe.",
            image: "https://images.unsplash.com/photo-1545575950-59f935d6521c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGZhc3QlMjBmb29kfGVufDB8fDB8fHww",
            reverse: true
          }
        ].map((section, index) => (
          <div
            key={index}
            className={`flex flex-col ${section.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} w-full items-center lg:items-start border p-4 rounded-lg shadow-md group hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="w-full lg:w-1/2 overflow-hidden rounded-lg">
              <Image
                src={section.image}
                width={900}
                height={500}
                alt={section.title}
                className="w-full rounded-lg shadow-lg transform transition duration-500 group-hover:scale-110 group-hover:rotate-1"
              />
            </div>
            <div className="w-full lg:w-1/2 mt-6 lg:mt-0 lg:ml-10 text-justify p-4 lg:p-0">
              <h1 className="text-4xl font-bold tracking-wide py-5 px-5 hover:text-gray-600 transition-colors">
                {section.title}
              </h1>
              <p className="text-lg leading-relaxed px-5 pb-5 hover:text-gray-700 transition-colors">
                {section.description}
              </p>
            </div>
          </div>
        ))}

        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 hover:text-gray-900 transition-colors">
            {"Thank you for choosing BiteBox. Let's cook, share, and connect!"}
          </p>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;