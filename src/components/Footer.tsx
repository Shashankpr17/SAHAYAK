import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-low dark:bg-on-surface transition-all duration-200 mt-auto w-full border-t border-outline-variant/10">
      <div className="flex flex-col md:flex-row justify-between items-center py-stack-lg px-4 md:px-margin-desktop max-w-container-max mx-auto w-full gap-4 md:gap-0">
        <div className="text-headline-md font-headline-md text-on-surface dark:text-surface font-bold tracking-tight">
          SAHAYAK
        </div>
        <a 
          className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
};
