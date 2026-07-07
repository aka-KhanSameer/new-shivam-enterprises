document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const ADMIN_PASSWORD = "admin@123";
  const STORAGE_KEY = "nse_leads";
  const AUTH_KEY = "nse_crm_auth";

  // DOM Elements
  const loginScreen = document.getElementById('loginScreen');
  const crmDashboard = document.getElementById('crmDashboard');
  const loginForm = document.getElementById('crmLoginForm');
  const passwordInput = document.getElementById('adminPassword');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const logoutBtn = document.getElementById('btnCrmLogout');

  const statTotal = document.getElementById('statTotalLeads');
  const statQuotes = document.getElementById('statQuotes');
  const statSurveys = document.getElementById('statSurveys');
  const statCctv = document.getElementById('statCctvLeads');

  const searchInput = document.getElementById('crmSearchInput');
  const filterProperty = document.getElementById('filterProperty');
  const filterAction = document.getElementById('filterAction');
  const leadsBody = document.getElementById('crmLeadsBody');
  const downloadCsvBtn = document.getElementById('btnDownloadCsv');

  let leadsData = [];

  // --- 1. Session Authentication Check ---
  const checkAuth = () => {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === "true";
    if (isAuthenticated) {
      loginScreen.style.display = 'none';
      crmDashboard.style.display = 'block';
      loadLeads();
    } else {
      loginScreen.style.display = 'flex';
      crmDashboard.style.display = 'none';
    }
  };

  // Login handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (passwordInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, "true");
        loginErrorMsg.style.display = 'none';
        passwordInput.value = '';
        checkAuth();
      } else {
        loginErrorMsg.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
      }
    });
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      checkAuth();
    });
  }

  // --- 2. Load Leads Database & Inject Seed Data ---
  const loadLeads = () => {
    let storedLeads = localStorage.getItem(STORAGE_KEY);
    
    if (!storedLeads) {
      // Inject some high-fidelity mock leads on first run so dashboard isn't blank
      const seedLeads = [
        {
          id: 'lead_1',
          date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          name: "Rajesh Kumar",
          mobile: "9812345678",
          email: "rajesh.kumar@gmail.com",
          city: "Gorakhpur",
          state: "Uttar Pradesh",
          property: "Office",
          services: ["CCTV Installation", "Access Control"],
          requirements: "Need 8 IP cameras with face-recognition door lock for our new office near Buxipur.",
          actionType: "survey"
        },
        {
          id: 'lead_2',
          date: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hours ago
          name: "Sonia Sharma",
          mobile: "9988776655",
          email: "sonia.s@outlook.com",
          city: "Golghar, Gorakhpur",
          state: "Uttar Pradesh",
          property: "Home",
          services: ["CCTV Installation", "Video Door Phone"],
          requirements: "Looking for a 4-camera setup with smart video doorbell for independent villa security.",
          actionType: "quote"
        },
        {
          id: 'lead_3',
          date: new Date(Date.now() - 3600000 * 30).toISOString(), // 30 hours ago
          name: "Amit Patel",
          mobile: "9876543219",
          email: "amit.patel@patelindustries.com",
          city: "GIDA, Gorakhpur",
          state: "Uttar Pradesh",
          property: "Factory",
          services: ["CCTV Upgrade", "Biometric System", "AMC"],
          requirements: "Need to replace 16 old analog cameras with IP PTZ setups and integrate a biometric cloud attendance reader for 120 staff in our GIDA unit.",
          actionType: "quote"
        },
        {
          id: 'lead_4',
          date: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
          name: "Vikram Malhotra",
          mobile: "9001122334",
          email: "v.malhotra@yahoo.com",
          city: "Shahpur, Gorakhpur",
          state: "Uttar Pradesh",
          property: "Warehouse",
          services: ["CCTV Installation", "Networking", "AMC"],
          requirements: "New logistics warehouse. Need structured cabling, high range router configuration, and 12 bullet cameras with night vision.",
          actionType: "survey"
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedLeads));
      storedLeads = JSON.stringify(seedLeads);
    }

    try {
      leadsData = JSON.parse(storedLeads);
    } catch (e) {
      console.error("Failed to parse stored leads:", e);
      leadsData = [];
    }

    renderDashboard();
  };

  // --- 3. Compute Metrics and Render Dashboard Table ---
  const renderDashboard = () => {
    // 3.1 Calculate Metrics
    const totalLeadsCount = leadsData.length;
    const quotesCount = leadsData.filter(l => l.actionType === 'quote').length;
    const surveysCount = leadsData.filter(l => l.actionType === 'survey').length;
    
    // Count CCTV leads (installation, upgrade, repair)
    const cctvCount = leadsData.filter(l => 
      l.services.some(s => s.toLowerCase().includes('cctv'))
    ).length;

    // Update Counter DOM elements
    statTotal.textContent = totalLeadsCount;
    statQuotes.textContent = quotesCount;
    statSurveys.textContent = surveysCount;
    statCctv.textContent = cctvCount;

    // 3.2 Fetch filter inputs
    const query = searchInput.value.trim().toLowerCase();
    const propFilter = filterProperty.value;
    const actionFilter = filterAction.value;

    // Filter leads array
    const filteredLeads = leadsData.filter(lead => {
      // Text Search query match
      const textMatch = 
        lead.name.toLowerCase().includes(query) ||
        lead.mobile.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.city.toLowerCase().includes(query) ||
        lead.state.toLowerCase().includes(query);
      
      // Property filter match
      const propertyMatch = propFilter === 'all' || lead.property === propFilter;

      // Action type filter match
      const actionMatch = actionFilter === 'all' || lead.actionType === actionFilter;

      return textMatch && propertyMatch && actionMatch;
    });

    // Clear loading row
    leadsBody.innerHTML = '';

    if (filteredLeads.length === 0) {
      leadsBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center" style="padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
            No matching leads found in local CRM database.
          </td>
        </tr>
      `;
      return;
    }

    // Populate rows
    filteredLeads.forEach(lead => {
      const row = document.createElement('tr');

      // Format Date
      const dateFormatted = new Date(lead.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Property style class mapping
      const propClass = `badge-property badge-prop-${lead.property.toLowerCase()}`;
      
      // Action Type formatting
      const actionBadge = lead.actionType === 'survey' 
        ? `<span style="color:var(--accent); font-weight:700;"><i class="fa-solid fa-calendar-check"></i> Survey</span>`
        : `<span style="color:var(--secondary); font-weight:700;"><i class="fa-solid fa-file-invoice-dollar"></i> Quote</span>`;

      // Services tags formatting
      const servicesHtml = lead.services.map(s => 
        `<span class="category-tag">${s}</span>`
      ).join('');

      row.innerHTML = `
        <td style="white-space: nowrap; font-size:0.8rem; color:var(--text-muted);">${dateFormatted}</td>
        <td style="font-weight: 700; color:var(--primary);">${lead.name}</td>
        <td>
          <div style="font-weight:600;"><i class="fa-solid fa-phone" style="font-size:0.75rem; color:var(--secondary); margin-right:4px;"></i> <a href="tel:${lead.mobile}">${lead.mobile}</a></div>
          <div style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-envelope" style="font-size:0.75rem; color:var(--accent); margin-right:4px;"></i> <a href="mailto:${lead.email}">${lead.email}</a></div>
        </td>
        <td>
          <div style="font-weight:600;">${lead.city}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${lead.state}</div>
        </td>
        <td><span class="${propClass}">${lead.property}</span></td>
        <td>${actionBadge}</td>
        <td><div class="lead-categories">${servicesHtml}</div></td>
        <td style="max-width: 250px; font-size:0.85rem; color:var(--text-dark);">${lead.requirements || '<em style="color:var(--text-muted);">None specified</em>'}</td>
        <td class="text-center">
          <button class="crm-action-btn btn-delete" data-id="${lead.id}" title="Delete Lead">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

      leadsBody.appendChild(row);
    });

    // Attach delete event listeners
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this enquiry from CRM?")) {
          deleteLead(id);
        }
      });
    });
  };

  // Delete handler
  const deleteLead = (leadId) => {
    leadsData = leadsData.filter(l => l.id !== leadId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leadsData));
    renderDashboard();
  };

  // --- 4. Export Filtered Table to CSV Spreadsheet ---
  const exportToCsv = () => {
    // Collect filtered elements
    const query = searchInput.value.trim().toLowerCase();
    const propFilter = filterProperty.value;
    const actionFilter = filterAction.value;

    const filtered = leadsData.filter(lead => {
      const textMatch = 
        lead.name.toLowerCase().includes(query) ||
        lead.mobile.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.city.toLowerCase().includes(query) ||
        lead.state.toLowerCase().includes(query);
      const propertyMatch = propFilter === 'all' || lead.property === propFilter;
      const actionMatch = actionFilter === 'all' || lead.actionType === actionFilter;
      return textMatch && propertyMatch && actionMatch;
    });

    if (filtered.length === 0) {
      alert("No leads available to export.");
      return;
    }

    // CSV Headers
    const headers = ["ID", "Submission Date", "Name", "Mobile Number", "Email Address", "City", "State", "Property Type", "Lead Type", "Interested In", "Requirements"];
    
    // CSV Rows construction
    const rows = filtered.map(lead => [
      lead.id,
      new Date(lead.date).toLocaleString('en-IN'),
      lead.name,
      lead.mobile,
      lead.email,
      lead.city,
      lead.state,
      lead.property,
      lead.actionType,
      lead.services.join('; '),
      lead.requirements.replace(/"/g, '""') // Escape quotes in requirements text
    ]);

    // Build final CSV text
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');

    // Create client anchor trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nse_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bind Event Listeners
  if (searchInput) searchInput.addEventListener('input', renderDashboard);
  if (filterProperty) filterProperty.addEventListener('change', renderDashboard);
  if (filterAction) filterAction.addEventListener('change', renderDashboard);
  if (downloadCsvBtn) downloadCsvBtn.addEventListener('click', exportToCsv);

  // Initialize Auth gating check
  checkAuth();
});
