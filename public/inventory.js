document.addEventListener('DOMContentLoaded', () => {
  const inventoryList = document.getElementById('inventoryList');
  const refreshButton = document.getElementById('refreshButton');
  
  // Add
  const addButton = document.getElementById('addButton');
  const addModal = document.getElementById('addModal');
  const addItemForm = document.getElementById('addItemForm');
  const cancelButton = document.querySelector('#addItemForm button[type="button"]');
  const addModalClose = addModal.querySelector('.close');

  // Open Add Item Modal
  if (addButton) {
      addButton.addEventListener('click', () => {
          if (addModal) {
              addModal.style.display = 'block';
              addItemForm.reset();
          }
      });
  }

  // Close Add Item Modal
  if (addModalClose && cancelButton) {
    addModalClose.addEventListener('click', () => {
        addModal.style.display = 'none';
    });
    cancelButton.addEventListener('click', () => {
        addModal.style.display = 'none';
    });
  }

  if (addItemForm) {
    addItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newItem = {};
  
      const fields = ['sku', 'name', 'quantity', 'size', 'color', 'category', 'buyPrice', 'sellPrice', 'minStock', 'description'];
      fields.forEach(field => {
        const input = document.getElementById('add' + field.charAt(0).toUpperCase() + field.slice(1));
        if (input.value.trim() !== '') {
          // Convert quantity to a number
          if (field === 'quantity') {
            newItem[field] = parseInt(input.value.trim(), 10);
          } else {
            newItem[field] = input.value.trim();
          }
        }
      });

      console.log('Data being sent to server:', newItem); // Add this line
  
      try {
        const response = await fetch('http://192.210.197.42:3000/addItem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
  
        if (response.ok) {
          const result = await response.json();
          addModal.style.display = 'none';
          viewInventory(); // Refresh the inventory list
          alert(result.message);
        } else {
          const errorData = await response.json();
          alert('Failed to add item: ' + errorData.error);
        }
      } catch (error) {
        console.error('Error adding item:', error);
        alert('Error adding item: ' + error.message);
      }
    });
  }
  // End Add

  // Update
  const updateModal = document.getElementById('updateModal');
  const updateItemForm = document.getElementById('updateItemForm');
  const updateModalClose = updateModal.querySelector('.close');
  const cancelUpdateItem = document.getElementById('cancelUpdateItem');
  const updateItemMessage = document.getElementById('updateItemMessage');

  function updateRowStyling(row) {
    console.log("updateRowStyling function called!"); 
    console.log("Row being styled:", row); 

    const quantityCellIndex = 7; 
    const minStockCellIndex = 8; 

    const quantity = parseInt(row.cells[quantityCellIndex].textContent, 10);
    const minStock = parseInt(row.cells[minStockCellIndex].textContent, 10);

    console.log("Quantity:", quantity);
    console.log("Min Stock:", minStock);

    if (quantity < minStock) {
      console.log("Applying 'low-stock' class...");
      row.classList.add('low-stock');
      console.log("Class List after adding:", Array.from(row.classList)); // <-- Change here
    } else {
      console.log("Removing 'low-stock' class (if it exists)...");
      row.classList.remove('low-stock');
      console.log("Class List after removing:", Array.from(row.classList)); // <-- And here
    }
  }

  function openUpdateModal(item) {
    updateModal.style.display = 'block';
    document.getElementById('updateSku').value = item.sku;
    document.getElementById('updateName').value = item.name;
    document.getElementById('updateQuantity').value = parseInt(item.quantity, 10) || 0;
    document.getElementById('updateSize').value = item.size || '';
    document.getElementById('updateColor').value = item.color || '';
    document.getElementById('updateCategory').value = item.category || '';
    document.getElementById('updateBuyPrice').value = item.buyPrice || '';
    document.getElementById('updateSellPrice').value = item.sellPrice || '';
    document.getElementById('updateMinStock').value = item.minStock || '';
    document.getElementById('updateDescription').value = item.description || '';
    
    updateRowStyling(document.querySelector(`tr[data-sku="${item.sku}"]`));
  }

  // Close Update Modal
  updateModalClose.addEventListener('click', () => {
      updateModal.style.display = 'none';
  });

  cancelUpdateItem.addEventListener('click', () => {
      updateModal.style.display = 'none'; // Close the modal
  });

  updateItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedItem = {
        sku: document.getElementById('updateSku').value
    };

    const fields = ['name', 'quantity', 'size', 'color', 'category', 'buyPrice', 'sellPrice', 'minStock', 'description'];
    fields.forEach(field => {
        const input = document.getElementById('update' + field.charAt(0).toUpperCase() + field.slice(1));
        if (input.value !== '' && input.value !== input.defaultValue) {
            if (field === 'quantity') {
                updatedItem[field] = parseInt(input.value.trim(), 10); // Ensure quantity is treated as a number
            } else {
                updatedItem[field] = input.value;
            }
        }
    });

    try {
      const response = await fetch('http://192.210.197.42:3000/updateItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
  
      if (response.ok) {
        updateModal.style.display = 'none';
        viewInventory();
      } else {
        const errorData = await response.json();
        alert('Failed to update item: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item: ' + error.message);
    }
  });

  function setupEditButtons() {  
    const editButtons = document.querySelectorAll('.editButton');
  
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const row = button.closest('tr');  
        const sku = row.cells[0].textContent;
  
        // Fetch the item data from the server using the SKU
        fetch(`http://192.210.197.42:3000/api/items/${sku}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Parse the response as JSON
            return response.json();
          })
          .then(item => {
            console.log("Item data fetched from server:", item);
            openUpdateModal(item);
          })
          .catch(error => {
            console.error('Error fetching item:', error);
            alert('Error fetching item: ' + error.message);
          });
      });
    });
  }

  function setupDelButtons() {
    const deleteButtons = document.querySelectorAll('.deleteButton');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const row = button.closest('tr');
        const sku = row.cells[0].textContent;
        if (confirm(`Are you sure you want to delete the item with SKU ${sku}?`)) {
          deleteItem(sku);
        }
      });
    });
  }

  // End Update
  
  // View Inventory
  async function viewInventory() {
    try {
      const response = await fetch('http://192.210.197.42:3000/viewInventory');
      const data = await response.json();
      if (inventoryList) {
        console.log("Data used to populate the table:", data);
  
        const tbody = inventoryList.querySelector('tbody');
        
        // Clear existing rows (except the header)
        while (inventoryList.rows.length > 1) {
          inventoryList.deleteRow(1);
        }
  
        data.forEach(item => {
          const quantity = parseInt(item.quantity, 10);
          const minStock = parseInt(item.minStock, 10);
          const rowClass = quantity < minStock ? 'class="low-stock"' : ''; 
          // Check if a row with the SKU already exists
          let row = document.querySelector(`tr[data-sku="${item.sku}"]`);
  
          if (row) {
            // Row exists, update the cells
            row.innerHTML = `
              <td ${rowClass}>${item.sku}</td>
              <td ${rowClass}>${item.name}</td>
              <td ${rowClass}>${item.size || ''}</td>
              <td ${rowClass}>${item.color || ''}</td>
              <td ${rowClass}>${item.category || ''}</td>
              <td ${rowClass}>${item.buyPrice || ''}</td>
              <td ${rowClass}>${item.sellPrice || ''}</td>
              <td ${rowClass}>${quantity}</td>
              <td ${rowClass}>${minStock}</td>
              <td>
                <button class="editButton">Edit</button>
                <button class="deleteButton">Delete</button>
              </td>
            `;
          } else {
            // Row doesn't exist, create a new one
            row = inventoryList.insertRow();
            row.dataset.sku = item.sku;
            row.innerHTML = `
              <td ${rowClass}>${item.sku}</td>
              <td ${rowClass}>${item.name}</td>
              <td ${rowClass}>${item.size || ''}</td>
              <td ${rowClass}>${item.color || ''}</td>
              <td ${rowClass}>${item.category || ''}</td>
              <td ${rowClass}>${item.buyPrice || ''}</td>
              <td ${rowClass}>${item.sellPrice || ''}</td>
              <td ${rowClass}>${quantity}</td>
              <td ${rowClass}>${minStock}</td>
              <td>
                <button class="editButton">Edit</button>
                <button class="deleteButton">Delete</button>
              </td>
            `;
          }
        });
  
        setupEditButtons();
        setupDelButtons()
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error viewing inventory: ' + error.message);
    }
  }
  
  // Delete Item
  async function deleteItem(sku) {
    try {
        const response = await fetch('http://192.210.197.42:3000/removeItem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        alert(data.message);
        viewInventory(); // Refresh the inventory list
    } catch (error) {
        console.error('Error:', error);
        alert('Error removing item: ' + error.message);
    }
  }

  // Refresh Button
  if (refreshButton) {
      refreshButton.addEventListener('click', viewInventory);
  }

  viewInventory();
});