import "./Testimonials.css"

function Testimonials() {

  const testimonials = [
    {
      video: "/public/nifty-fifty.jpeg",
      text: "This platform helped me stay consistent with LeetCode.",
      name: "vyshu — CSE Student"
    },
    {
      video: "/public/democt1.png",
      text: "Seeing my progress visually motivated me to code daily.",
      name: "venky — Software Engineering"
    },
    {
      video: "/public/WhatsApp Image 2025-06-24 at 21.44.06_5f8c55ea.jpg",
      text: "It feels like a fitness tracker for coding.",
      name: "karthik — Final Year"
    },
    {
      video: "/public/KARTHIK2.JPEg",
      text: "The AI career prediction was surprisingly accurate!",
      name: "HERO — CSE Student"
    },
    {
      video: "/public/ganesh1.jpeg",    
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
            <div className="testimonial-card" key={index}>

              <img src={item.video} alt={item.name} />
               

              <p>"{item.text}"</p>
              <h4>{item.name}</h4>

            </div>
          ))}

        </div>
      </div>

    </section>
  )
}

export default Testimonials
