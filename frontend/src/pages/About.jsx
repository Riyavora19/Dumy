import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const advantages = [
    {
      icon: '⚡',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: '✓',
      title: 'Quality Assured',
      description: 'Premium products with guaranteed quality standards'
    },
    {
      icon: '💰',
      title: 'Best Prices',
      description: 'Competitive pricing without compromising quality'
    },
    {
      icon: '🤝',
      title: 'Expert Support',
      description: '24/7 customer support for all your queries'
    }
  ];

  const whyChooseUs = [
    {
      number: '01',
      title: 'Industry Experience',
      description: 'Over 15 years of experience in premium products and supplies'
    },
    {
      number: '02',
      title: 'Wide Selection',
      description: 'Extensive range of products from trusted brands'
    },
    {
      number: '03',
      title: 'Trusted Partners',
      description: 'Partnerships with leading manufacturers worldwide'
    },
    {
      number: '04',
      title: 'Customer First',
      description: 'Your satisfaction is our top priority'
    }
  ];

  const team = [
    {
      name: 'John Smith',
      position: 'Founder & CEO',
      image: '👨‍💼'
    },
    {
      name: 'Sarah Johnson',
      position: 'Operations Manager',
      image: '👩‍💼'
    },
    {
      name: 'Mike Chen',
      position: 'Sales Director',
      image: '👨‍💼'
    },
    {
      name: 'Emma Davis',
      position: 'Customer Success Lead',
      image: '👩‍💼'
    }
  ];

  return (
    <main className="about">
      {/* Welcome Section */}
      <section className="about__welcome">
        <div className="about__container">
          <div className="about__welcome-content">
            <h1>Welcome to Our Company</h1>
            <p>
              We are a leading provider of premium products and supplies, dedicated to delivering excellence 
              and innovation to our customers worldwide. With a commitment to quality and customer satisfaction, 
              we've built a reputation as a trusted partner for businesses and individuals alike.
            </p>
            <p>
              Our mission is to provide high-quality products at competitive prices, backed by exceptional 
              customer service and support. We believe in building long-term relationships with our customers 
              and partners.
            </p>
          </div>
          <div className="about__welcome-image">
            <div className="about__image-placeholder">
              🏢
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="about__advantages">
        <div className="about__container">
          <h2>Our Advantages</h2>
          <div className="about__advantages-grid">
            {advantages.map((advantage, index) => (
              <div key={index} className="about__advantage-card">
                <div className="about__advantage-icon">{advantage.icon}</div>
                <h3>{advantage.title}</h3>
                <p>{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="about__why-choose">
        <div className="about__container">
          <h2>Why Choose Us</h2>
          <div className="about__why-grid">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="about__why-card">
                <div className="about__why-number">{item.number}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Message Section */}
      <section className="about__founder">
        <div className="about__container">
          <div className="about__founder-content">
            <div className="about__founder-image">
              <div className="about__founder-placeholder">👨‍💼</div>
            </div>
            <div className="about__founder-text">
              <h2>A Word from Our Founder</h2>
              <p className="about__founder-title">John Smith, Founder & CEO</p>
              <p>
                "When we started this company 15 years ago, our vision was simple: to provide the highest quality 
                products at fair prices, with exceptional customer service. Today, I'm proud to say we've stayed true 
                to that vision.
              </p>
              <p>
                Our success is built on the trust of our customers and the dedication of our team. We continuously 
                innovate and improve to meet the evolving needs of our market. Every product we offer is carefully 
                selected to ensure it meets our strict quality standards.
              </p>
              <p>
                Thank you for being part of our journey. We look forward to serving you and building a lasting 
                relationship with your business.
              </p>
              <p className="about__founder-signature">- John Smith</p>
            </div>
          </div>
        </div>
      </section>

      {/* Manager's Message Section */}
      <section className="about__manager">
        <div className="about__container">
          <div className="about__manager-content">
            <div className="about__manager-text">
              <h2>A Word from Our Manager</h2>
              <p className="about__manager-title">Sarah Johnson, Operations Manager</p>
              <p>
                "Excellence in operations is the backbone of our success. Our team works tirelessly to ensure 
                that every order is processed efficiently and delivered on time. We believe that operational 
                excellence directly translates to customer satisfaction.
              </p>
              <p>
                We've invested in state-of-the-art systems and trained our team to handle your needs with 
                precision and care. From inventory management to logistics, every step is optimized for your benefit.
              </p>
              <p>
                Our commitment is to make your experience seamless and hassle-free. We're here to support you 
                every step of the way.
              </p>
              <p className="about__manager-signature">- Sarah Johnson</p>
            </div>
            <div className="about__manager-image">
              <div className="about__manager-placeholder">👩‍💼</div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="about__team">
        <div className="about__container">
          <h2>Meet Our Team</h2>
          <p className="about__team-subtitle">
            Our talented team is dedicated to delivering excellence and innovation
          </p>
          <div className="about__team-grid">
            {team.map((member, index) => (
              <div key={index} className="about__team-card">
                <div className="about__team-image">{member.image}</div>
                <h3>{member.name}</h3>
                <p>{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Work Section */}
      <section className="about__ready">
        <div className="about__container">
          <div className="about__ready-content">
            <h2>Ready to Work With Us?</h2>
            <p>
              Join thousands of satisfied customers who trust us for their product needs. 
              Get in touch with our team today and discover how we can help your business grow.
            </p>
            <div className="about__ready-buttons">
              <Link to="/contact" className="about__btn about__btn--primary">
                Get in Touch
              </Link>
              <Link to="/categories" className="about__btn about__btn--secondary">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
