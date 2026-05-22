import { useRef, useState } from "react"
import "./Testimonials.css"

function TestimonialCard({ item }) {
  const videoRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current) {
      // Play video with safe catch for autoplay restrictions
      videoRef.current.play().catch(err => {
        console.log("Hover video play interrupted:", err)
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      // Rewind to start to keep the hover experience fresh
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div 
      className="testimonial-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="testimonial-media-wrapper">
        <img 
          src={item.image} 
          alt={item.name} 
          className="testimonial-avatar-img"
        />
        <video 
          ref={videoRef}
          src={item.video}
          loop
          muted
          playsInline
          className="testimonial-hover-video"
        />
      </div>

      <p>"{item.text}"</p>
      <h4>{item.name}</h4>
    </div>
  )
}

function Testimonials() {

  const testimonials = [
    {
      image: "/avatar_vyshu.png",
      video: "https://assets.mixkit.co/videos/preview/mixkit-computer-screen-with-fast-running-code-41763-large.mp4",
      text: "This platform helped me stay consistent with LeetCode.",
      name: "vyshu — CSE Student"
    },
    {
      image: "/avatar_venky.png",
      video: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-41764-large.mp4",
      text: "Seeing my progress visually motivated me to code daily.",
      name: "venky — Software Engineering"
    },
    {
      image: "/avatar_karthik.png",
      video: "https://assets.mixkit.co/videos/preview/mixkit-lines-of-code-on-a-screen-in-a-dark-room-41762-large.mp4",
      text: "It feels like a fitness tracker for coding.",
      name: "karthik — Final Year"
    },
    {
      image: "/avatar_hero.png",
      video: "https://assets.mixkit.co/videos/preview/mixkit-blue-matrix-style-code-lines-running-on-screen-41766-large.mp4",
      text: "The AI career prediction was surprisingly accurate!",
      name: "HERO — CSE Student"
    },
    {
      image: "/avatar_ganesh.png",
      video: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-42772-large.mp4",
      text: "I love how it gamifies coding practice.",
      name: "GANESH — Software Engineering"
    }
  ]

  return (
    <section className="testimonials">

      <h2>What Students Say</h2>

      <div className="scroll-wrapper">
        <div className="scroll-track">

          {[...testimonials, ...testimonials].map((item, index) => (
            <TestimonialCard key={index} item={item} />
          ))}

        </div>
      </div>

    </section>
  )
}

export default Testimonials
