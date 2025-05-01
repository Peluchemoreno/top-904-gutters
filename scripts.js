const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const undoBtn = document.querySelector(".undo-button");
const clearButton = document.querySelector("#clear-button");
const colorPicker = document.querySelector("#color");
const gridSizeInput = document.querySelector("#grid-size");
const tool = document.querySelector("#tool-select");
const textInputEl = document.querySelector(".container__input");
const cancelBtn = document.querySelector(".button_cancel");
const confirmBtn = document.querySelector(".button_confirm");
const modal = document.querySelector(".modal");
const eraserBtn = document.querySelector(".eraser-btn");

/* -------------------------------------------------------------------------- */
/*                                     ..                                     */
/* -------------------------------------------------------------------------- */

const pricesCloseBtn = document.querySelector(".modal-prices__close-button");
const pricesModal = document.querySelector(".modal-prices");
const pricesCancelBtn = document.querySelector(".button_alt-cancel");
const pricesConfirmBtn = document.querySelector(".button_alt_confirm");
const logo = document.querySelector(".header-logo");
const priceForm = document.querySelector("#prices-form");
const coilSizeSelect = document.querySelector(".coil-size-select");
const dsSizeSelect = document.querySelector(".ds-size-select");
const materialSelect = document.getElementById("material-select");
const gutterSelect = document.getElementById("coil-size");
const totalInput = document.getElementById("total");
const coilColorInput = document.getElementById("coil-color");
const dsColorInput = document.getElementById("downspout-color");
const materialsHeaderText = document.querySelector(
  ".material-side-header-text"
);
const pricesMiscListContainer = document.querySelector(
  ".modal-prices__body-items_misc"
);
const screenSelectInput = document.querySelector(".screen-choice");
const addScreenButton = document.querySelector(".add-screen-button");
const priceItems = document.querySelectorAll(".modal-prices__body-item");
const screenFootageInput = document.getElementById("screen");
const gutterDsPriceInputAlt = document.querySelector(".gutter-and-ds-input2");
const gutterDsPriceInput = document.getElementById("other");
const gutterDsPriceLabel = document.querySelector(".gutter-and-ds-label");
const gutterDsPriceLabelAlt = document.querySelector(".gutter-and-ds-label2");
const additions3Input = document.getElementById("additions3");
const additions2Input = document.getElementById("additions2");
const additionsInput = document.getElementById("additions");

let gutterAndDsElementIsOnBottomSection = false;

const keyGutter = {
  "price-5inKstyle": '5" K-Style',
  "price-6inKstyle": '6" K-Style',
  "price-7inKstyle": '7" K-Style',
  "price-6inHR": '6" Half Round',
  "price-8inHR": '8" Half Round',
  "price-6inBox": '6" Box',
  "price-5inStraight": '5" Straight Face',
  "price-6inStraight": '6" Straight Face',
  "price-custom": "Custom Gutter",
};
const keyDS = {
  "price-2x3-corrugated": "2x3 Corrugated",
  "price-3x4-corrugated": "3x4 Corrugated",
  "price-4x5-corrugated": "4x5 Corrugated",
  "price-3inRound": '3" Round',
  "price-4inRound": '4" Round',
  "price-3x4-smooth": "3x4 Smooth",
  "price-ds-custom": "Custom DS",
};

const formElementsNeeded = [
  "coil-footage",
  "ds-footage",
  "ism",
  "osm",
  "custom-miters",
  "end-caps",
  "a-elbows",
  "b-elbows",
  "splash-blocks",
  "drip-edge",
  "screen",
  "screen-choice",
  "other",
  "additions",
  "additions2",
  "additions3",
  "total",
];

const formElements = Array.from(document.querySelector("#main-form").elements);
const filteredElements = formElements.filter((element) => {
  return formElementsNeeded.includes(element.id);
});

/* -------------------------------------------------------------------------- */
/*                                     ..                                     */
/* -------------------------------------------------------------------------- */

