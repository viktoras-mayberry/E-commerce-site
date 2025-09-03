        // Image preview functionality
        const imageInput = document.getElementById('image');
        const imagePreview = document.getElementById('imagePreview');
        const fileButtonText = document.getElementById('fileButtonText');
        const addVariationBtn = document.getElementById('addVariationBtn');
        const variationsList = document.getElementById('variationsList');
        let variationCount = 0;
        
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.addEventListener('load', function() {
                    imagePreview.style.display = 'block';
                    imagePreview.querySelector('img').src = this.result;
                    fileButtonText.textContent = ' Change image';
                });
                
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
                imagePreview.querySelector('img').src = '';
                fileButtonText.textContent = ' Choose an image';
            }
        });
        
        // Add variation functionality
        addVariationBtn.addEventListener('click', function() {
            variationCount++;
            const variationId = `variation-${variationCount}`;
            
            const variationItem = document.createElement('div');
            variationItem.className = 'variation-item';
            variationItem.id = variationId;
            
            variationItem.innerHTML = `
                <div class="variation-item-header">
                    <div class="variation-title">Variation #${variationCount}</div>
                    <div class="variation-actions">
                        <button type="button" class="btn btn-secondary" onclick="removeVariation('${variationId}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                
                <div class="variation-grid">
                    <div>
                        <div class="form-group">
                            <label>Variation Name</label>
                            <input type="text" placeholder="e.g., Color, Size, etc." class="input-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Options</label>
                            <input type="text" placeholder="e.g., Red, Blue, Green (comma separated)" class="input-control" required>
                            <small style="color: #777; display: block; margin-top: 5px;">Separate options with commas</small>
                        </div>
                        
                        <div class="form-group">
                            <label>Additional Price ($)</label>
                            <input type="number" placeholder="0.00" min="0" step="0.01" class="input-control">
                            <small style="color: #777; display: block; margin-top: 5px;">Extra cost for this variation (if any)</small>
                        </div>
                    </div>
                    
                    <div>
                        <div class="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" placeholder="Enter quantity" min="0" class="input-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>SKU (Stock Keeping Unit)</label>
                            <input type="text" placeholder="e.g., TSHIRT-RED-M" class="input-control">
                        </div>
                        
                        <div class="form-group">
                            <label>Variation Image (Optional)</label>
                            <div class="file-input-container">
                                <input type="file" accept="image/*" class="input-control variation-image">
                                <div class="file-input-button">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <span>Choose variation image</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            variationsList.appendChild(variationItem);
            
            // Add event listener for the new variation image input
            const variationImageInput = variationItem.querySelector('.variation-image');
            variationImageInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    const buttonText = this.parentElement.querySelector('.file-input-button span');
                    
                    reader.addEventListener('load', function() {
                        buttonText.textContent = ' Change image';
                    });
                    
                    reader.readAsDataURL(file);
                }
            });
        });
        
        // Remove variation function
        function removeVariation(id) {
            const variation = document.getElementById(id);
            if (variation) {
                variation.remove();
            }
        }
        
        // Form submission handling
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, you would process the form data here
            alert('Product saved successfully!');
            this.reset();
            imagePreview.style.display = 'none';
            fileButtonText.textContent = ' Choose an image';
            variationsList.innerHTML = '';
            variationCount = 0;
        });