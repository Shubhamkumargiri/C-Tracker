import "./Testimonials.css"

function Testimonials() {

  const testimonials = [
    {
      video: "/videos/test1.mp4",
      text: "This platform helped me stay consistent with LeetCode.",
      name: "Rahul — CSE Student"
    },
    {
      video: "/videos/test2.mp4",
      text: "Seeing my progress visually motivated me to code daily.",
      name: "Priya — Software Engineering"
    },
    {
      video: "/videos/test3.mp4",
      text: "It feels like a fitness tracker for coding.",
      name: "Arjun — Final Year"
    }
  ]

  return (
    <section className="testimonials">

      <h2>What Students Say</h2>

      <div className="scroll-wrapper">
        <div className="scroll-track">

          {[...testimonials, ...testimonials].map((item, index) => (
            <div className="testimonial-card" key={index}>

              <video controls>
                <source src={item.video} type="video/mp4"/>
              </video>

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