let isDrawing = false;
let startX, startY, currentX, currentY;
let lines = []; // Store start and end coordinates for lines
let index = -1;
let rubberLinePath = null;
let history = []; // History to store previous states of the canvas
let isEraserOn = false;

// Initialize Canvas
function startup() {
  canvas.width = 500;
  canvas.height = 500;
  drawGrid();
  updateUndoButton();
  parseMaterialOptions();
  renderScreenItems();
  if (gutterAndDsElementIsOnBottomSection) {
    gutterDsPriceInput.style.display = "none";
    gutterDsPriceLabel.style.display = "none";
    gutterDsPriceInputAlt.style.display = "block";
    gutterDsPriceLabelAlt.style.display = "block";
  } else {
    gutterDsPriceInput.style.display = "block";
    gutterDsPriceLabel.style.display = "block";
    gutterDsPriceInputAlt.style.display = "none";
    gutterDsPriceLabelAlt.style.display = "none";
  }
}

function parseMaterialOptions() {
  Object.keys(keyGutter).forEach((key) => {
    const element = document.createElement("option");
    element.value = key;
    element.innerText = keyGutter[key];
    coilSizeSelect.appendChild(element);
  });

  Object.keys(keyDS).forEach((key) => {
    const element = document.createElement("option");
    element.value = key;
    element.innerText = keyDS[key];
    dsSizeSelect.appendChild(element);
  });
}

// Draw the grid on the canvas
function drawGrid() {
  ctx.setLineDash([]);
  const gridSize = parseInt(gridSizeInput.value);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "lightgray";
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Snap coordinates to the nearest grid point
function snapToGrid(value) {
  const gridSize = parseInt(gridSizeInput.value);
  return Math.round(value / gridSize) * gridSize;
}

// Get coordinates from event (supports both mouse and touch)
function getCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const y = event.touches ? event.touches[0].clientY : event.clientY;
  return {
    x: snapToGrid(x - rect.left),
    y: snapToGrid(y - rect.top),
  };
}

// Update the color based on user selection
function updateColor() {
  ctx.strokeStyle = colorPicker.value;
  ctx.fillStyle = colorPicker.value;
}

// Start drawing
function startDrawing(event) {
  isDrawing = true;
  const { x, y } = getCoordinates(event);
  startX = x;
  startY = y;
  ctx.lineWidth = 2;
  updateColor();
  if (isEraserOn === true) {
    eraseNearestLine();
    return;
  }

  if (tool.value === "gutter") {
    ctx.moveTo(x, y);
    ctx.setLineDash([]);
  } else if (tool.value === "existing-gutter") {
    ctx.setLineDash([2, 2]);
  } else if (tool.value === "downspout" || tool.value === "drop") {
    ctx.setLineDash([]);
  }
}

