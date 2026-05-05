import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#145AA3',
        'brand-blue': '#145AA3',
        'brand-secondary': '#f90',
        'text-primary': 'rgb(33, 37, 41)',
        'text-secondary': 'rgb(51, 51, 51)',
        'text-inverse': 'rgb(255, 255, 255)',
        'text-footer-muted': 'rgba(255, 255, 255, 0.5)',
        'text-footer-soft': 'rgba(255, 255, 255, 0.7)',
        'bg-footer': 'rgb(82 82 82)',
        'bg-language': '#145AA3',
        'hero-overlay': '#000000',
        'border-light': 'rgba(255, 255, 255, 0.33)',
        'border-footer-divider': 'rgba(255, 255, 255, 0.23)',
        brand: {
          primary: 'var(--color-primary)',
          accent: 'var(--color-accent)',
          deep: 'var(--color-primary-deep)',
          soft: 'var(--color-primary-soft)',
        },
        neutral: {
          900: 'var(--color-neutral-900)',
          700: 'var(--color-neutral-700)',
          500: 'var(--color-neutral-500)',
        },
      },
      fontFamily: {
        sans: ['PingFang SC', 'PingFangSC-Regular', 'Microsoft YaHei', 'Noto Sans SC', 'sans-serif'],
        display: ['Impact', 'Helvetica', 'sans-serif'],
        system: ['-apple-system', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'hero-title': ['32px', { lineHeight: '32px', fontWeight: '400' }],
        'hero-slogan': ['58px', { lineHeight: '1.12', fontWeight: '700' }],
        'hero-decoration': ['176px', { lineHeight: '176px' }],
        'nav-link': ['17px', { lineHeight: '82px', fontWeight: '700' }],
        'footer-text': '14px',
        button: '14px',
        'footer-nav-primary': '18px',
        'footer-nav-secondary': '14px',
      },
      spacing: {
        'header-h': '82px',
        'hero-h': 'calc(100vh - 82px)',
        'hero-slogan-mt': '22px',
        'cta-mt': '34px',
        'footer-mx': '38.461px',
        'logo-w': '264px',
        'logo-h': '68px',
        'nav-link-x': '16px',
        'hero-content-w': '90%',
        'content-w': '88%',
        'footer-inner-w': '94%',
        'footer-pt': '3%',
        'footer-pb': '32px',
        'footer-divider-mt': '32px',
        'footer-lower-row-mt': '24px',
        'footer-contact-mt': '20px',
        'footer-logo-max': '185px',
      },
      borderRadius: {
        'cta-pill': '45px',
        'lang-btn': '0px',
      },
      borderWidth: {
        cta: '2px',
      },
      boxShadow: {
        soft: 'var(--shadow-card)',
        header: 'var(--shadow-header)',
        'header-outer': '0 0 15px rgb(0 0 0 / 20%)',
        'cta-hover': '2px 6px 14px rgba(0,0,0,0.1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
      },
      maxWidth: {
        content: '1280px',
        logo: '264px',
        'footer-inner': '1600px',
      },
      screens: {
        'bp-mobile-max': { max: '768px' },
        'bp-tablet-min': '769px',
        'bp-tablet-max': { min: '769px', max: '1024px' },
        'bp-desktop-base': '1366px',
        'bp-desktop-wide-max': { min: '1025px', max: '1440px' },
      },
    },
  },
  plugins: [],
};

export default config;
