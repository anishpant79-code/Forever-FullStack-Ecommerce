import React from 'react'
import Title from '../Components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../Components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>
      <div className='my-10 flex-col flex md:flex-row gap-16'>
        <img src={assets.about_img} className='w-full md:max-w-[450px]' alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium cum, sapiente fugiat earum accusantium ullam aliquam accusamus vel assumenda voluptatum, eveniet optio atque quia natus, molestias nisi vero labore quibusdam!</p>
          <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis possimus voluptatem, repellat voluptates ipsam magni ipsa magnam iusto non dolor repudiandae at recusandae tempore odit, deserunt, nam quo consequuntur! Explicabo?</p>
          <b className='text-gray-800'>Our Mission</b>
          <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cupiditate aperiam sed quos maiores ipsam officiis earum iusto perferendis ducimus delectus.</p>

        </div>
      </div>
      <div className='text-4xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />

      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Amet repellendus saepe quaerat, cupiditate temporibus quia accusamus ea illum eum debitis.</p>

        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut nemo officia illo et inventore quam accusantium aliquam odio esse repudiandae.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Services:</b>
          <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut nemo officia illo et inventore quam accusantium aliquam odio esse repudiandae.</p>
        </div>

      </div>
      <NewsletterBox />
    </div>
  )
}

export default About
