const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const imageCount = document.getElementById("image-count");
const convertBtn = document.getElementById("convert-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const removeWatermarkBtn = document.getElementById("remove-watermark-btn");
const statusMessage = document.getElementById("status-message");

let uploadedFiles = [];
let pdfBlob = null;
let watermarkRemoved = false;

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

// Convert to PDF
convertBtn.addEventListener("click", async () => {
  statusMessage.textContent = "Generating your PDF...";
  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let file of uploadedFiles) {
    const imageBytes = await file.arrayBuffer();
    const pdfImage = await pdfDoc.embedJpg(imageBytes);
    const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
    page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
  }

  if (!watermarkRemoved) {
    const page = pdfDoc.addPage();
    page.drawText("Watermark: Shivansh Photo to PDF Converter", {
      x: 50,
      y: 50,
      size: 20,
      color: PDFLib.rgb(0.9, 0.1, 0.1),
    });
  }

  const pdfBytes = await pdfDoc.save();
  pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  statusMessage.textContent = "PDF ready! Click 'Download PDF'.";
  downloadBtn.hidden = false;
});

// Remove Watermark by Watching Ad
removeWatermarkBtn.addEventListener("click", () => {
  const adContainer = document.getElementById("ad-container");
  adContainer.style.display = "block";

  setTimeout(() => {
    watermarkRemoved = true;
    statusMessage.textContent = "Watermark removed! You can now generate the PDF without watermark.";
  }, 30000); // Simulating a 30-second ad
});

// Download PDF
downloadBtn.addEventListener("click", () => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "photos.pdf";
  link.click();
});