// Draw a rubber line (for both drawing and erasing)
function drawRubberLine(event) {
  if (
    !isDrawing ||
    tool.value === "downspout" ||
    tool.value === "free-text" ||
    tool.value === "drop" ||
    tool.value === "valley-shield" ||
    isEraserOn === true
  )
    return;

  const { x, y } = getCoordinates(event);
  currentX = x;
  currentY = y;

  if (rubberLinePath) {
    ctx.putImageData(rubberLinePath, 0, 0); // Clear temporary line
  } else {
    rubberLinePath = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(currentX, currentY);
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Finalize the line on pointer up
function stopDrawing(event) {
  if (isDrawing) {
    isDrawing = false;
    rubberLinePath = null; // Clear rubber band

    if (isEraserOn === true) {
      eraseNearestLine();
      return;
    }

    if (tool.value === "downspout") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(
        startX + gridSizeInput.value / 2.75,
        startY + gridSizeInput.value / 2.75
      );
      ctx.moveTo(startX, startY);
      ctx.lineTo(
        startX - gridSizeInput.value / 2.75,
        startY + gridSizeInput.value / 2.75
      );
      ctx.moveTo(startX, startY);
      ctx.lineTo(
        startX - gridSizeInput.value / 2.75,
        startY - gridSizeInput.value / 2.75
      );
      ctx.moveTo(startX, startY);
      ctx.lineTo(
        startX + gridSizeInput.value / 2.75,
        startY - gridSizeInput.value / 2.75
      );

      ctx.stroke();
      // Add line coordinates instead of ImageData
      lines.push({
        startX,
        startY,
        endX: startX,
        endY: startY,
        tool: tool.value,
        color: colorPicker.value,
      });
      updateUndoButton();
    } else if (tool.value === "drop") {
      ctx.beginPath();
      // ctx.arc(startX, startY, gridSizeInput.value / 4, 0, 2 * Math.PI);
      ctx.fillRect(
        startX - gridSizeInput.value / 4,
        startY - gridSizeInput.value / 4,
        gridSizeInput.value / 2,
        gridSizeInput.value / 2
      );
      ctx.stroke();
      // Add line coordinates instead of ImageData
      lines.push({
        startX,
        startY,
        endX: startX,
        endY: startY,
        tool: tool.value,
        color: colorPicker.value,
      });
      updateUndoButton();
    } else if (tool.value === "valley-shield") {
      ctx.beginPath();
      ctx.arc(startX, startY, gridSizeInput.value / 4, 0, 2 * Math.PI);
      ctx.fill();
      // Add line coordinates instead of ImageData
      lines.push({
        startX,
        startY,
        endX: startX,
        endY: startY,
        tool: tool.value,
        color: colorPicker.value,
      });
      updateUndoButton();
    } else if (tool.value === "free-text") {
      if (isEraserOn === true) {
        return;
      } else {
        modal.classList.add("modal_visible");
      }
    } else {
      ctx.beginPath();
      // ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.lineWidth = 2;
      if (!currentX || !currentY) {
        return;
      }
      if (startX === currentX && startY === currentY) {
        return;
      }
      ctx.stroke();
      // Add line coordinates instead of ImageData
      lines.push({
        startX,
        startY,
        endX: currentX,
        endY: currentY,
        tool: tool.value,
        color: colorPicker.value,
      });
      updateUndoButton();
      currentX = null;
      currentY = null;
    }
    if (tool.value !== "free-text") {
      saveState();
    }
  }
}

function placeText(x, y) {
  const userInput = textInputEl.value;
  ctx.font = "1000 12px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  if (!userInput) {
    return;
  } else {
    ctx.fillText(`${userInput}`, x, y);
    lines.push({
      startX,
      startY,
      endX: startX,
      endY: startY,
      tool: tool.value,
      content: userInput,
      color: colorPicker.value,
    });
    saveState();
  }
  textInputEl.value = "";
  modal.classList.remove("modal_visible");
}

function eraseNearestLine() {
  const tolerance = 10; // Tolerance in pixels for erasing (you can adjust this)

  // Loop through the stored lines and check if they intersect with the eraser area
  for (let i = lines.length - 1; i >= 0; i--) {
    let line = lines[i];

    // Check if the line is within the eraser's tolerance
    if (
      isLineCloseToCursor(
        line.startX,
        line.startY,
        line.endX,
        line.endY,
        startX,
        startY,
        tolerance
      )
    ) {
      lines.splice(i, 1); // Remove the line from lines
      redrawCanvas(); // Redraw canvas with updated lines
      break;
    }
    if (
      line.tool === "downspout" ||
      line.tool === "drop" ||
      line.tool === "valley-shield" ||
      line.tool === "free-text"
    ) {
      if (
        distanceToPoint(line.startX, line.startY, startX, startY) < tolerance
      ) {
        lines.splice(i, 1); // Remove the line from lines
        redrawCanvas(); // Redraw canvas with updated lines
        break;
      }
    }
  }
  updateUndoButton(); // Keep track of the undo stack after erasing a line
}

