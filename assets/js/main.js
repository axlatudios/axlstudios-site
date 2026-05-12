import { setupAdaptiveVideos } from "./modules/adaptive-videos.js";
import { setupServicesTrack } from "./modules/services-track.js";
import { setupMobileMenu } from "./modules/mobile-menu.js";
import { setupFaq } from "./modules/faq.js";
import { setupContactForm } from "./modules/contact-form.js";
import { setupSelects } from "./modules/selects.js";
import { setupHomeLogo } from "./modules/home-logo.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

setupAdaptiveVideos({ prefersReducedMotion });
setupServicesTrack({ prefersReducedMotion });
setupMobileMenu();
setupFaq();
setupContactForm();
setupSelects();
setupHomeLogo({ prefersReducedMotion });
