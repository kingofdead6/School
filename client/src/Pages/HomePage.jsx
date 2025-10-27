import React from 'react'
import ContactForm from '../components/Home/Contact'
import Hero from '../components/Home/Hero'
import MainPage from '../components/Home/MainPage'
import GalleryPage from '../components/Home/GalleryPage'


const HomePage = () => {
  return (
    <div className='overflow-visible'>
      <Hero />
      <MainPage />
      <GalleryPage />
       <ContactForm />
    </div>
  )
}

export default HomePage