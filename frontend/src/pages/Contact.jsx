import "./Contact.css"
import Navbar from "../components/Navbar";
import { useState } from "react";

function Contact(){
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const subject = encodeURIComponent(`Career Tracker enquiry from ${formData.name}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )

    window.location.href = `mailto:support@neuromirror.ai?subject=${subject}&body=${body}`
  }

  return(

    <>
        <Navbar />
        <div className="contact-page">

      {/* HERO */}

      <section className="contact-hero">

        <h1>Contact <span>Us</span></h1>

        <p>
          Have questions or feedback? We'd love to hear from you.
        </p>

      </section>


      {/* CONTACT SECTION */}

      <section className="contact-container">

        {/* CONTACT INFO */}

        <div className="contact-info">

          <h2>Get In Touch</h2>

          <p>Email: support@CarrerTracker.ai</p>

          <p>Partnerships: partners@neuromirror.ai</p>

          <p>Location: Remote / Global</p>

          <div className="social-links">

            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>

          </div>

        </div>


        {/* CONTACT FORM */}

        <form className="contact-form" onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">
            Send Message
          </button>

        </form>

      </section>

    </div>

    </>
  );
}

export default Contact
