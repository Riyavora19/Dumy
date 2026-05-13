import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const stats = [
    { number: '15+', label: 'Years Experience', icon: '📅' },
    { number: '10K+', label: 'Happy Customers', icon: '😊' },
    { number: '500+', label: 'Products', icon: '📦' },
    { number: '50+', label: 'Brand Partners', icon: '🤝' }
  ];

  const values = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: 'Quality First',
      description: 'We never compromise on quality. Every product is carefully selected and tested to meet our high standards.'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: 'Customer Centric',
      description: 'Your satisfaction drives everything we do. We listen, adapt, and deliver solutions that exceed expectations.'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: 'Innovation',
      description: 'We continuously evolve and embrace new technologies to provide you with the best products and services.'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: 'Trust & Integrity',
      description: 'We build lasting relationships through transparency, honesty, and ethical business practices.'
    }
  ];

  const milestones = [
    { year: '2008', title: 'Company Founded', description: 'Started with a vision to revolutionize the industry' },
    { year: '2012', title: 'Expanded Operations', description: 'Opened new facilities and expanded product range' },
    { year: '2016', title: 'Digital Transformation', description: 'Launched e-commerce platform and online services' },
    { year: '2020', title: 'Industry Leader', description: 'Recognized as a leading provider in the market' },
    { year: '2024', title: 'Continued Growth', description: 'Serving 10,000+ customers with 500+ products' }
  ];

  const services = [
    {
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery across the country with real-time tracking'
    },
    {
      icon: '💳',
      title: 'Flexible Payment',
      description: 'Multiple payment options including credit terms for businesses'
    },
    {
      icon: '🔧',
      title: 'Installation Support',
      description: 'Professional installation guidance and technical support'
    },
    {
      icon: '♻️',
      title: 'Easy Returns',
      description: 'Hassle-free return policy with full refund guarantee'
    },
    {
      icon: '📞',
      title: '24/7 Support',
      description: 'Round-the-clock customer service for all your queries'
    },
    {
      icon: '🎓',
      title: 'Expert Consultation',
      description: 'Free consultation from our product specialists'
    }
  ];

  return (
    <main className="about">
      {/* Hero Section */}
      <section className="about__hero">
        <div className="about__hero-overlay"></div>
        <div className="about__container">
          <div className="about__hero-content">
            <span className="about__hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              About Gujarat Tube & Sanitary Stores
            </span>
            <h1>Building Trust Through Quality & Excellence</h1>
            <p>
              For over 15 years, we've been Gujarat's premier destination for premium bathroom, kitchen, 
              and sanitary products. Our commitment to quality and customer satisfaction has made us 
              the trusted choice for thousands of homes and businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about__stats">
        <div className="about__container">
          <div className="about__stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="about__stat-card">
                <div className="about__stat-icon">{stat.icon}</div>
                <div className="about__stat-number">{stat.number}</div>
                <div className="about__stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about__story">
        <div className="about__container">
          <div className="about__story-content">
            <div className="about__story-text">
              <span className="section-badge">Our Story</span>
              <h2>From Humble Beginnings to Industry Leadership</h2>
              <p>
                Founded in 2008, Gujarat Tube & Sanitary Stores began with a simple mission: to provide 
                high-quality sanitary and bathroom products to the people of Gujarat. What started as a 
                small retail store has grown into one of the region's most trusted suppliers.
              </p>
              <p>
                Our founder recognized a gap in the market for reliable, quality products backed by 
                exceptional customer service. Today, we partner with leading brands like Kohler, Jaguar, 
                Parryware, and many more to bring you the finest products at competitive prices.
              </p>
              <p>
                We've built our reputation on three pillars: quality products, fair pricing, and 
                outstanding customer service. Every member of our team is committed to ensuring your 
                complete satisfaction.
              </p>
            </div>
            <div className="about__story-image">
              <div className="about__story-card about__story-card--1">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="about__story-card about__story-card--2">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about__values">
        <div className="about__container">
          <div className="about__values-header">
            <span className="section-badge">Our Values</span>
            <h2>What Drives Us Forward</h2>
            <p>Our core values guide every decision we make and every interaction we have</p>
          </div>
          <div className="about__values-grid">
            {values.map((value, index) => (
              <div key={index} className="about__value-card">
                <div className="about__value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="about__timeline">
        <div className="about__container">
          <div className="about__timeline-header">
            <span className="section-badge">Our Journey</span>
            <h2>Milestones That Define Us</h2>
          </div>
          <div className="about__timeline-content">
            {milestones.map((milestone, index) => (
              <div key={index} className="about__timeline-item">
                <div className="about__timeline-year">{milestone.year}</div>
                <div className="about__timeline-details">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="about__services">
        <div className="about__container">
          <div className="about__services-header">
            <span className="section-badge">What We Offer</span>
            <h2>Comprehensive Services for Your Needs</h2>
            <p>Beyond products, we provide complete solutions and support</p>
          </div>
          <div className="about__services-grid">
            {services.map((service, index) => (
              <div key={index} className="about__service-card">
                <div className="about__service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about__cta">
        <div className="about__container">
          <div className="about__cta-content">
            <h2>Ready to Experience the Difference?</h2>
            <p>
              Join thousands of satisfied customers who trust us for their bathroom and kitchen needs. 
              Let's build something beautiful together.
            </p>
            <div className="about__cta-buttons">
              <Link to="/categories" className="about__cta-btn about__cta-btn--primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Explore Products
              </Link>
              <Link to="/contact" className="about__cta-btn about__cta-btn--secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
