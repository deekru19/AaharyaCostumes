import fitz
import json
import os

pdf_path_1 = "Aharya Costumes 2025 (1).pdf"
pdf_path_2 = "CostumeCatalouge.pdf"

if os.path.exists(pdf_path_1):
    pdf_path = pdf_path_1
elif os.path.exists(pdf_path_2):
    pdf_path = pdf_path_2
else:
    print("PDF not found")
    exit(1)

print(f"Analyzing {pdf_path}")
doc = fitz.open(pdf_path)

catalog_data = []

os.makedirs("catalog_assets", exist_ok=True)

for page_idx in range(len(doc)):
    page = doc[page_idx]
    
    text = page.get_text()
    images = page.get_images(full=True)
    
    # We will compute is_text vs is_photo.
    # A page with very little text is a photo page.
    # A page with lots of text is a text page.
    
    # Let's see basic stats
    print(f"Page {page_idx}: text length={len(text.strip())}, image_count={len(images)}")
    
    is_text = len(text.strip()) > 100
    
    if is_text:
        catalog_data.append({
            "id": page_idx,
            "type": "text",
            "content": text.strip()
        })
    else:
        # Instead of extracting individual images which can be tricky, 
        # let's render the whole page as a high-res image. This guarantees all photos/layouts are preserved intact.
        pix = page.get_pixmap(dpi=150)
        img_filename = f"catalog_assets/page_{page_idx}.jpg"
        pix.save(img_filename)
        catalog_data.append({
            "id": page_idx,
            "type": "photo",
            "src": img_filename
        })

with open("catalog_data.json", "w") as f:
    json.dump(catalog_data, f, indent=2)

print("Extraction complete.")
