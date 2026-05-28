function saveData() {
  localStorage.setItem(
    'warehouseData',
    JSON.stringify(warehouseData)
  );
}

function loadData() {
  const saved =
    localStorage.getItem('warehouseData');

  if (saved) {
    warehouseData = JSON.parse(saved);
  }
}

loadData();

const app = document.getElementById('app');

let currentIndex = 0;

function renderHomePage() {

  app.innerHTML = `

    <header>
      <h1>
        <img src="./bq.png" width="120">
        DC3 Stock Check
        <img src="./bq.png" width="120">
      </h1>
    </header>

    <div class="button-container">

      <button
        class="button2"
        onclick="startCheck()"
      >
        START CHECK
      </button>

      <br><br><br><br>

      <button
        class="button4"
        onclick="resetData()"
      >
        RESET DATA
      </button>

    </div>
  `;
}

function startCheck() {

  currentIndex = 0;

  renderLocation();
}

function renderLocation() {

  const item =
    warehouseData.DC3[currentIndex];

  app.innerHTML = `

    <div class="top-bar">

      <button
        class="back-btn"
        onclick="renderHomePage()"
      >
        ← MAIN MENU
      </button>

      <h1>
        ${currentIndex + 1}
        /
        ${warehouseData.DC3.length}
      </h1>

    </div>

    <div class="location-card">

      <h1 class="location-title">
        ${item.location}
      </h1>

      <div class="input-group">

        <label>EAN</label>

        <input
          id="eanInput"
          type="number"
          value="${item.EAN || ''}"
        >

      </div>

      <div class="input-group">

        <label>Quantity</label>

        <input
          id="qtyInput"
          type="number"
          value="${item.quantity || ''}"
        >

      </div>

      <div class="nav-buttons">

        <button
          class="next-btn"
          onclick="backLocation()"
        >
          BACK
        </button>

        <button
          class="next-btn"
          onclick="nextLocation()"
        >
          NEXT
        </button>

      </div>

    </div>
  `;
}


function saveCurrentInputs() {

  const eanInput =
    document.getElementById('eanInput');

  const qtyInput =
    document.getElementById('qtyInput');

  if (!eanInput || !qtyInput) {
    return;
  }

  const item =
    warehouseData.DC3[currentIndex];

  item.EAN = eanInput.value;

  item.quantity = qtyInput.value;

  saveData();
}

function nextLocation() {

  saveCurrentInputs();

  currentIndex++;

  if (
    currentIndex >= warehouseData.DC3.length
  ) {

    app.innerHTML = `

    <div class="complete-message">
      ✅ Check Complete
    </div>

    <div class="complete-message">
      Excel File Saved
    </div>

    <div class="center-button">

      <button
        class="next-btn"
        onclick="backLocation()"
      >
        BACK
      </button>

      <br>
      <br>

      <button
        class="next-btn"
        onclick="exportToExcel()"
      >
        EXPORT EXCEL
      </button>

      <br>
      <br>

      <button
        class="next-btn"
        onclick="renderHomePage()"
      >
        MAIN MENU
      </button>

    </div>
  `;

    return;
  }

  renderLocation();
}

function backLocation() {

  saveCurrentInputs();

  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  renderLocation();
}

function exportToExcel() {

  const now = new Date();

  const timestamp =
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    now.getFullYear() +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    "." +
    String(now.getMinutes()).padStart(2, "0");

  const workbook =
    XLSX.utils.book_new();

  const worksheet =
    XLSX.utils.json_to_sheet(
      warehouseData.DC3
    );

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'DC3'
  );

  XLSX.writeFile(
    workbook,
    `DC3-STOCK-CHECK-${timestamp}.xlsx`
  );
}

function resetData() {

  const confirmed = confirm(
    'Reset all data?'
  );

  if (!confirmed) return;

  localStorage.removeItem(
    'warehouseData'
  );

  warehouseData =
    structuredClone(defaultWarehouseData);

  saveData();

  renderHomePage();
}

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('./sw.js');

}

renderHomePage();