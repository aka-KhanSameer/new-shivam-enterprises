document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Sticky Header ---
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- 2. Mobile Menu Navigation ---
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuBtn.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.querySelector('i').className = 'fa-solid fa-bars';
      });
    });
  }

  // --- 3. Dynamic Product Tab Filter ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const productCards = document.querySelectorAll('.product-card');

  // Map product titles to their categories for robust filtering
  const productCategories = {
    "cctv surveillance": "cctv",
    "recording systems": "cctv",
    "access control": "access",
    "biometric attendance": "access",
    "video door phones": "amc",
    "office networking": "networking",
    "security accessories": "networking",
    "amc services": "amc"
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button styling
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');

      // Filter product card displays
      productCards.forEach(card => {
        const titleEl = card.querySelector('.product-title');
        if (!titleEl) return;
        
        const title = titleEl.textContent.trim().toLowerCase();
        const cardCategory = productCategories[title] || "other";

        if (targetTab === 'all' || cardCategory === targetTab) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 4. Bind "Query Product" Buttons to Form Fill ---
  const queryBtns = document.querySelectorAll('.product-card .btn-outline');
  queryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.product-card');
      const titleEl = card.querySelector('.product-title');
      if (!titleEl) return;

      const title = titleEl.textContent.trim();
      
      // Map product names to form checkbox values
      let checkboxValue = "";
      if (title.includes("CCTV")) checkboxValue = "CCTV Installation";
      else if (title.includes("Recording")) checkboxValue = "CCTV Installation";
      else if (title.includes("Access")) checkboxValue = "Access Control";
      else if (title.includes("Biometric")) checkboxValue = "Biometric System";
      else if (title.includes("Door Phone")) checkboxValue = "Video Door Phone";
      else if (title.includes("Networking")) checkboxValue = "Networking";
      else if (title.includes("Accessories")) checkboxValue = "Networking";
      else if (title.includes("AMC")) checkboxValue = "AMC";
      else checkboxValue = "Other";

      // Select matching checkbox in the form
      const checkboxes = document.querySelectorAll('#enquiryForm input[name="services"]');
      checkboxes.forEach(cb => {
        if (cb.value === checkboxValue) {
          cb.checked = true;
        } else {
          cb.checked = false; // Reset others to focus on queried product
        }
      });

      // Fill additional details text area
      const textRequirements = document.getElementById('additionalRequirements');
      if (textRequirements) {
        textRequirements.value = `Interested in acquiring a quotation for: ${title}. Please contact me.`;
      }
    });
  });

  // --- 5. Form Validation & Local Storage CRM Storage ---
  const enquiryForm = document.getElementById('enquiryForm');
  let submissionAction = 'quote'; // Default button action

  if (enquiryForm) {
    // Detect which button triggered submit
    const btnQuote = document.getElementById('btnQuote');
    const btnSurvey = document.getElementById('btnSurvey');

    if (btnQuote) btnQuote.addEventListener('click', () => submissionAction = 'quote');
    if (btnSurvey) btnSurvey.addEventListener('click', () => submissionAction = 'survey');

    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect field values
      const name = document.getElementById('fullName').value.trim();
      const mobile = document.getElementById('mobileNumber').value.trim();
      const email = document.getElementById('emailAddress').value.trim();
      const city = document.getElementById('city').value.trim();
      const state = document.getElementById('state').value.trim();
      const property = document.getElementById('propertyType').value;
      const requirements = document.getElementById('additionalRequirements').value.trim();

      // Collect checked services
      const selectedServices = [];
      const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked');
      serviceCheckboxes.forEach(cb => {
        selectedServices.push(cb.value);
      });

      // Validation check for services (at least one checkbox must be checked)
      if (selectedServices.length === 0) {
        alert("Please select at least one service/product you are interested in.");
        return;
      }

      // Prepare lead payload
      const leadPayload = {
        id: 'lead_' + Date.now(),
        date: new Date().toISOString(),
        name: name,
        mobile: mobile,
        email: email,
        city: city,
        state: state,
        property: property,
        services: selectedServices,
        requirements: requirements,
        actionType: submissionAction
      };

      // Retrieve existing leads database or create new
      let leadsDb = [];
      try {
        const storedLeads = localStorage.getItem('nse_leads');
        if (storedLeads) {
          leadsDb = JSON.parse(storedLeads);
        }
      } catch (err) {
        console.error("Error reading localStorage database:", err);
      }

      // Add new lead and store
      leadsDb.unshift(leadPayload);
      localStorage.setItem('nse_leads', JSON.stringify(leadsDb));

      // Trigger tracking tags simulation logs
      console.log("Saving lead to localStorage CRM database:", leadPayload);
      console.log("Fired GTM Trigger: lead_form_submit");
      
      // Web3Forms API Email Delivery Configuration
      // Note: To activate live email alerts, paste your Web3Forms Access Key here.
      // Get a free key instantly by putting your email at https://web3forms.com/
      const WEB3FORMS_ACCESS_KEY = "f7308574-f69a-40f8-8aed-c62b7a9d4a11";

      if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
        const formData = new FormData();
        formData.append("access_key", WEB3FORMS_ACCESS_KEY);
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", mobile);
        formData.append("subject", `New Shivam Enterprises - ${submissionAction === 'survey' ? 'Site Survey' : 'Quote Request'} from ${name}`);
        formData.append("message", `
New Security Enquiry Details:
------------------------------------------
Name: ${name}
Mobile: ${mobile}
Email: ${email}
Location: ${city}, ${state}
Property Type: ${property}
Enquiry Type: ${submissionAction === 'survey' ? 'Site Survey' : 'Price Quote'}
Interested In: ${selectedServices.join(', ')}
Requirements: ${requirements}
        `);

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        }).catch(err => console.error("Web3Forms transmission error:", err));
      }

      // Get directory path of the current page dynamically to prevent 404s on subfolders
      let path = window.location.pathname;
      if (path.endsWith('index.html')) {
        path = path.substring(0, path.length - 10); // Strip 'index.html'
      }
      if (!path.endsWith('/')) {
        path += '/';
      }
      const redirectUrl = `${path}thank-you.html?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(mobile)}&action=${submissionAction}`;
      window.location.href = redirectUrl;
    });
  }
});
