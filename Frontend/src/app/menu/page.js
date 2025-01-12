"use client"
import React, { useState, useEffect } from 'react'
import Footer from '../../Components/Footer'
import Section from '@/Components/Section'
import Image from 'next/image'
import { useDarkMode } from '../DarkModeContext'
import axios from 'axios'
import { useRouter } from "next/navigation"; // Correct API for App Directory



const Menu = () => {
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [meals, setMeals] = useState([])
    const [filteredMeals, setFilteredMeals] = useState([])
    const { darkMode } = useDarkMode()
    const router = useRouter();
    
    const handleinstructionpage = (meal) => {
        router.push(`/menuview?id=${encodeURIComponent(meal.idMeal)}`);
      };

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const url = searchQuery
                    ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`
                    : 'https://www.themealdb.com/api/json/v1/1/search.php?s='

                const response = await axios.get(url)
                const mealsData = response.data.meals || []
                setMeals(mealsData)
                setFilteredMeals(mealsData)
            } catch (error) {
                console.error('Error fetching meals:', error)
            }
        }

        fetchMeals()
    }, [searchQuery])

    useEffect(() => {
        const filterItems = () => {
            let items = meals
            if (selectedCategory !== 'All') {
                items = items.filter((meal) => meal.strCategory === selectedCategory)
            }
            setFilteredMeals(items)
        }

        filterItems()
    }, [selectedCategory, meals])

    const categories = [
        ...new Set(meals.map((meal) => meal.strCategory)),
        'All',
    ]

    return (
        <main className='min-h-screen flex flex-col'>
            <Section>
                {/* Header Container */}
                <div className='flex flex-col gap-6 mb-12 w-full'>
                    {/* Title and Search Row */}
                    <div className='flex justify-between items-center w-full'>
                        <h1 className='text-6xl font-bold tracking-wide'>
                            Menu
                            <span className={`blinking-underscore ${darkMode ? 'text-white' : 'text-black'}`}>
                                _
                            </span>
                        </h1>

                        {/* Search Bar */}
                        <div className='relative'>
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Here"
                                className='pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black w-64 bg-white'
                            />
                        </div>
                    </div>

                    {/* Categories Container */}
                    <div className='flex justify-end'>
                        <div className='flex flex-wrap gap-2'>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`px-4 py-2 rounded-full ${selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                        }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filtered Meals */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {filteredMeals.length === 0 ? (
                        <div className='h-[28vh] w-full'>
                            <h1 className='text-center text-4xl font-bold ml-5 text-red-500'>
                                Oops! No Recipe Found
                            </h1>
                        </div>

                    ) : (
                        filteredMeals.map((meal, index) => (
                            <div
                                key={index}
                                className='bg-gray-300 rounded-lg shadow-lg overflow-hidden transition duration-300 ease-in-out transform hover:scale-105'
                            >
                                <Image
                                    src={meal.strMealThumb}
                                    alt={meal.strMeal}
                                    width={50}
                                    height={50}
                                    className='w-full h-48 object-cover'
                                />
                                <div className='p-6'>
                                    <h2 className='text-2xl text-black font-bold'>{meal.strMeal}</h2>
                                    <p className='text-gray-700 '>{meal.strInstructions.slice(0, 100)}...</p>
                                </div>
                                <div className='mb-4 flex justify-center items-center'>
                                    
                                        <button onClick={() => handleinstructionpage(meal)} className='w-32 h-10 bg-yellow-400 text-gray-600 rounded-full hover:bg-yellow-500 animation hover:font-semibold'>Recipe</button>
                                    
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    )
}

export default Menu
