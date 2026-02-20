'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitContactForm } from '@/lib/api';
import { toast } from 'sonner';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const checkUser = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        router.push('/dashboard');
      } else {
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      }
    };
    checkUser();
  }, [router]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    
    try {
      const result = await submitContactForm(
        contactForm.name,
        contactForm.email,
        contactForm.message
      );

      if (result.success) {
        setFormSubmitted(true);
        setTimeout(() => {
          setFormSubmitted(false);
          setContactForm({ name: '', email: '', message: '' });
        }, 5000);
      } else {
        setFormError(result.message || 'Failed to send message. Please try again.');
        toast.error(result.message || 'Failed to send message');
      }
    } catch (error) {
      setFormError('Failed to send message. Please try again.');
      toast.error('Failed to send message. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50 backdrop-blur-sm bg-white/90">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-900">MediCare</div>
          <div className="flex gap-6 items-center">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-900 transition">
              Home
            </button>
            <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-900 transition">
              Services
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-900 transition">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-900 transition">
              Contact
            </button>
            <Link href="/login" className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      <div className="pt-16"></div>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h1 className="text-5xl font-bold text-blue-900 mb-6 animate-fade-in">
              Take Control of Your Health
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Access quality healthcare from the comfort of your home. Connect with certified doctors and manage your health journey.
            </p>
            <Link href="/login" className="inline-block px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Get Started
            </Link>
          </div>
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Healthcare Made Easy</h3>
                <p className="text-gray-600">Book appointments, manage prescriptions, and track your health all in one place</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">
                We Are Fully Available To Support You
              </h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">Qualified Doctors</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">Easy Appointment Booking</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">24/7 Medical Services</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">Secure Health Records</span>
                </li>
              </ul>
              <button 
                onClick={() => scrollToSection('about')}
                className="inline-block px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Learn More
              </button>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="text-center">
                <div className="text-8xl mb-6">👨‍⚕️</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Professional Medical Team</h3>
                <p className="text-gray-600 mb-6">Our team of experienced healthcare professionals is dedicated to providing you with the best care possible.</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold text-blue-900">98%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold text-blue-900">15+</div>
                    <div className="text-sm text-gray-600">Years</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold text-blue-900">5K+</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Expert Medical Services at Your Doorstep
            </h2>
            <p className="text-gray-600">Comprehensive healthcare solutions tailored to your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🩺', title: 'General Consultation', desc: 'Expert medical advice' },
              { icon: '💊', title: 'Prescription', desc: 'Digital prescriptions' },
              { icon: '🏥', title: 'Emergency Care', desc: '24/7 emergency support' },
              { icon: '🔬', title: 'Lab Tests', desc: 'Home sample collection' },
              { icon: '💉', title: 'Vaccination', desc: 'Immunization services' },
              { icon: '❤️', title: 'Health Monitoring', desc: 'Track your health' }
            ].map((service, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-4xl mb-4 animate-bounce">{service.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <button className="text-blue-900 font-semibold hover:translate-x-2 transition-transform duration-300 inline-flex items-center">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-lg p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-6 rounded-lg text-center hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-blue-900 mb-2">500+</div>
                    <div className="text-gray-600">Doctors</div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg text-center hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-blue-900 mb-2">10K+</div>
                    <div className="text-gray-600">Patients</div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg text-center hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-blue-900 mb-2">50+</div>
                    <div className="text-gray-600">Specialties</div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg text-center hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-blue-900 mb-2">24/7</div>
                    <div className="text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-blue-900 mb-6">
                About MediCare
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                MediCare is your trusted healthcare partner, providing comprehensive medical services with a focus on accessibility and quality. Our platform connects you with certified healthcare professionals and makes managing your health simple and convenient.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">Certified and experienced doctors</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">Easy appointment scheduling</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">Digital health records</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="text-blue-900 text-2xl group-hover:scale-125 transition-transform duration-300">✓</span>
                  <span className="text-gray-700">24/7 emergency support</span>
                </li>
              </ul>
              <Link href="/register" className="inline-block px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Join Us Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4 animate-fade-in">
              Get In Touch
            </h2>
            <p className="text-gray-600 text-lg">We're here to help and answer any question you might have</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
            <div className="space-y-4">
              <div className="group flex items-start gap-4 p-5 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                  📍
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-1 text-base">Address</h3>
                  <p className="text-gray-600 text-sm">123 Healthcare Street</p>
                  <p className="text-gray-600 text-sm">Medical District, City 12345</p>
                </div>
              </div>
              
              <div className="group flex items-start gap-4 p-5 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                  📞
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-1 text-base">Phone</h3>
                  <p className="text-gray-600 text-sm hover:text-blue-900 transition-colors cursor-pointer">+1 (555) 123-4567</p>
                  <p className="text-gray-600 text-sm hover:text-blue-900 transition-colors cursor-pointer">Emergency: +1 (555) 911-0000</p>
                </div>
              </div>
              
              <div className="group flex items-start gap-4 p-5 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                  ✉️
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-1 text-base">Email</h3>
                  <p className="text-gray-600 text-sm hover:text-blue-900 transition-colors cursor-pointer">support@medicare.com</p>
                  <p className="text-gray-600 text-sm hover:text-blue-900 transition-colors cursor-pointer">info@medicare.com</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 h-full">
              <form onSubmit={handleContactSubmit} className="space-y-4 h-full flex flex-col">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="h-32 resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Button 
                    type="submit"
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    disabled={formSubmitted || formLoading}
                  >
                    {formLoading ? 'Sending...' : formSubmitted ? '✓ Message Sent!' : 'Send Message'}
                  </Button>
                  {formSubmitted && (
                    <p className="text-sm text-green-600 text-center">
                      Thank you! We'll get back to you soon. Check your email for confirmation.
                    </p>
                  )}
                  {formError && (
                    <p className="text-sm text-red-600 text-center">
                      {formError}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MediCare</h3>
              <p className="text-blue-200 mb-4">Your trusted healthcare partner for a healthier tomorrow</p>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-xl">f</span>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-xl">𝕏</span>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-xl">📷</span>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-xl">in</span>
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-xl">▶</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-blue-200">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition">Home</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition">Services</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition">About</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-blue-200">
                <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-blue-200">support@medicare.com</p>
              <p className="text-blue-200">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
            <p>© 2024 MediCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
