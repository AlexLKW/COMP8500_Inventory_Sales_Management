// sales.js
document.addEventListener('DOMContentLoaded', () => {
    /*
    const skuInput = document.getElementById('skuInput');
    const quantityInput = document.getElementById('quantityInput');
    const addToCartButton = document.getElementById('addToCartButton');
    const cartTable = document.getElementById('cartTable').querySelector('tbody');
    const cartTotal = document.getElementById('cartTotal');
    const completeSaleButton = document.getElementById('completeSaleButton');
    */
    const salesHistoryTable = document.getElementById('salesHistoryTable').querySelector('tbody');
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');
    const filterSalesButton = document.getElementById('filterSales');
  
    /*
    let shoppingCart = [];
  
    // Function to fetch item details by SKU (You'll need to implement this)
    async function getItemBySKU(sku) {
      // Make an API call to your backend to fetch item details
      // Example using fetch:
      const response = await fetch(`/api/items/${sku}`); 
      const item = await response.json();
      return item;
    }
  
    // Function to add item to the cart
    async function addItemToCart() {
        const sku = skuInput.value;
        const quantity = parseInt(quantityInput.value);
      
        if (!sku || !quantity) {
          alert('Please enter both SKU and quantity.');
          return;
        }
      
        const item = await getItemBySKU(sku);
      
        if (!item) {
          alert('Item not found!');
          return;
        }
      
        // Find if the item already exists in the cart
        const existingItemIndex = shoppingCart.findIndex(cartItem => cartItem.sku === sku);
      
        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          shoppingCart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item to the cart, using sellPrice
          shoppingCart.push({
            sku: item.sku,
            name: item.name,
            quantity,
            price: parseFloat(item.sellPrice)
          });
        }
      
        updateCart();
        skuInput.value = '';
        quantityInput.value = '';
    }
  
    // Function to update the cart display
    function updateCart() {
        cartTable.innerHTML = ''; // Clear the cart table
        let total = 0;
      
        shoppingCart.forEach(item => {
          const row = cartTable.insertRow();
          row.insertCell().textContent = item.sku;
          row.insertCell().textContent = item.name;
          row.insertCell().textContent = item.quantity;
      
          let itemSellPrice = parseFloat(item.price);

          if (isNaN(itemSellPrice)) {
            console.error("Invalid price detected:", item); 
            // You could also set itemSellPrice to 0 or display an error message
            itemSellPrice = 0; 
          }

          row.insertCell().textContent = itemSellPrice.toFixed(2); // Display price with 2 decimals
          row.insertCell().textContent = (item.quantity * itemSellPrice).toFixed(2); // Subtotal
      
          // Add "Remove" button
          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.addEventListener('click', () => {
            removeItemFromCart(item.sku); 
          });
          row.insertCell().appendChild(removeButton);
      
          total += item.quantity * itemSellPrice; 
        });
      
        cartTotal.textContent = `$${total.toFixed(2)}`; 
    }
  
    // Function to remove item from cart
    function removeItemFromCart(sku) {
      shoppingCart = shoppingCart.filter(item => item.sku !== sku);
      updateCart();
    }
    */
  
    // Function to complete sale (send data to the backend)
    async function completeSale() {
        if (shoppingCart.length === 0) {
          alert('Your cart is empty!');
          return;
        }
    
        const uid = 1; // Replace with actual user ID 
        const totalAmount = parseFloat(cartTotal.textContent.replace('$', ''));
    
        try {
          const response = await fetch('/api/createSale', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid, items: shoppingCart, totalAmount }),
          });
    
          if (response.ok) {
            const data = await response.json();
            alert('Sale completed successfully! Sale ID: ' + data.saleId);
            shoppingCart = []; // Clear the cart
            updateCart();
            getSalesHistory();
          } else {
            // Handle errors from the server
            const errorData = await response.json(); 
            throw new Error(errorData.message || 'Failed to complete sale.');
          }
        } catch (error) {
          console.error(error);
          alert(error.message); // Display the error message to the user
        }
    }
  
    // Function to fetch sales history (You'll need to implement this)
    async function getSalesHistory(dateFrom, dateTo) {
        try {
          const url = '/api/salesHistory';
          if (dateFrom && dateTo) {
            url += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
          }
    
          const response = await fetch(url);
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const salesHistory = await response.json();
    
          if (Array.isArray(salesHistory)) {
            salesHistoryTable.innerHTML = '';
    
            salesHistory.forEach(sale => {
              const row = salesHistoryTable.insertRow();
    
              // Sale ID
              const saleIdCell = row.insertCell();
              saleIdCell.textContent = sale.saleId;
    
              // Date (formatted)
              const saleDate = new Date(sale.saleDate);
              const formattedDate = saleDate.toLocaleDateString('en-GB', { 
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              const dateCell = row.insertCell();
              dateCell.textContent = formattedDate;
    
              // Customer ID
              const customerIdCell = row.insertCell();
              customerIdCell.textContent = sale.uid; 
    
              // Total Amount
              const totalAmount = parseFloat(sale.totalAmount); 
              const amountCell = row.insertCell();
              amountCell.textContent = totalAmount.toFixed(2);
    
              // Status
              const statusCell = row.insertCell();
              statusCell.textContent = sale.status;
    
            });
          } else {
            console.error('Error fetching sales history:', salesHistory);
          }
        } catch (error) {
          console.error('Error fetching sales history:', error);
        }
    }
    
    // Event Listeners
    //addToCartButton.addEventListener('click', addItemToCart);
    //completeSaleButton.addEventListener('click', completeSale);
    filterSalesButton.addEventListener('click', async () => {
        const dateFrom = dateFromInput.value;
        const dateTo = dateToInput.value;
        await getSalesHistory(dateFrom, dateTo);
    });

    getSalesHistory(); // Load the inventory when initialized
});