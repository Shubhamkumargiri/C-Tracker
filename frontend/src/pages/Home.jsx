import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Divider from '../components/Divider';
import Solution from '../components/Solution';
import HowItWorksSection from '../components/HowItWorksSection';
import Integrations from '../components/Integrations';
import CareerPrediction from '../components/CareerPrediction';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
function Home() {
  return (
    <>
    <Navbar />
    <Hero />
    <Divider />
    <Problem/>
    <Divider/>
    <Solution/>
    <Divider/>
    <HowItWorksSection />
    <Divider/>
    <Integrations />  
    <Divider />
    <CareerPrediction />
    <Divider />
    <Testimonials />
    <Divider />
    <CTA />
    <Divider />
    <Footer />  
    </>
    
  );
}

export default Home