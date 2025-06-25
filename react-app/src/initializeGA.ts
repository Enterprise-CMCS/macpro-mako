
async function initializeGA() {
    console.log("initialize GA called")
    try {
      const res = await fetch('/env.json');
      const text = await res.text();
  
      const json = JSON.parse(text);
      const GA_ID = json.VITE_GOOGLE_ANALYTICS_GTAG;
      if (!GA_ID) {
        console.warn('No GA_ID found in env.json');
        return;
      }
  
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;
      document.head.appendChild(script);
  
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
  
      gtag('js', new Date());
      gtag('set', { debug_mode: false });
  
      console.log('GA initialized with ID:', GA_ID);
    } catch (e) {
      console.warn('Invalid JSON or failed to parse /env.json');
    }
  }
  
  initializeGA();
  