function isLineCloseToCursor(x1, y1, x2, y2, mouseX, mouseY, radius) {
  // Calculate the perpendicular distance from the mouse to the line
  const distance = pointToLineDistance(x1, y1, x2, y2, mouseX, mouseY);

  // Check if the mouse is within the radius of the line
  if (distance <= radius) {
    // Check if the perpendicular projection falls within the segment bounds
    const projection = projectPointOntoLine(x1, y1, x2, y2, mouseX, mouseY);
    const px = projection.x;
    const py = projection.y;

    // Check if the projected point is on the segment (within bounds of the endpoints)
    const dot1 = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1); // Dot product to check if projection is within the segment
    const dot2 = (px - x2) * (x1 - x2) + (py - y2) * (y1 - y2); // Dot product for the other side

    if (dot1 >= 0 && dot2 >= 0) {
      return true;
    }
  }

  // If the perpendicular projection doesn't fall on the segment, check distance to the endpoints
  const distToEnd1 = distanceToPoint(mouseX, mouseY, x1, y1);
  const distToEnd2 = distanceToPoint(mouseX, mouseY, x2, y2);

  return distToEnd1 <= radius || distToEnd2 <= radius;
}

// Function to calculate the perpendicular distance from a point to a line
function pointToLineDistance(x1, y1, x2, y2, px, py) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq === 0 ? -1 : dot / lenSq;

  let closestX, closestY;

  if (param < 0) {
    closestX = x1;
    closestY = y1;
  } else if (param > 1) {
    closestX = x2;
    closestY = y2;
  } else {
    closestX = x1 + param * C;
    closestY = y1 + param * D;
  }

  const dx = px - closestX;
  const dy = py - closestY;

  return Math.sqrt(dx * dx + dy * dy);
}

function distanceToPoint(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function projectPointOntoLine(x1, y1, x2, y2, px, py) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return { x: closestX, y: closestY };
}

// Redraw the entire canvas based on stored lines
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setLineDash([]);
  drawGrid();
  updateColor();
  lines.forEach((line) => {
    ctx.strokeStyle = line.color;
    ctx.fillStyle = line.color;
    if (line.tool === "downspout") {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(
        line.startX + gridSizeInput.value / 2.75,
        line.startY + gridSizeInput.value / 2.75
      );
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(
        line.startX - gridSizeInput.value / 2.75,
        line.startY + gridSizeInput.value / 2.75
      );
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(
        line.startX - gridSizeInput.value / 2.75,
        line.startY - gridSizeInput.value / 2.75
      );
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(
        line.startX + gridSizeInput.value / 2.75,
        line.startY - gridSizeInput.value / 2.75
      );
      ctx.setLineDash([]);

      ctx.stroke();
    } else if (line.tool === "drop") {
      ctx.beginPath();
      // ctx.arc(
      //   line.startX,
      //   line.startY,
      //   gridSizeInput.value / 4,
      //   0,
      //   2 * Math.PI
      // );
      // ctx.setLineDash([]);
      ctx.fillRect(
        line.startX - gridSizeInput.value / 4,
        line.startY - gridSizeInput.value / 4,
        gridSizeInput.value / 2,
        gridSizeInput.value / 2
      );
      ctx.stroke();
    } else if (line.tool === "valley-shield") {
      ctx.beginPath();
      ctx.arc(
        line.startX,
        line.startY,
        gridSizeInput.value / 4,
        0,
        2 * Math.PI
      );
      ctx.setLineDash([]);
      ctx.fill();
    } else if (line.tool === "existing-gutter") {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
    } else if (line.tool === "free-text") {
      ctx.font = "1000 12px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(line.content, line.startX, line.startY);
    } else {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
    }
  });
}

// Undo the last action
undoBtn.addEventListener("click", () => {
  undo();
});

function undo() {
  // debugger;
  if (history.length > 0) {
    // Pop the last saved state and restore the lines array
    history.pop();
    lines = history[history.length - 1];
    redrawCanvas(); // Redraw canvas with the previous state
    updateUndoButton(); // Update undo button state
  } else {
    clearCanvas(); // If no history, clear the canvas
  }
  updateUndoButton();
}

function saveState() {
  history.push([...lines]); // Copy the current lines array to preserve the state
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  lines = []; // Clear current lines
  history = []; // Clear history
  index = -1; // Reset the index (this is unnecessary)
  updateUndoButton(); // Update the undo button state
}

clearButton.addEventListener("click", clearCanvas);

