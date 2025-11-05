import React from 'react'
import ContactForm from '../components/Home/Contact'
import Hero from '../components/Home/Hero'
import MainPage from '../components/Home/MainPage'
import GalleryPage from '../components/Home/GalleryPage'
import Testimonials from '../components/Home/Testimonials'

const HomePage = () => {
  return (
    <div className='overflow-visible'>
      <Hero />
      <MainPage />
      <GalleryPage />
      <ContactForm />
      <Testimonials />
    </div>
  )
}

export default HomePage