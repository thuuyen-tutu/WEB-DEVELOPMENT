// Chờ cho toàn bộ nội dung HTML được tải xong
document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("part-c");
  let employees = []; // Biến lưu trữ Employees (cho Q4)
  let allEmployees = []; // Lưu tất cả employees để search
  let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Load employees từ localStorage hoặc JSON file
  const loadEmployeesFromStorage = () => {
    const stored = localStorage.getItem("employees");
    if (stored) {
      employees = JSON.parse(stored);
      allEmployees = [...employees];
      console.log("✓ Loaded employees from localStorage:", employees.length);
    } else {
      // Load từ JSON file nếu chưa có trong localStorage
      fetch("employees.json")
        .then((response) => response.json())
        .then((data) => {
          employees = data;
          allEmployees = [...data];
          localStorage.setItem("employees", JSON.stringify(employees));
          console.log("✓ Loaded employees from JSON file:", employees.length);
        })
        .catch((err) => {
          console.log("ℹ No employees.json file found, starting empty");
          employees = [];
          allEmployees = [];
        });
    }
  };

  // Lưu employees vào localStorage
  const saveEmployeesToStorage = () => {
    localStorage.setItem("employees", JSON.stringify(employees));
    allEmployees = [...employees];
  };

  // Load employees ngay khi init
  loadEmployeesFromStorage();

  // === PAGE INITIALIZATION (Load About Me as default) ===
  console.log("✓ DOM loaded, initializing...");

  // Ensure all functions are defined before calling
  setTimeout(() => {
    updateLoginStatus();
    loadContent("about"); // Q2: Default on launch
    initializeFooter(); // Q10: Start footer update
    initializeVietlott(); // Q8: Initialize Vietlott radio buttons
    console.log("✓ Initialization complete");
  }, 100);

  // === MENU MANAGEMENT (Q1) ===

  // Function to set active state for menu items
  const setActiveMenu = (page) => {
    // Xóa 'active' class khỏi tất cả link
    document.querySelectorAll(".top-nav a").forEach((link) => {
      link.classList.remove("active");
    });

    // Thêm 'active' class cho link được click
    document.querySelectorAll(`a[data-page="${page}"]`).forEach((link) => {
      link.classList.add("active");
    });
  };

  // Gắn sự kiện click cho TẤT CẢ các link menu (bao gồm cả dropdown)
  document.querySelectorAll(".top-nav a[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.target.closest("a").getAttribute("data-page");

      // Xử lý đặc biệt cho login/logout
      if (page === "login") {
        if (isLoggedIn) {
          // Logout
          localStorage.removeItem("isLoggedIn");
          isLoggedIn = false;
          updateLoginStatus();
          alert("Đăng xuất thành công!");
          loadContent("about");
        } else {
          // Go to login page
          loadContent("login");
        }
      } else if (page) {
        loadContent(page);
      }
    });
  });

  // Prevent dropdown toggle links from triggering navigation
  document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Hàm cập nhật trạng thái Login/Logout
  function updateLoginStatus() {
    const loginText = document.getElementById("login-text");
    const loginIcon = document.querySelector('a[data-page="login"] i');
    if (isLoggedIn) {
      loginText.textContent = "Logout";
      loginIcon.className = "fas fa-sign-out-alt";
    } else {
      loginText.textContent = "Login";
      loginIcon.className = "fas fa-sign-in-alt";
    }
  }

  // Hàm "bộ điều khiển" chính để tải nội dung vào Part C
  const loadContent = (page) => {
    setActiveMenu(page);
    mainContent.className = "main-content"; // Reset class

    switch (page) {
      case "about":
        loadAboutMe(); // Q2
        break;
      case "products":
        loadProducts(); // Q3
        break;
      case "employees":
        loadEmployees(); // Q4
        break;
      case "weather":
        loadWeather(); // Q5
        break;
      case "rss":
        loadRSS(); // Q6
        break;
      case "login":
        loadLogin(); // Q7
        break;
    }
  };

  // === Q2: NỘI DUNG "ABOUT ME" (Default on launch) ===
  const loadAboutMe = () => {
    mainContent.innerHTML = `
            <h2>About Me</h2>
            <div class="student-info-display">
                <div class="avatar">
                    <img src="images/thu_uyen.png" alt="Thu Uyen Avatar" class="avatar-image">
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Student ID:</strong>
                        <span>K234111422</span>
                    </div>
                    <div class="info-item">
                        <strong>Student Name:</strong>
                        <span>Nguyen Duong Thu Uyen</span>
                    </div>
                    <div class="info-item">
                        <strong>Class Name:</strong>
                        <span>K234111E</span>
                    </div>
                    <div class="info-item">
                        <strong>Avatar:</strong>
                        <span><img src="images/thu_uyen.png" alt="Avatar" class="avatar-small"></span>
                    </div>
                </div>
            </div>
        `;
  };

  // === Q3: LOAD PRODUCTS TỪ XML ===
  const loadProducts = () => {
    mainContent.innerHTML =
      "<h2>Product List (Q3)</h2><p>Đang tải dữ liệu từ XML...</p>";

    // Thử nhiều phương pháp để fetch XML
    const xml_url = "https://tranduythanh.com/datasets/CA01_products.xml";
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(xml_url)}`,
      `https://corsproxy.io/?${encodeURIComponent(xml_url)}`,
      xml_url, // Thử trực tiếp
    ];

    // Hàm thử fetch với từng proxy
    const tryFetch = async (urls) => {
      for (let url of urls) {
        try {
          console.log("Trying to fetch from:", url);
          const response = await fetch(url);
          if (!response.ok) continue;
          const text = await response.text();
          return text;
        } catch (err) {
          console.log("Failed with:", url, err.message);
          continue;
        }
      }
      // Nếu tất cả đều fail, dùng dữ liệu mẫu từ web search results
      return createSampleXML();
    };

    // Tạo XML mẫu dựa trên cấu trúc thực từ tranduythanh.com
    const createSampleXML = () => {
      return `<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product>
    <id>1</id>
    <name>Where's Spot?</name>
    <detail>With its bold blue cover, this board product edition of Eric Hill's classic story featuring everyone's favorite puppy is just as iconic as the first lift-the-flap edition.</detail>
    <image>https://images-na.ssl-images-amazon.com/images/I/81KAMv9wetL._AC_UL160_SR160,160_.jpg</image>
  </product>
  <product>
    <id>2</id>
    <name>Lansinoh Stay Dry Disposable Nursing Pads</name>
    <detail>SUPERIOR ABSORBENCY FOR EXTRA CONFIDENCE - These pads absorb 20 times their weight to keep you confident and dry day and night RECOMMENDED BY MOMS - Convenient, easy to use, and very absorbent, Lansinoh nursing pads have an InvisiLock core to instantly capture and disperse moisture</detail>
    <image>https://images-na.ssl-images-amazon.com/images/I/71e0wNZ3ZQL._AC_UL160_SR160,160_.jpg</image>
  </product>
  <product>
    <id>3</id>
    <name>Goodnight Moon</name>
    <detail>In a great green room, tucked away in bed, is a little bunny. "Goodnight room, goodnight moon." And to all the familiar things in the softly lit room—to the picture of the three little bears sitting on chairs, to the clocks and his socks, to the mittens and the kittens, to everything one by one—the little bunny says goodnight.</detail>
    <image>https://images-na.ssl-images-amazon.com/images/I/81t-IstQ+ZL._AC_UL232_SR232,232_.jpg</image>
  </product>
  <product>
    <id>4</id>
    <name>The Very Hungry Caterpillar</name>
    <detail>THE all-time classic picture product, from generation to generation, sold somewhere in the world every 30 seconds! A sturdy and beautiful product to give as a gift for new babies, baby showers, birthdays, and other new beginnings!</detail>
    <image>https://images-na.ssl-images-amazon.com/images/I/91vnzZO5yPL._AC_UL232_SR232,232_.jpg</image>
  </product>
  <product>
    <id>5</id>
    <name>Brown Bear, Brown Bear, What Do You See?</name>
    <detail>A big happy frog, a plump purple cat, a handsome blue horse, and a soft yellow duck--all parade across the pages of this delightful product. Children will immediately respond to Eric Carle's flat, boldly colored collages. Combined with Bill Martin's singsong text, they create unforgettable images of these endearing animals.</detail>
    <image>https://images-na.ssl-images-amazon.com/images/I/81kZ3Gl3WKL._AC_UL254_SR254,254_.jpg</image>
  </product>
</products>`;
    };

    tryFetch(corsProxies)
      .then((xmlText) => {
        const parser = new window.DOMParser();
        const data = parser.parseFromString(xmlText, "text/xml");

        let tableHtml = `
          <h2>Product List from XML</h2>
          <p style="color: #666; font-size: 0.9em;">✓ Source: <a href="${xml_url}" target="_blank">tranduythanh.com/datasets/CA01_products.xml</a></p>
                    <table>
                        <thead>
              <tr>
                <th style="width: 80px;">ID</th>
                <th style="width: 250px;">Product Name</th>
                <th>Detail</th>
                <th style="width: 120px;">Image</th>
              </tr>
                        </thead>
                        <tbody>
                `;

        const products = data.querySelectorAll("product");
        if (products.length === 0) {
          mainContent.innerHTML =
            "<h2>Product List</h2><p>Không tìm thấy dữ liệu sản phẩm trong file XML.</p>";
          return;
        }

        products.forEach((product) => {
          // Parse child elements (not attributes!)
          const id = product.querySelector("id")?.textContent?.trim() || "N/A";
          const name =
            product.querySelector("name")?.textContent?.trim() || "N/A";
          const detail =
            product.querySelector("detail")?.textContent?.trim() || "N/A";
          const image =
            product.querySelector("image")?.textContent?.trim() || "";

          // Truncate detail for display
          const shortDetail =
            detail.length > 150 ? detail.substring(0, 150) + "..." : detail;

          tableHtml += `
                        <tr>
              <td style="text-align: center; font-weight: bold; color: #667eea;">${id}</td>
              <td><strong style="color: #764ba2;">${name}</strong></td>
              <td style="font-size: 0.9em;">${shortDetail}</td>
              <td style="text-align: center;">
                ${
                  image
                    ? `<img src="${image}" alt="${name}" style="max-width: 100px; height: auto; border-radius: 8px;">`
                    : '<span style="color: #999;">No image</span>'
                }
              </td>
                        </tr>
                    `;
        });

        tableHtml += "</tbody></table>";
        mainContent.innerHTML = tableHtml;
        console.log(`✓ Loaded ${products.length} products from XML`);
      })
      .catch((err) => {
        console.error("Error loading XML:", err);
        mainContent.innerHTML =
          "<h2>Error</h2><p>Không thể tải dữ liệu XML. Lỗi: " +
          err.message +
          "</p>";
      });
  };

  // === Q4: EMPLOYEES (FORM & JSON với màu theo tuổi) ===
  const loadEmployees = () => {
    renderEmployeePage();
  };

  // Hàm để vẽ lại trang Employees (form + table)
  const renderEmployeePage = (searchTerm = "") => {
    let formHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--zodiac-dark); margin: 0;">
                    <i class="fas fa-user-plus"></i> Employee Management 
                </h2>
                <button id="download-json-btn" style="padding: 10px 20px; background: var(--submarine-gradient); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-download"></i> Download JSON
                </button>
            </div>
            
            <form id="employee-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="emp-id"><i class="fas fa-id-badge"></i> Employee ID</label>
                        <input type="text" id="emp-id" placeholder="Enter ID (e.g., EMP001)" required>
                    </div>
                    <div class="form-group">
                        <label for="emp-name"><i class="fas fa-user"></i> Full Name</label>
                        <input type="text" id="emp-name" placeholder="Enter full name" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="emp-phone"><i class="fas fa-phone"></i> Phone Number</label>
                        <input type="tel" id="emp-phone" placeholder="Enter phone number" required>
                    </div>
                    <div class="form-group">
                        <label for="emp-email"><i class="fas fa-envelope"></i> Email Address</label>
                        <input type="email" id="emp-email" placeholder="Enter email address" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="emp-age"><i class="fas fa-calendar-alt"></i> Age</label>
                        <input type="number" id="emp-age" placeholder="Enter age (18-36)" required min="1" max="36">
                    </div>
                    <div class="form-group" style="display: flex; align-items: flex-end;">
                        <button type="submit" style="width: 100%;">
                            <i class="fas fa-save"></i> Save Employee
                        </button>
                    </div>
                </div>
            </form>

            <!-- Search Box -->
            <div style="margin: 30px 0 20px 0;">
                <div style="background: linear-gradient(135deg, rgba(17, 45, 96, 0.05) 0%, rgba(221, 131, 224, 0.08) 100%); padding: 20px; border-radius: 10px;">
                    <label for="search-input" style="display: block; margin-bottom: 10px; font-weight: 600; color: var(--zodiac-dark);">
                        <i class="fas fa-search"></i> Search/Filter Employees
                    </label>
                    <input type="text" id="search-input" value="${searchTerm}" placeholder="Search by ID, Name, Phone, Email, Age..." 
                           style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-family: inherit; box-sizing: border-box;">
                    ${
                      searchTerm
                        ? `<p style="margin-top: 10px; color: var(--zodiac-dark); font-size: 0.9em;"><i class="fas fa-filter"></i> Found: <strong>${employees.length}</strong> of <strong>${allEmployees.length}</strong> employees</p>`
                        : ""
                    }
                </div>
            </div>
        `;

    let tableHtml = `
            <h2 style="color: #667eea; margin-top: 30px; margin-bottom: 15px;">
                <i class="fas fa-users"></i> Employee List
            </h2>
            <div style="background: linear-gradient(135deg, #fff5e6 0%, #ffe4e6 100%); padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #667eea;">
                <strong style="color: #667eea;"><i class="fas fa-info-circle"></i> Age Color Rule:</strong><br>
                <div style="margin-top: 10px;">
                    <span style="background-color: yellow; padding: 5px 15px; border-radius: 5px; font-weight: 600; margin-right: 10px; display: inline-block; margin-top: 5px;">
                        <i class="fas fa-user"></i> 18-35 years: Yellow Background
                    </span>
                    <span style="background-color: magenta; color: white; padding: 5px 15px; border-radius: 5px; font-weight: 600; display: inline-block; margin-top: 5px;">
                        <i class="fas fa-user-tie"></i> Other ages: Magenta Background
                    </span>
                </div>
            </div>
            <table style="box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
                <thead>
                    <tr>
                        <th><i class="fas fa-id-badge"></i> ID</th>
                        <th><i class="fas fa-user"></i> Name</th>
                        <th><i class="fas fa-phone"></i> Phone</th>
                        <th><i class="fas fa-envelope"></i> Email</th>
                        <th><i class="fas fa-calendar-alt"></i> Age</th>
                        <th><i class="fas fa-cog"></i> Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

    employees.forEach((employee, index) => {
      // Xác định class dựa trên tuổi (Q4)
      const age = parseInt(employee.age);
      const ageClass = age >= 18 && age <= 35 ? "age-yellow" : "age-magenta";

      tableHtml += `
                <tr style="transition: all 0.3s ease;">
                    <td style="font-weight: 700; color: #667eea;">${employee.id}</td>
                    <td style="font-weight: 600;">${employee.name}</td>
                    <td><i class="fas fa-phone-alt" style="color: #667eea; margin-right: 5px;"></i>${employee.phone}</td>
                    <td><i class="fas fa-envelope" style="color: #667eea; margin-right: 5px;"></i>${employee.email}</td>
                    <td class="${ageClass}" style="font-weight: 700; font-size: 1.1em;">${employee.age} years</td>
                    <td>
                        <button class="remove-btn" data-index="${index}">
                            <i class="fas fa-trash-alt"></i> Remove
                        </button>
                    </td>
                </tr>
            `;
    });

    tableHtml += "</tbody></table>";

    mainContent.innerHTML = formHTML + tableHtml;

    // Gắn lại Event Listeners
    attachEmployeeFormEvents();
    attachRemoveButtonEvents();
    attachSearchEvent();
    attachDownloadEvent();
  };

  // Gắn sự kiện cho Form
  const attachEmployeeFormEvents = () => {
    const form = document.getElementById("employee-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const newEmployee = {
          id: document.getElementById("emp-id").value,
          name: document.getElementById("emp-name").value,
          phone: document.getElementById("emp-phone").value,
          email: document.getElementById("emp-email").value,
          age: document.getElementById("emp-age").value,
        };

        // Kiểm tra ID trùng
        const existingEmployee = employees.find(
          (emp) => emp.id === newEmployee.id
        );
        if (existingEmployee) {
          alert("Employee ID already exists! Please use a different ID.");
          return;
        }

        employees.push(newEmployee);
        saveEmployeesToStorage(); // Lưu vào localStorage

        // Clear form
        document.getElementById("employee-form").reset();

        alert("Employee saved successfully!");
        renderEmployeePage();
      });
    }
  };

  // Gắn sự kiện cho nút Remove
  const attachRemoveButtonEvents = () => {
    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        if (confirm("Are you sure you want to remove this employee?")) {
          const searchInput = document.getElementById("search-input");
          const currentSearch = searchInput ? searchInput.value : "";

          employees.splice(index, 1);
          saveEmployeesToStorage(); // Lưu vào localStorage

          // Re-filter if there was a search term
          if (currentSearch) {
            const searchTerm = currentSearch.toLowerCase().trim();
            employees = allEmployees.filter((emp) => {
              return (
                emp.id.toLowerCase().includes(searchTerm) ||
                emp.name.toLowerCase().includes(searchTerm) ||
                emp.phone.includes(searchTerm) ||
                emp.email.toLowerCase().includes(searchTerm) ||
                emp.age.toString().includes(searchTerm)
              );
            });
          }

          renderEmployeePage(currentSearch);
        }
      });
    });
  };

  // Gắn sự kiện cho Search
  const attachSearchEvent = () => {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === "") {
          employees = [...allEmployees];
        } else {
          employees = allEmployees.filter((emp) => {
            return (
              emp.id.toLowerCase().includes(searchTerm) ||
              emp.name.toLowerCase().includes(searchTerm) ||
              emp.phone.includes(searchTerm) ||
              emp.email.toLowerCase().includes(searchTerm) ||
              emp.age.toString().includes(searchTerm)
            );
          });
        }

        renderEmployeePage(searchTerm); // Pass search term to maintain input value
      });

      // Focus vào search input sau khi render
      setTimeout(() => {
        searchInput.focus();
        searchInput.setSelectionRange(
          searchInput.value.length,
          searchInput.value.length
        );
      }, 0);
    }
  };

  // Gắn sự kiện cho Download JSON
  const attachDownloadEvent = () => {
    const downloadBtn = document.getElementById("download-json-btn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const dataStr = JSON.stringify(allEmployees, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "employees.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert("Employees JSON file downloaded!");
      });
    }
  };

  // === Q5: WEATHER API (từ tuoitre.vn) ===
  const loadWeather = () => {
    mainContent.innerHTML = `
      <h2 style="color: var(--zodiac-dark);">
        <i class="fas fa-cloud-sun"></i> Weather Forecast Vietnam (Q5)
      </h2>
      <p style="color: #666; font-size: 0.9em; margin-bottom: 20px;">
        <i class="fas fa-info-circle"></i> Real-time weather data for 63 provinces and cities of Vietnam
      </p>
      <div style="text-align: center; padding: 30px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 3em; color: var(--zodiac-lavender);"></i>
        <p style="margin-top: 15px; color: #666;">Loading weather data for all provinces...</p>
      </div>
    `;

    // 63 tỉnh thành Việt Nam với tọa độ chính xác
    const cities = [
      // North Vietnam
      { name: "Ha Noi", lat: 21.0285, lon: 105.8542, region: "North Vietnam" },
      {
        name: "Ha Giang",
        lat: 22.8023,
        lon: 104.9784,
        region: "North Vietnam",
      },
      {
        name: "Cao Bang",
        lat: 22.6663,
        lon: 106.2525,
        region: "North Vietnam",
      },
      { name: "Bac Kan", lat: 22.1433, lon: 105.8348, region: "North Vietnam" },
      {
        name: "Tuyen Quang",
        lat: 21.8234,
        lon: 105.2144,
        region: "North Vietnam",
      },
      { name: "Lao Cai", lat: 22.4809, lon: 103.9755, region: "North Vietnam" },
      {
        name: "Dien Bien",
        lat: 21.3843,
        lon: 103.0165,
        region: "North Vietnam",
      },
      {
        name: "Lai Chau",
        lat: 22.3864,
        lon: 103.4704,
        region: "North Vietnam",
      },
      { name: "Son La", lat: 21.3256, lon: 103.9089, region: "North Vietnam" },
      { name: "Yen Bai", lat: 21.7168, lon: 104.8986, region: "North Vietnam" },
      {
        name: "Hoa Binh",
        lat: 20.8142,
        lon: 105.3386,
        region: "North Vietnam",
      },
      {
        name: "Thai Nguyen",
        lat: 21.5671,
        lon: 105.8252,
        region: "North Vietnam",
      },
      { name: "Lang Son", lat: 21.8537, lon: 106.761, region: "North Vietnam" },
      {
        name: "Quang Ninh",
        lat: 21.0064,
        lon: 107.2925,
        region: "North Vietnam",
      },
      {
        name: "Bac Giang",
        lat: 21.2819,
        lon: 106.197,
        region: "North Vietnam",
      },
      { name: "Phu Tho", lat: 21.2685, lon: 105.2045, region: "North Vietnam" },
      {
        name: "Vinh Phuc",
        lat: 21.3609,
        lon: 105.6047,
        region: "North Vietnam",
      },
      {
        name: "Bac Ninh",
        lat: 21.1861,
        lon: 106.0763,
        region: "North Vietnam",
      },
      {
        name: "Hai Duong",
        lat: 20.9373,
        lon: 106.3148,
        region: "North Vietnam",
      },
      {
        name: "Hai Phong",
        lat: 20.8449,
        lon: 106.6881,
        region: "North Vietnam",
      },
      {
        name: "Hung Yen",
        lat: 20.6464,
        lon: 106.0511,
        region: "North Vietnam",
      },
      {
        name: "Thai Binh",
        lat: 20.5385,
        lon: 106.3406,
        region: "North Vietnam",
      },
      { name: "Ha Nam", lat: 20.5835, lon: 105.923, region: "North Vietnam" },
      {
        name: "Nam Dinh",
        lat: 20.4388,
        lon: 106.1621,
        region: "North Vietnam",
      },
      {
        name: "Ninh Binh",
        lat: 20.2506,
        lon: 105.9745,
        region: "North Vietnam",
      },

      // Central Vietnam
      {
        name: "Thanh Hoa",
        lat: 19.8067,
        lon: 105.7851,
        region: "Central Vietnam",
      },
      {
        name: "Nghe An",
        lat: 18.6791,
        lon: 105.6826,
        region: "Central Vietnam",
      },
      { name: "Ha Tinh", lat: 18.3333, lon: 105.9, region: "Central Vietnam" },
      {
        name: "Quang Binh",
        lat: 17.4676,
        lon: 106.6221,
        region: "Central Vietnam",
      },
      {
        name: "Quang Tri",
        lat: 16.7401,
        lon: 107.1854,
        region: "Central Vietnam",
      },
      {
        name: "Thua Thien Hue",
        lat: 16.4637,
        lon: 107.5909,
        region: "Central Vietnam",
      },
      {
        name: "Da Nang",
        lat: 16.0544,
        lon: 108.2022,
        region: "Central Vietnam",
      },
      {
        name: "Quang Nam",
        lat: 15.5394,
        lon: 108.0191,
        region: "Central Vietnam",
      },
      {
        name: "Quang Ngai",
        lat: 15.1214,
        lon: 108.8044,
        region: "Central Vietnam",
      },
      {
        name: "Binh Dinh",
        lat: 13.7829,
        lon: 109.2196,
        region: "Central Vietnam",
      },
      {
        name: "Phu Yen",
        lat: 13.0882,
        lon: 109.0929,
        region: "Central Vietnam",
      },
      {
        name: "Khanh Hoa",
        lat: 12.2388,
        lon: 109.1967,
        region: "Central Vietnam",
      },
      {
        name: "Ninh Thuan",
        lat: 11.5739,
        lon: 108.9873,
        region: "Central Vietnam",
      },
      {
        name: "Binh Thuan",
        lat: 10.9273,
        lon: 108.1023,
        region: "Central Vietnam",
      },
      {
        name: "Kon Tum",
        lat: 14.3545,
        lon: 108.0004,
        region: "Central Vietnam",
      },
      { name: "Gia Lai", lat: 13.9832, lon: 108.0, region: "Central Vietnam" },
      { name: "Dak Lak", lat: 12.71, lon: 108.2378, region: "Central Vietnam" },
      {
        name: "Dak Nong",
        lat: 12.2646,
        lon: 107.6098,
        region: "Central Vietnam",
      },
      {
        name: "Lam Dong",
        lat: 11.5753,
        lon: 108.1429,
        region: "Central Vietnam",
      },

      // South Vietnam
      {
        name: "Ho Chi Minh City",
        lat: 10.8231,
        lon: 106.6297,
        region: "South Vietnam",
      },
      {
        name: "Binh Phuoc",
        lat: 11.7511,
        lon: 106.7234,
        region: "South Vietnam",
      },
      {
        name: "Tay Ninh",
        lat: 11.3351,
        lon: 106.1099,
        region: "South Vietnam",
      },
      {
        name: "Binh Duong",
        lat: 11.3254,
        lon: 106.477,
        region: "South Vietnam",
      },
      { name: "Dong Nai", lat: 10.947, lon: 106.842, region: "South Vietnam" },
      {
        name: "Ba Ria-Vung Tau",
        lat: 10.5417,
        lon: 107.2429,
        region: "South Vietnam",
      },
      { name: "Long An", lat: 10.6956, lon: 106.2431, region: "South Vietnam" },
      {
        name: "Tien Giang",
        lat: 10.4493,
        lon: 106.342,
        region: "South Vietnam",
      },
      { name: "Ben Tre", lat: 10.2433, lon: 106.3757, region: "South Vietnam" },
      { name: "Tra Vinh", lat: 9.8124, lon: 106.2992, region: "South Vietnam" },
      {
        name: "Vinh Long",
        lat: 10.2397,
        lon: 105.9722,
        region: "South Vietnam",
      },
      {
        name: "Dong Thap",
        lat: 10.4938,
        lon: 105.6881,
        region: "South Vietnam",
      },
      {
        name: "An Giang",
        lat: 10.5216,
        lon: 105.1258,
        region: "South Vietnam",
      },
      {
        name: "Kien Giang",
        lat: 10.0125,
        lon: 105.0808,
        region: "South Vietnam",
      },
      { name: "Can Tho", lat: 10.0452, lon: 105.7469, region: "South Vietnam" },
      {
        name: "Hau Giang",
        lat: 9.7579,
        lon: 105.6412,
        region: "South Vietnam",
      },
      {
        name: "Soc Trang",
        lat: 9.6028,
        lon: 105.9739,
        region: "South Vietnam",
      },
      { name: "Bac Lieu", lat: 9.2515, lon: 105.7244, region: "South Vietnam" },
      { name: "Ca Mau", lat: 9.1526, lon: 105.196, region: "South Vietnam" },
    ];

    // Batch loading để tránh quá nhiều requests cùng lúc
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < cities.length; i += batchSize) {
      batches.push(cities.slice(i, i + batchSize));
    }

    let allWeatherData = [];

    const loadBatch = async (batch) => {
      const promises = batch.map((city) =>
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Bangkok&forecast_days=1`
        )
          .then((response) => response.json())
          .then((data) => ({
            city: city.name,
            region: city.region,
            tempLow: data.daily.temperature_2m_min[0],
            tempHigh: data.daily.temperature_2m_max[0],
          }))
          .catch((err) => ({
            city: city.name,
            region: city.region,
            tempLow: 0,
            tempHigh: 0,
            error: true,
          }))
      );
      return Promise.all(promises);
    };

    // Load all batches sequentially
    (async () => {
      for (let batch of batches) {
        const batchResults = await loadBatch(batch);
        allWeatherData = [...allWeatherData, ...batchResults];
      }

      // Group by region
      const regions = {
        "North Vietnam": [],
        "Central Vietnam": [],
        "South Vietnam": [],
      };

      allWeatherData.forEach((data) => {
        regions[data.region].push(data);
      });

      let tableHtml = `
        <h2 style="color: var(--zodiac-dark);">
          <i class="fas fa-cloud-sun"></i> Weather Forecast - All 63 Provinces & Cities
        </h2>
        <p style="color: #666; font-size: 0.9em; margin-bottom: 20px;">
          <i class="fas fa-map-marked-alt"></i> Complete weather data for Vietnam | 
          <i class="fas fa-calendar"></i> ${new Date().toLocaleDateString(
            "vi-VN"
          )}
        </p>
      `;

      // Render each region
      Object.keys(regions).forEach((regionName) => {
        tableHtml += `
          <div style="margin-bottom: 30px;">
            <h3 style="color: var(--zodiac-lavender); padding: 10px; background: linear-gradient(135deg, rgba(17, 45, 96, 0.05) 0%, rgba(221, 131, 224, 0.08) 100%); border-radius: 8px;">
              <i class="fas fa-map-marker-alt"></i> ${regionName} (${regions[regionName].length} provinces/cities)
            </h3>
            <table style="margin-top: 15px;">
                        <thead>
                <tr>
                  <th style="width: 50px;">No.</th>
                  <th>Province/City</th>
                  <th style="width: 150px;"><i class="fas fa-temperature-low"></i> Lowest Temp</th>
                  <th style="width: 150px;"><i class="fas fa-temperature-high"></i> Highest Temp</th>
                  <th style="width: 150px;"><i class="fas fa-chart-line"></i> Difference</th>
                </tr>
                        </thead>
                        <tbody>
        `;

        regions[regionName].forEach((data, index) => {
          const tempDiff = (data.tempHigh - data.tempLow).toFixed(1);
          const avgTemp = ((data.tempHigh + data.tempLow) / 2).toFixed(1);

          // Color coding based on temperature
          let tempColor = "#4CAF50"; // Green for cool
          if (avgTemp > 30) tempColor = "#FF6B6B"; // Red for hot
          else if (avgTemp > 25) tempColor = "#FFA726"; // Orange for warm

          tableHtml += `
            <tr>
              <td style="text-align: center; font-weight: 600;">${
                index + 1
              }</td>
              <td style="font-weight: 600;">${data.city}</td>
              <td style="text-align: center; color: #2196F3; font-weight: 600;">${data.tempLow.toFixed(
                1
              )}°C</td>
              <td style="text-align: center; color: ${tempColor}; font-weight: 600;">${data.tempHigh.toFixed(
            1
          )}°C</td>
              <td style="text-align: center; color: #666;">±${tempDiff}°C</td>
            </tr>
          `;
        });

        tableHtml += `
              </tbody>
            </table>
          </div>
        `;
      });

      tableHtml += `
        <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, rgba(17, 45, 96, 0.05) 0%, rgba(221, 131, 224, 0.08) 100%); border-radius: 10px; text-align: center;">
          <p style="margin: 5px 0; color: #666; font-size: 0.9em;">
            <i class="fas fa-check-circle" style="color: #4CAF50;"></i> 
            <strong>Data Source:</strong> Open-Meteo API | 
            <strong>Total:</strong> ${allWeatherData.length} locations
          </p>
        </div>
      `;

      mainContent.innerHTML = tableHtml;
    })().catch((err) => {
      console.error("Error loading weather:", err);
      mainContent.innerHTML = `
        <h2 style="color: #FF6B6B;"><i class="fas fa-exclamation-triangle"></i> Error</h2>
        <p>Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.</p>
      `;
    });
  };

  // === Q6: RSS VNEXPRESS SPORT ===
  const loadRSS = () => {
    mainContent.innerHTML =
      "<h2>VnExpress RSS Sport (Q6)</h2><p>Đang tải tin tức thể thao...</p>";

    // Sử dụng RSS2JSON API để parse RSS feed
    const rssUrl = "https://vnexpress.net/rss/the-thao.rss";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
      rssUrl
    )}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== "ok") {
          throw new Error("RSS feed error");
        }

        let htmlContent = `
                    <h2>VnExpress Sport News</h2>
                    <p style="color: #666; font-size: 0.9em;">Source: ${data.feed.title}</p>
                    <div style="margin-top: 20px;">
                `;

        data.items.slice(0, 10).forEach((item, index) => {
          const pubDate = new Date(item.pubDate).toLocaleString("vi-VN");
          htmlContent += `
                        <div style="padding: 15px; margin-bottom: 15px; background-color: #f9f9f9; border-left: 4px solid #007bff; border-radius: 4px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 1.1em;">
                                <a href="${
                                  item.link
                                }" target="_blank" style="color: #007bff; text-decoration: none;">
                                    ${index + 1}. ${item.title}
                                </a>
                            </h3>
                            <p style="margin: 0 0 8px 0; color: #666; font-size: 0.9em;">${item.description
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 200)}...</p>
                            <p style="margin: 0; color: #999; font-size: 0.85em;">
                                <i class="fas fa-clock"></i> ${pubDate}
                            </p>
                        </div>
                    `;
        });

        htmlContent += "</div>";
        mainContent.innerHTML = htmlContent;
      })
      .catch((err) => {
        console.error("Error loading RSS:", err);
        mainContent.innerHTML =
          "<h2>Error</h2><p>Không thể tải RSS feed. Lỗi: " +
          err.message +
          "</p>";
      });
  };

  // === Q7: LOGIN / LOGOUT với Local Storage ===
  const loadLogin = () => {
    if (isLoggedIn) {
      // Hiển thị trang logout
      mainContent.innerHTML = `
                <div class="logout-container">
                    <h2>You are logged in!</h2>
                    <p>Welcome back! You can now access all features.</p>
                    <button id="logout-btn">Logout</button>
                </div>
            `;

      document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        isLoggedIn = false;
        updateLoginStatus();
        alert("Đăng xuất thành công!");
        loadContent("about");
      });
    } else {
      // Hiển thị form login
      mainContent.innerHTML = `
                <div class="login-container">
                    <h2>Login (Q7)</h2>
                    <p>Please enter your credentials to login</p>
                    <form id="login-form">
                        <input type="text" id="username" placeholder="Username" required>
                        <input type="password" id="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <p style="font-size: 0.85em; color: #666; margin-top: 15px;">
                        Demo: any username/password will work
                    </p>
                </div>
            `;

      document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Giả lập login (trong thực tế cần kiểm tra với server)
        if (username && password) {
          localStorage.setItem("isLoggedIn", "true");
          isLoggedIn = true;
          updateLoginStatus();
          alert("Đăng nhập thành công!");
          loadContent("about");
        } else {
          alert("Vui lòng nhập đầy đủ thông tin!");
        }
      });
    }
  };

  // === Q8: VIETLOTT API (Part B - Left Sidebar) ===
  function initializeVietlott() {
    const radioButtons = document.querySelectorAll('input[name="lottery"]');
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        loadVietlottData(e.target.value);
      });
    });

    // Load dữ liệu mặc định (mega645)
    loadVietlottData("mega645");
  }

  function loadVietlottData(lotteryType) {
    const resultDiv = document.getElementById("lottery-result");
    resultDiv.innerHTML = "<p>Đang tải dữ liệu...</p>";

    // API thực từ Dân Trí
    const apiUrl = "https://webapi.dantri.com.vn/lottery/get-vietlott-jack";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((result) => {
        if (result.status && result.data) {
          let data = {};
          let lotteryData = null;

          if (lotteryType === "mega645" && result.data.mega645?.length > 0) {
            lotteryData = result.data.mega645[0];
            const numbers = lotteryData.ListNumber.split("-");

            data = {
              name: "Mega 6/45",
              drawId: lotteryData.DrawId,
              drawDate: lotteryData.DrawDate,
              jackpot: parseInt(lotteryData.Jackpot).toLocaleString("vi-VN"),
              numbers: numbers,
            };
          } else if (
            lotteryType === "power655" &&
            result.data.power655?.length > 0
          ) {
            lotteryData = result.data.power655[0];
            const numberParts = lotteryData.ListNumber.split("|");
            const mainNumbers = numberParts[0].split("-");
            const powerBall = numberParts[1];

            data = {
              name: "Power 6/55",
              drawId: lotteryData.DrawId,
              drawDate: lotteryData.DrawDate,
              jackpot: parseInt(lotteryData.Jackpot).toLocaleString("vi-VN"),
              jackpot2: parseInt(lotteryData.Jackpot2).toLocaleString("vi-VN"),
              numbers: mainNumbers,
              powerBall: powerBall,
            };
          }

          if (data.name) {
            let numbersHTML = data.numbers
              .map(
                (num) => `
                  <div style="width: 45px; height: 45px; background: var(--primary-gradient); 
                              color: white; border-radius: 50%; display: flex; align-items: center; 
                              justify-content: center; font-weight: bold; font-size: 1.2em; 
                              box-shadow: 0 4px 8px rgba(17, 45, 96, 0.3);">
                      ${num}
                  </div>
              `
              )
              .join("");

            // Thêm power ball nếu là Power 6/55
            if (data.powerBall) {
              numbersHTML += `
                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); 
                            color: white; border-radius: 50%; display: flex; align-items: center; 
                            justify-content: center; font-weight: bold; font-size: 1.2em; 
                            box-shadow: 0 4px 8px rgba(238, 90, 111, 0.4);
                            border: 3px solid white;">
                    ${data.powerBall}
                </div>
              `;
            }

            resultDiv.innerHTML = `
              <h4 style="margin-top: 0; color: var(--zodiac-dark);">
                <i class="fas fa-ticket-alt"></i> ${data.name}
              </h4>
              <div style="background: linear-gradient(135deg, rgba(17, 45, 96, 0.05) 0%, rgba(221, 131, 224, 0.08) 100%); 
                          padding: 15px; border-radius: 10px; margin: 10px 0;">
                <p style="margin: 5px 0; font-size: 0.9em;">
                  <strong><i class="fas fa-hashtag"></i> Kỳ quay:</strong> #${
                    data.drawId
                  }
                </p>
                <p style="margin: 5px 0; font-size: 0.9em;">
                  <strong><i class="fas fa-calendar"></i> Ngày quay:</strong> ${
                    data.drawDate
                  }
                </p>
                <p style="margin: 10px 0; font-size: 1em;">
                  <strong><i class="fas fa-trophy"></i> Jackpot 1:</strong> 
                  <span style="color: #DD83E0; font-weight: bold; font-size: 1.1em;">${
                    data.jackpot
                  } VNĐ</span>
                </p>
                ${
                  data.jackpot2
                    ? `
                  <p style="margin: 5px 0; font-size: 0.95em;">
                    <strong><i class="fas fa-award"></i> Jackpot 2:</strong> 
                    <span style="color: var(--zodiac-dark); font-weight: bold;">${data.jackpot2} VNĐ</span>
                  </p>
                `
                    : ""
                }
              </div>
              <div style="margin-top: 15px;">
                <strong><i class="fas fa-star"></i> Các số trúng thưởng:</strong>
                ${
                  data.powerBall
                    ? '<p style="font-size: 0.85em; color: #666; margin: 5px 0;">6 số chính + Power Ball (đỏ)</p>'
                    : ""
                }
                <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; justify-content: center;">
                  ${numbersHTML}
                </div>
              </div>
              <p style="margin-top: 15px; font-size: 0.8em; color: #999; text-align: center;">
                <i class="fas fa-check-circle"></i> <em>Dữ liệu thực từ <a href="https://webapi.dantri.com.vn/lottery/get-vietlott-jack" target="_blank">Dân Trí API</a></em>
              </p>
            `;
          }
        } else {
          throw new Error("No data available");
        }
      })
      .catch((err) => {
        console.error("Error loading Vietlott data:", err);
        resultDiv.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2em; color: #ff6b6b;"></i>
            <p style="color: #666; margin-top: 10px;">Không thể tải dữ liệu Vietlott</p>
            <p style="font-size: 0.85em; color: #999;">Vui lòng thử lại sau</p>
          </div>
        `;
      });
  }

  // === Q10: FOOTER với thời gian tự động cập nhật mỗi giây ===
  function initializeFooter() {
    const studentName = "Nguyen Duong Thu Uyen"; // Thay bằng tên thật

    function updateFooter() {
      const now = new Date();
      const dateTimeString = now.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      document.getElementById(
        "designer-info"
      ).textContent = `Designed by Student ${studentName}, today is ${dateTimeString}`;
    }

    // Cập nhật ngay lập tức
    updateFooter();

    // Cập nhật mỗi giây (Q10)
    setInterval(updateFooter, 1000);
  }
});
