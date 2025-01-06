const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const imageCount = document.getElementById("image-count");
const convertBtn = document.getElementById("convert-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const removeWatermarkBtn = document.getElementById("remove-watermark-btn");
const pageSizeSelect = document.getElementById("page-size");
const statusMessage = document.getElementById("status-message");
const themeToggleBtn = document.getElementById("theme-toggle");

const adModal = document.getElementById("ad-modal");
const adTimer = document.getElementById("ad-timer");
const closeAdBtn = document.getElementById("close-ad-btn");

let uploadedFiles = [];
let pdfBlob = null;
let removeWatermark = false;

// File Upload
uploadArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

function handleFiles(files) {
  uploadedFiles = [...files];
  updatePreview();
  convertBtn.disabled = uploadedFiles.length === 0;
  clearBtn.hidden = uploadedFiles.length === 0;
  removeWatermarkBtn.hidden = uploadedFiles.length === 0;
}

function updatePreview() {
  preview.innerHTML = "";
  uploadedFiles.forEach((file) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
  imageCount.textContent = `${uploadedFiles.length} images uploaded.`;
}

// Convert to PDF with or without Watermark
convertBtn.addEventListener("click", async () => {
  statusMessage.textContent = "Generating your PDF...";
  const pdfDoc = await PDFLib.PDFDocument.create();
  const pageSize = pageSizeSelect.value;

  for (let file of uploadedFiles) {
    const imageBytes = await file.arrayBuffer();
    const imgType = file.type.includes("png") ? "png" : "jpeg";
    const pdfImage =
      imgType === "png"
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);

    const [width, height] =
      pageSize === "A4" ? [595.28, 841.89] : [pdfImage.width, pdfImage.height];
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(pdfImage, { x: 0, y: 0, width, height });

    // Add watermark only if not removed
    if (!removeWatermark) {
      page.drawText("By Shivansh Photo To PDF Converter", {
        x: width - 250,
        y: 30,
        size: 12,
        color: PDFLib.rgb(0.7, 0.7, 0.7),
        rotate: PDFLib.degrees(45),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

  statusMessage.textContent = "PDF ready! Click 'Download PDF'.";
  downloadBtn.hidden = false;
});

// Remove Watermark Feature (Ad Simulation)
removeWatermarkBtn.addEventListener("click", () => {
  adModal.classList.remove("hidden");
  let adTime = 5;

  const timer = setInterval(() => {
    adTimer.textContent = `Ad will end in ${adTime} seconds...`;
    adTime--;

    if (adTime < 0) {
      clearInterval(timer);
      closeAdBtn.disabled = false;
      adTimer.textContent = "Ad finished! You can close it now.";
    }
  }, 1000);
});

// Close Ad Modal
closeAdBtn.addEventListener("click", () => {
  adModal.classList.add("hidden");
  removeWatermark = true;
  statusMessage.textContent = "Watermark will be removed from your PDF.";
});

// Clear All
clearBtn.addEventListener("click", () => {
  uploadedFiles = [];
  preview.innerHTML = "";
  imageCount.textContent = "No images uploaded.";
  convertBtn.disabled = true;
  clearBtn.hidden = true;
  downloadBtn.hidden = true;
  removeWatermarkBtn.hidden = true;
  statusMessage.textContent = "";
});
