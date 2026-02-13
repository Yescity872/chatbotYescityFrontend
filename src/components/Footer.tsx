'use client';

import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-blue-100 text-gray-800">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* About */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">About YesCity</h4>
            <p className="text-sm leading-relaxed text-gray-700">
              Discover vibrant cities of India with YesCity. Explore famous places, foods, and
              activities. Plan and book your trip with ease.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block rounded-md bg-[#187bc7] px-3 py-1.5 text-sm font-medium text-white transition hover:shadow-md"
            >
              About YesCity
            </Link>
          </div>

          {/* Explore More */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">Explore More</h4>
            <p className="mb-3 text-sm text-gray-700">
              Planning your next adventure? Let YesCity guide you to hidden gems across India.
            </p>
            <Link
              href="/chatbot"
              className="mt-4 inline-block rounded-md bg-[#187bc7] px-3 py-1.5 text-sm font-medium text-white transition hover:shadow-md"
            >
              Explore Now
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/contact', label: 'Contact Us' },
                { href: '/terms-and-condition', label: 'Terms of Use' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/refund-cancellation', label: 'Refund & Cancellation' },
                { href: '/shipping-delivery', label: 'Shipping & Delivery' },
                { href: '/disclaimer', label: 'Disclaimer' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-blue-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Cities */}
          <div>
            <h4 className="mb-3 text-lg font-semibold">Explore Cities</h4>
            <ul className="space-y-2 text-sm">
              {['Varanasi', 'Agra', 'Rishikesh', 'Mahabaleshwar', 'Kolkata'].map((city) => (
                <li key={city}>
                  <Link
                    href={`/chatbot/${city}`}
                    className="transition hover:text-blue-600"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-300 pt-4 text-sm text-gray-600 sm:flex-row">
          {/* Social Media */}
          <div className="mb-3 flex space-x-4 sm:mb-0">
            <a
              href="https://www.facebook.com/profile.php?id=61564192540540"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-600"
              aria-label="Facebook"
            >
              <FaFacebookF className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/yescity.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-600"
              aria-label="Instagram"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/yes-city-ltd/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-600"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center sm:text-right">
            &copy; {new Date().getFullYear()} YesCity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
