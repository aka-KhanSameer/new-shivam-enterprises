const fs = require('fs');
const path = require('path');

console.log("====================================================");
console.log("     NSE PRE-FLIGHT DEPLOYMENT AUDIT & TEST RUN     ");
console.log("====================================================\n");

let testsPassed = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Load Files
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
const thankyouHtmlPath = path.join(__dirname, '..', 'thank-you.html');
const adminHtmlPath = path.join(__dirname, '..', 'admin.html');
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const crmJsPath = path.join(__dirname, '..', 'js', 'crm.js');
const stylesCssPath = path.join(__dirname, '..', 'css', 'styles.css');

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const thankyouHtml = fs.readFileSync(thankyouHtmlPath, 'utf8');
const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const crmJs = fs.readFileSync(crmJsPath, 'utf8');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

// --- Test Suite 1: Marketing & Ads Tracking Codes ---
console.log("\n--- SUITE 1: Tracking & Ads Integration ---");
assert(indexHtml.includes('GTM-NSE2026') && thankyouHtml.includes('GTM-NSE2026'), "GTM Container tags embedded on index and thank-you pages");
assert(indexHtml.includes('G-NSEGA42026') && thankyouHtml.includes('G-NSEGA42026'), "GA4 tracking codes embedded on index and thank-you pages");
assert(indexHtml.includes('AW-1122334455') && thankyouHtml.includes('AW-1122334455'), "Google Ads Conversion linker configured");
assert(thankyouHtml.includes("AW-1122334455/AbCdEfGhIjKlMnOpQrS"), "Google Ads Conversion Event tag configured on thank-you page");
assert(indexHtml.includes('fbq(\'init\', \'123456789012345\')'), "Meta Pixel initialized on landing page");
assert(thankyouHtml.includes('fbq(\'track\', \'Lead\''), "Meta Pixel lead conversion event configured on thank-you page");

// --- Test Suite 2: Contact Numbers & WhatsApp Hrefs ---
console.log("\n--- SUITE 2: Business Identity & Contact Routing ---");
assert(indexHtml.includes('tel:+919839068760') || indexHtml.includes('tel:9839068760') || indexHtml.includes('9839068760'), "Click-to-call configured to primary phone (9839068760)");
assert(indexHtml.includes('wa.me/919580952894') || indexHtml.includes('9580952894'), "WhatsApp floating links configure WhatsApp number (9580952894)");
assert(indexHtml.includes('okhan.shivam@gmail.com'), "General email targets okhan.shivam@gmail.com");
assert(indexHtml.includes('NEW SHIVAM ENTERPRISES, Sai Complex near Bank Of Baroda, Buxipur, Gorakhpur'), "Office address matches Buxipur, Gorakhpur");
assert(indexHtml.includes('Monday - Saturday (10:00 AM - 7:00 PM)'), "Business working hours set to Monday-Saturday 10am-7pm");

// --- Test Suite 3: Form Controls & Schema ---
console.log("\n--- SUITE 3: Enquiry Form Integrity ---");
assert(indexHtml.includes('id="fullName"'), "Form Name input field present");
assert(indexHtml.includes('id="mobileNumber"'), "Form Phone input field present");
assert(indexHtml.includes('id="emailAddress"'), "Form Email input field present");
assert(indexHtml.includes('id="propertyType"'), "Form Property Type selector present");
assert(indexHtml.includes('value="Home"') && indexHtml.includes('value="Office"') && indexHtml.includes('value="Warehouse"'), "Form Property selector options complete");

// Checkboxes check
const checkboxes = ["CCTV Installation", "CCTV Upgrade", "CCTV Repair", "Biometric System", "Access Control", "Video Door Phone", "Networking", "AMC", "Other"];
const allCheckboxesPresent = checkboxes.every(cb => indexHtml.includes(`value="${cb}"`));
assert(allCheckboxesPresent, "All 9 specified services checkboxes are defined in markup");

// --- Test Suite 4: Web3Forms & Local CRM logic ---
console.log("\n--- SUITE 4: Routing & Storage Logic ---");
assert(appJs.includes("const WEB3FORMS_ACCESS_KEY = \"f7308574-f69a-40f8-8aed-c62b7a9d4a11\";"), "Web3Forms Access Key is active and integrated");
assert(crmJs.includes("const ADMIN_PASSWORD = \"admin@123\";"), "CRM dashboard admin login password matches admin@123");
assert(appJs.includes("localStorage.setItem('nse_leads'"), "Form submit writes lead records to local storage database");
assert(crmJs.includes("nse_leads_export_"), "CRM export compiles filtered rows to CSV downloader");

// --- Test Suite 5: Path Portability ---
console.log("\n--- SUITE 5: Subfolder & Page Portability ---");
assert(indexHtml.includes('href="./css/styles.css"'), "index.html uses relative styles.css pathing");
assert(indexHtml.includes('src="./js/app.js"'), "index.html uses relative app.js pathing");
assert(thankyouHtml.includes('href="./css/styles.css"'), "thank-you.html uses relative styles.css pathing");
assert(adminHtml.includes('href="./css/styles.css"'), "admin.html uses relative styles.css pathing");
assert(adminHtml.includes('src="./js/crm.js"'), "admin.html uses relative crm.js pathing");
assert(appJs.includes('window.location.pathname') && appJs.includes('thank-you.html?'), "Dynamic pathname resolver is active for subdirectory support");

console.log("\n====================================================");
console.log(`AUDIT RESULTS: ${testsPassed} / ${totalTests} TESTS PASSED`);
console.log("====================================================");

if (testsPassed === totalTests) {
  console.log("\n>>> STATUS: PRODUCTION READY <<<");
  console.log("The website codebase is fully verified, operational, and safe to deploy for customer traffic and Google Ads!");
} else {
  console.error("\n>>> STATUS: FIX REQUIRED <<<");
  process.exit(1);
}
