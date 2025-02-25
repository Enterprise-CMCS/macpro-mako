// import { useEffect, useState } from "react";

import { SubNavHeader } from "@/components";
import LeftNavigation from "./content/navigationBar";

export const  NewFaq = (props : any) => {
  return (
    <div className="min-h-screen flex flex-col">     
      <SubNavHeader>       
        <h1 className="text-xl font-medium">Frequently Asked Questions</h1>     
      </SubNavHeader>      
      
      {/* Main Layout Wrapper with explicit widths */}     
      <div className="max-w-screen-xl m-auto px-4 lg:px-8 pt-8 w-full">
        <div className="flex">
          {/* Left Navigation - Fixed width with explicit max-width */}       
          <div className="w-64 max-w-64 sticky top-0 h-[calc(100vh-4rem)] pt-4">         
            <LeftNavigation />       
          </div>        
          
          {/* Content - Force minimum width */}       
          <div className="flex-1 min-w-[400px] pl-6">         
            <article className="mb-8 bg-gray-100 min-h-[500px] p-4">           
              <h2 className="text-2xl mb-4">FAQ Content Goes Here</h2>
              <p>This is a placeholder for the actual FAQ content.</p>        
            </article>       
          </div>
        </div>
      </div>
    </div>
  );
};
