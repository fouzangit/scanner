import puppeteer from 'puppeteer';

async function run() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to mobile size
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  
  // Log console errors
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR]: ${err.toString()}`);
  });

  try {
    // 1. Navigate to login first to establish domain context
    console.log("Navigating to login...");
    await page.goto('http://localhost:5174/app/login', { waitUntil: 'networkidle0' });
    
    // 2. Set employee object in localStorage
    console.log("Setting logged in employee state in localStorage...");
    await page.evaluate(() => {
      const dummyEmployee = {
        id: '4f7967a5-28e2-43c0-a327-ed0ae95b4f02',
        name: 'fou',
        phone: '8008413250',
        role: 'doctor',
        shift_type: 'both',
        hourly_rate: 100,
        monthly_salary: 100000,
        joining_date: '2026-05-17',
        device_id: '3906ba18-b4cb-4eaf-a3e1-911d8a0ca217',
        allow_multiple_devices: false
      };
      localStorage.setItem('clinic_employee', JSON.stringify(dummyEmployee));
      localStorage.setItem('clinic_device_id', '3906ba18-b4cb-4eaf-a3e1-911d8a0ca217');
    });
    
    // 3. Navigate to /app (Scanner)
    console.log("Navigating to /app...");
    await page.goto('http://localhost:5174/app', { waitUntil: 'networkidle0' });
    
    // Wait for 3 seconds to let any effects run
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("Taking screenshot of /app...");
    await page.screenshot({ path: 'scanner_screenshot.png' });
    console.log("Screenshot saved as scanner_screenshot.png");
    
  } catch (err) {
    console.error("Puppeteer Script Error:", err);
  } finally {
    await browser.close();
  }
}

run();