// Update the undo button
function updateUndoButton() {
  if (lines && history) {
    // undoBtn.innerText =
    //   lines.length > 0 && history.length > 0 ? "Undo" : "Set Grid";
    // undoBtn.style.backgroundColor =
    //   lines.length > 0 && history.length > 0 ? "silver" : "#d9f170";
    if (lines.length > 0 && history.length > 0) {
      undoBtn.style.display = "none";
      gridSizeInput.style.display = "none";
    } else if (lines.length === 0) {
      undoBtn.style.display = "inline-block";
      gridSizeInput.style.display = "inline-block";
    }
  } else {
    return;
  }
}

function toggleEraser(status) {
  eraserBtn.classList.toggle("eraser-btn_on");
  isEraserOn = !status;
}

function savePriceInfo() {
  priceForm.elements.forEach((element) => {
    localStorage.setItem(element.id, element.value);
  });
}

function sanitizeInput(input) {
  if (input === "" || input === undefined || typeof input !== "number") {
    return Math.round(0).toFixed(2);
  }
  return parseFloat(input).toFixed(2);
}

function createScreenElement(name, price) {
  const liContainer = document.createElement("li");
  liContainer.classList.add("modal-prices__body-item");

  const label = document.createElement("label");
  label.classList.add("item__title");
  label.attributes.for = "testing";
  label.textContent = name;

  const divContainer = document.createElement("div");
  divContainer.classList.add("item__price-container");
  divContainer.innerText = "$";

  const inputElement = document.createElement("input");
  inputElement.classList.add("item__price-input");
  inputElement.placeholder = "$0.00";
  inputElement.type = "text";
  inputElement.id = `price-screen-${name}`;

  divContainer.appendChild(inputElement);
  label.appendChild(divContainer);
  liContainer.appendChild(label);

  if (price) {
    inputElement.value = price;
  }

  liContainer.ondblclick = function (e) {
    const id = e.target
      .querySelector(".item__price-input")
      .id.split("price-screen-")
      .pop();
    const answer = window.confirm("Are you sure you want to delete this item?");
    const arrayOfOptions = Array.from(
      screenSelectInput.querySelectorAll("option")
    );

    if (answer) {
      pricesMiscListContainer.removeChild(liContainer);

      arrayOfOptions.filter((option) => {
        if (option.value === id) {
          screenSelectInput.removeChild(option);
          localStorage.removeItem(`price-screen-${id}`);
        }
      });
    }
    calculate();
  };

  return liContainer;
}

function addElementToPricesPage(element) {
  pricesMiscListContainer.appendChild(element);
}

function createScreenOptionElement(name) {
  const element = document.createElement("option");
  element.value = name;
  element.textContent = name;
  return element;
}

function addElementToScreenOptionsList(element) {
  screenSelectInput.appendChild(element);
}

function addScreenItem(name, price) {
  addElementToPricesPage(createScreenElement(name, price));
  addElementToScreenOptionsList(createScreenOptionElement(name));
}

function populateScreenList(name) {
  addElementToScreenOptionsList(createScreenOptionElement(name));
}

function renderScreenItems() {
  const objKeys = Object.keys(localStorage);
  objKeys.forEach((key) => {
    if (key.includes("price-screen-")) {
      const keyName = key.split("price-screen-").pop();

      addElementToPricesPage(
        createScreenElement(keyName, localStorage.getItem(key))
      );
      populateScreenList(keyName);
    }
  });
}

// Add event listeners
canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", drawRubberLine);
canvas.addEventListener("pointerup", () => {
  stopDrawing();
  updateUndoButton();
});
canvas.addEventListener("pointerout", stopDrawing);

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("modal_visible");
  textInputEl.value = "";
});

confirmBtn.addEventListener("click", () => {
  placeText(startX, startY);
});

pricesCloseBtn.addEventListener("click", () => {
  pricesModal.classList.remove("modal_visible");
});

pricesCancelBtn.addEventListener("click", () => {
  pricesModal.classList.remove("modal_visible");
});

