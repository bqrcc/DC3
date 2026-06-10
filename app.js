function saveData() {
  localStorage.setItem(
    'warehouseData2',
    JSON.stringify(warehouseData2)
  );
}

function loadData() {
  const saved =
    localStorage.getItem('warehouseData2');

  if (saved) {
    warehouseData2 = JSON.parse(saved);
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
    warehouseData2.DC3[currentIndex];

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
        ${warehouseData2.DC3.length}
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

      <button
      class="second-stock-btn
      ${item.secondStock.EAN ? 'has-second-stock' : ''}"
      onclick="openSecondStock()"
      >
        ${
        item.secondStock.EAN
          ? 'SECOND STOCK'
          : 'ADD SECOND STOCK'
        }
      </button>

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

      <div
  id="secondStockModal"
  class="modal"
  style="display:none;"
>

  <div class="modal-content">

    <h2>Second Stock</h2>

    <label>EAN</label>

    <input
      id="secondEAN"
      type="text"
      value="${
        item.secondStock
          ? item.secondStock.EAN
          : ''
      }"
    >

    <label>Quantity</label>

    <input
      id="secondQty"
      type="number"
      value="${
        item.secondStock
          ? item.secondStock.quantity
          : ''
      }"
    >

    <br><br>

    <button onclick="saveSecondStock();">
      SAVE
    </button>

    <button onclick="closeSecondStock()">
      CANCEL
    </button>

  </div>

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
    warehouseData2.DC3[currentIndex];

  item.EAN = eanInput.value;

  item.quantity = qtyInput.value;

  saveData();
}

function nextLocation() {

  saveCurrentInputs();

  currentIndex++;

  if (
    currentIndex >= warehouseData2.DC3.length
  ) {

    app.innerHTML = `

    <div class="complete-message">
      ✅ Check Complete
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

  const rows = [];

  warehouseData2.DC3.forEach(item => {

    if (item.EAN || item.secondStock.EAN) {

      // Main stock
      rows.push({
        Location: item.location,
        EAN: item.EAN,
        Quantity: item.quantity
      });

      // Second stock (if entered)
      if (
        item.secondStock &&
        item.secondStock.EAN
      ) {
        rows.push({
          Location: item.location,
          EAN: item.secondStock.EAN,
          Quantity: item.secondStock.quantity
        });
      }
    }

    });

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

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
    'warehouseData2'
  );

  warehouseData2 =
    structuredClone(defaultWarehouseData2);

  saveData();

  renderHomePage();
}

if ('serviceWorker' in navigator) {

  navigator.serviceWorker
    .register('./sw.js');

}

function openSecondStock() {

  document.getElementById('secondStockModal').style.display = 'flex';
}

function closeSecondStock() {

  document.getElementById('secondStockModal').style.display = 'none';
}

function saveSecondStock() {

  const item =
    warehouseData2.DC3[currentIndex];

  item.secondStock = {

    EAN:
      document.getElementById(
        'secondEAN'
      ).value,

    quantity:
      document.getElementById(
        'secondQty'
      ).value
  };

  saveData();

  saveCurrentInputs();

  renderLocation();
}

renderHomePage();