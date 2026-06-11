const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Inject a dummy token to trick ProtectedRoute
    await page.evaluate(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          token: "dummy-token",
          user: {
             id: '123',
             role: 'STUDENT',
             name: 'Test Student',
             email: 'test@student.com'
          },
          isAuthenticated: true
        },
        version: 0
      }));
    });
    
    // Refresh to trigger Dashboard rendering
    console.log('Refreshing to trigger Dashboard...');
    await page.reload({ waitUntil: 'networkidle2' });
    
  } catch(e) {
    console.log('GOTO ERROR:', e.message);
  }
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