logo.addEventListener("click", () => {
  priceForm.elements.forEach((element) => {
    element.value = localStorage.getItem(element.id);
  });
  pricesModal.classList.add("modal_visible");
});

pricesConfirmBtn.addEventListener("click", () => {
  savePriceInfo();
  pricesModal.classList.remove("modal_visible");
});

filteredElements.forEach((element) => {
  element.addEventListener("input", () => {
    calculate();
  });
});

filteredElements.forEach((element) => {
  element.addEventListener("change", () => {
    calculate();
  });
});

dsSizeSelect.addEventListener("change", () => {
  calculate();
});

gutterSelect.addEventListener("change", () => {
  calculate();
});

materialSelect.addEventListener("change", () => {
  calculate();
});

addScreenButton.addEventListener("click", (e) => {
  e.preventDefault();
  const screenName = window.prompt("What is the name of the screen?");
  if (!screenName) {
    return;
  }
  addScreenItem(screenName);
});

// Add touch events for mobile and tablets
canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  startDrawing(event);
});
canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  drawRubberLine(event);
});
canvas.addEventListener("touchend", (event) => {
  event.preventDefault();
  stopDrawing();
  updateUndoButton();
});
canvas.addEventListener("touchcancel", stopDrawing);

eraserBtn.addEventListener("click", () => {
  toggleEraser(isEraserOn);
});

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", startup);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    undo();
  }
});

function calculateCoil(style, quantity) {
  return localStorage.getItem(style) * quantity;
}

function calculateDownspout(style, quantity) {
  return localStorage.getItem(style) * quantity;
}

function parseDs(size, orientation) {
  const separated = size.split("-");
  if (size === "price-3inRound" || size === "price-4inRound") {
    return size + "-elbow";
  }
  return "price-" + separated[1] + "-" + orientation;
}

function calculate() {
  let total = 0;
  const config = {
    material: materialSelect.value,
    dsSize: dsSizeSelect.value,
    gutterSize: gutterSelect.value,
  };

  filteredElements.forEach((element, index) => {
    const value = document.getElementById(`${element.name}`);
    const screenValue = document.getElementById("screen");

    if (value.value) {
      switch (value.id) {
        case "coil-footage":
          total += calculateCoil(config.gutterSize, parseInt(value.value));
          break;
        case "ds-footage":
          total += calculateDownspout(config.dsSize, parseInt(value.value));
          break;
        case "ism":
          total += localStorage.getItem("price-ism") * parseInt(value.value);
          break;
        case "osm":
          total += localStorage.getItem("price-osm") * parseInt(value.value);
          break;
        case "custom-miters":
          total +=
            localStorage.getItem("price-custom-miter") * parseInt(value.value);
          break;
        case "end-caps":
          // parse the end cap input for the format 3 & 3 to extract the total value
          total += localStorage.getItem("price-endcap") * parseInt(value.value);
          break;
        case "a-elbows":
          if (value.id === "price-3inRound") {
            total +=
              localStorage.getItem("price-3inRound-elbow") *
              parseInt(value.value);
          } else if (value.id === "price-4inRound") {
            total += localStorage.getItem(
              "price-4inRound-elbow" * parseInt(value.value)
            );
          } else if (config.dsSize === "price-3x4-smooth") {
            total +=
              localStorage.getItem("price-ds-custom-elbow") *
              parseInt(value.value);
          } else if (config.dsSize === "price-ds-custom") {
            total +=
              localStorage.getItem("price-ds-custom-elbow") *
              parseInt(value.value);
          } else {
            total +=
              localStorage.getItem(parseDs(config.dsSize, "A")) *
              parseInt(value.value);
          }
          break;
        case "b-elbows":
          if (value.id === "price-3inRound") {
            total += localStorage.getItem("price-3inRound-elbow");
          } else if (value.id === "price-4inRound") {
            total +=
              localStorage.getItem("price-4inRound-elbow") *
              parseInt(value.value);
          } else if (config.dsSize === "price-3x4-smooth") {
            total +=
              localStorage.getItem("price-ds-custom-elbow") *
              parseInt(value.value);
          } else if (config.dsSize === "price-ds-custom") {
            total +=
              localStorage.getItem("price-ds-custom-elbow") *
              parseInt(value.value);
          } else {
            total +=
              localStorage.getItem(parseDs(config.dsSize, "B")) *
              parseInt(value.value);
          }
          break;
        case "splash-blocks":
          total +=
            localStorage.getItem("price-splash-blocks") * parseInt(value.value);
          break;
        case "drip-edge":
          total +=
            localStorage.getItem("price-flashing") * parseInt(value.value);
          break;
        case "screen-choice":
          total +=
            localStorage.getItem(`price-screen-${value.value}`) *
            screenValue.value;
          break;
      }
    }
  });

  if (config.material === "copper") {
    let copperPercent = parseInt(localStorage.getItem("price-copper"));
    total = total + total / copperPercent;
  }

  if (config.material === "galvalume") {
    let galvalumePercent = parseInt(localStorage.getItem("price-galvalume"));
    total = total + total / galvalumePercent;
  }

  let additions3value = additions3Input.value;
  let additions2value = additions2Input.value;
  let additionsValue = additionsInput.value;

  if (additions3value === "") {
    additions3value = 0;
  }

  if (additions2value === "") {
    additions2value = 0;
  }

  if (additionsValue === "") {
    additionsValue = 0;
  }
  total += parseFloat(additions3value);
  total += parseFloat(additions2value);
  total += parseFloat(additionsValue);

  renderTotal(total);
  return parseInt(total);
}

