function getTotalPrice() {
    const itemPrice = parseFloat(document.getElementById('items').selectedOptions[0]?.getAttribute('data-price') || 0);
    const adults = parseInt(document.getElementById("adults").value) || 0;
    const children = parseInt(document.getElementById("children").value) || 0;
    const rooms = parseInt(document.getElementById("rooms").value) || 0;
    const discount = parseFloat(document.getElementById("discount").value) || 0;
    const tax = parseFloat(document.getElementById("tax").value) || 0;
    const travelCost = 50;

    const subtotal = (adults * 10) + (children * 5) + (rooms * 20) + itemPrice + travelCost;
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    const total = (subtotal - discountAmount) + taxAmount;

    document.getElementById('total').value = total.toFixed(2);
}

function generateReceipt() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const customer = document.getElementById("customer").value.trim() || "Unknown Customer";
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString().replace(/:/g, "-"); // Avoid colon in file name
    const total = document.getElementById("total").value || "0.00";
    const items = Array.from(document.getElementById("items").selectedOptions)
                        .map(option => `${option.text} - $${option.getAttribute('data-price')}`)
                        .join("\n");

    // Adults, Children, and Rooms
    const adults = document.getElementById("adults").value || "0";
    const children = document.getElementById("children").value || "0";
    const rooms = document.getElementById("rooms").value || "0";
    
    const travelCost = 50; // Example fixed cost
    const discount = parseFloat(document.getElementById("discount").value) || 0;
    const tax = parseFloat(document.getElementById("tax").value) || 0;

    // Calculate total price breakdown
    const adultPrice = 100; // Example price per adult
    const childPrice = 50;  // Example price per child
    const roomPrice = 80;   // Example room price

    const subtotal = (adultPrice * adults) + (childPrice * children) + (roomPrice * rooms) + travelCost;
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = (subtotal * tax) / 100;
    const finalTotal = subtotal - discountAmount + taxAmount;

    const calculationBreakdown = `
    (Adult Price: $${adultPrice} × ${adults}) + 
    (Child Price: $${childPrice} × ${children}) + 
    (Room Price: $${roomPrice} × ${rooms}) + 
    (Travel Cost: $${travelCost}) - 
    (Discount: ${discount}% = $${discountAmount.toFixed(2)}) + 
    (Tax: ${tax}% = $${taxAmount.toFixed(2)}) = 
    **Total: $${finalTotal.toFixed(2)}**
    `;

    const logoInput = document.getElementById("logo");
    if (logoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const logoBase64 = event.target.result;
            createPDF(doc, logoBase64, date, customer, items, adults, children, rooms, finalTotal, calculationBreakdown, time);
        };
        reader.readAsDataURL(logoInput.files[0]);
    } else {
        createPDF(doc, null, date, customer, items, adults, children, rooms, finalTotal, calculationBreakdown, time);
    }
}

function createPDF(doc, logoBase64, date, customer, items, adults, children, rooms, total, breakdown, time) {
    let yPosition = 10;

    // Add Full-width Logo Header (if available)
    if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 10, yPosition, 190, 40);
        yPosition += 50; // Increased space after logo
    }

    // Receipt Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(44, 95, 45); // Forest Green
    doc.text("Receipt", 90, yPosition);
    yPosition += 15; // Added extra space

    // Date and Customer Name
    doc.setFontSize(12);
    doc.setTextColor(91, 117, 83); // Olive Green
    doc.text(`Date: ${date}`, 10, yPosition);
    doc.text(`Customer: ${customer}`, 10, yPosition + 10);
    yPosition += 25; // More spacing

    // Items Table Header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(91, 117, 83); // Olive Green
    doc.text("Item", 10, yPosition);
    doc.text("Price ($)", 200, yPosition, { align: "right" });
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 10;

    // Items List
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    let lines = items.split("\n");
    lines.forEach(line => {
        let parts = line.split("-");
        let itemName = parts[0]?.trim() || "Unknown Item";
        let itemPrice = parts[1]?.trim() || "0.00";
        doc.text(itemName, 10, yPosition);
        doc.text(itemPrice, 200, yPosition, { align: "right" });
        yPosition += 10;
    });

    // Adults, Children, Rooms Breakdown
    doc.setFont("helvetica", "bold");
    doc.setTextColor(58, 125, 68); // Jungle Green
    doc.text(`Adults: ${adults}`, 10, yPosition);
    doc.text(`Children: ${children}`, 80, yPosition);
    doc.text(`Rooms: ${rooms}`, 150, yPosition);
    yPosition += 20;

    // **Price Calculation Breakdown**
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 95, 45); // Forest Green
    doc.text("Price Calculation Breakdown", 10, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    yPosition += 12;

    let calcDetails = [
        [`Adults (${adults} × $100)`, (adults * 100).toFixed(2)],
        [`Children (${children} × $50)`, (children * 50).toFixed(2)],
        [`Rooms (${rooms} × $80)`, (rooms * 80).toFixed(2)],
        [`Travel Cost`, "50.00"]
    ];

    calcDetails.forEach(([label, value]) => {
        doc.text(label, 10, yPosition);
        doc.text(`$${value}`, 200, yPosition, { align: "right" });
        yPosition += 10;
    });

    // **Line Before Subtotal**
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 8;

    // Subtotal
    let subtotal = adults * 100 + children * 50 + rooms * 80 + 50;
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal", 10, yPosition);
    doc.text(`$${subtotal.toFixed(2)}`, 200, yPosition, { align: "right" });
    yPosition += 12;

    // Discount
    let discountRate = document.getElementById("discount").value || 0;
    let discountAmount = (subtotal * (discountRate / 100)).toFixed(2);
    doc.setFont("helvetica", "normal");
    doc.text(`Discount (${discountRate}%)`, 10, yPosition);
    doc.text(`-$${discountAmount}`, 200, yPosition, { align: "right" });
    yPosition += 10;

    // Tax
    let taxRate = document.getElementById("tax").value || 0;
    let taxAmount = (subtotal * (taxRate / 100)).toFixed(2);
    doc.text(`Tax (${taxRate}%)`, 10, yPosition);
    doc.text(`+$${taxAmount}`, 200, yPosition, { align: "right" });
    yPosition += 12;

    // **Line After Tax**
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 8;

    // **Final Total (Bold & Dark Color)**
    let finalTotal = (subtotal - discountAmount + parseFloat(taxAmount)).toFixed(2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("Final Total", 10, yPosition);
    doc.text(`$${finalTotal}`, 200, yPosition, { align: "right" });

    // Save PDF with Customer Name and Date
    const fileName = `${customer.replace(/\s+/g, "_")}_${date}_${time}.pdf`;
    doc.save(fileName);
}


function resetForm() {
    document.getElementById("bookingForm").reset();
    document.getElementById("total").value = "";
}