function renderTotal(price) {
  const furtherFilteredElements = filteredElements.filter((element) => {
    if (
      element.id === "additions2" ||
      element.id === "additions" ||
      element.id === "additions3" ||
      element.id === "screen" ||
      element.id === "drip-edge"
    ) {
      return element;
    }
  });

  if (
    furtherFilteredElements.every((element) => {
      return !element.value;
    })
  ) {
    gutterAndDsElementIsOnBottomSection = false;
  } else {
    gutterAndDsElementIsOnBottomSection = true;
  }

  if (gutterAndDsElementIsOnBottomSection) {
    gutterDsPriceInput.style.display = "none";
    gutterDsPriceLabel.style.display = "none";
    gutterDsPriceInputAlt.style.display = "block";
    gutterDsPriceLabelAlt.style.display = "block";
  } else {
    gutterDsPriceInput.style.display = "block";
    gutterDsPriceLabel.style.display = "block";
    gutterDsPriceInputAlt.style.display = "none";
    gutterDsPriceLabelAlt.style.display = "none";
  }

  gutterDsPriceInputAlt.value = "$" + price.toFixed(2);
  gutterDsPriceInput.value = "$" + price.toFixed(2);
  totalInput.value = "$" + price.toFixed(2);
  // also add the values from the 3 additions boxes to this total
}

function finish() {
  // calculate();
  window.onbeforeprint = (event) => {
    toolsBar = document.querySelector(".tools-bar");
    toolsBar.style.display = "none";
    legendPic = document.querySelector(".legend-pic");

    gutterSelect.style.display = "none";
    dsSizeSelect.style.display = "none";
    materialSelect.style.display = "none";
    screenSelectInput.style.display = "none";

    coilColorInput.value += " " + keyGutter[gutterSelect.value];
    dsColorInput.value += " " + keyDS[dsSizeSelect.value];
    materialsHeaderText.textContent = `MATERIAL / ${materialSelect.value.toUpperCase()}`;
    screenFootageInput.value += " " + screenSelectInput.value;
  };
  window.print();
}

window.onafterprint = (event) => {
  toolsBar = document.querySelector(".tools-bar");
  toolsBar.style.display = "flex";
  gutterSelect.style.display = "block";
  dsSizeSelect.style.display = "block";
  materialSelect.style.display = "block";
  screenSelectInput.style.display = "block";
  materialsHeaderText.textContent = "MATERIAL";
  coilColorInput.value = "";
  dsColorInput.value = "";
  screenFootageInput.value = "";
};
