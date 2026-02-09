
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { PRODUCT_CATEGORIES, PRODUCT_TAGS, PRODUCT_SIZES, PRODUCT_COLORS } from "@/constants/productOptions";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discountedPrice: "",
    category: PRODUCT_CATEGORIES[0],
    tags: [] as string[],
    colors: [] as string[],
  });

  const [sizes, setSizes] = useState<{size: string, stock: number}[]>([]);
  const [newSize, setNewSize] = useState(PRODUCT_SIZES[0]);
  const [newStock, setNewStock] = useState("");

  const [images, setImages] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSize = () => {
    if (newSize && newStock) {
      setSizes(prev => [...prev, { size: newSize, stock: parseInt(newStock) }]);
      // setNewSize(PRODUCT_SIZES[0]); // Don't reset to keep flow fast
      setNewStock("");
    }
  };

  const handleRemoveSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
        const newTags = prev.tags.includes(tag) 
            ? prev.tags.filter(t => t !== tag)
            : [...prev.tags, tag];
        return { ...prev, tags: newTags };
    });
  };

    const toggleColor = (color: string) => {
    setFormData(prev => {
        const newColors = prev.colors.includes(color) 
            ? prev.colors.filter(c => c !== color)
            : [...prev.colors, color];
        return { ...prev, colors: newColors };
    });
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Get Presigned URL
        const res = await fetch("/api/upload-s3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            filename: file.name, 
            contentType: file.type 
          }),
        });
        
        if (!res.ok) throw new Error("Failed to get upload URL");
        
        const { url, publicUrl } = await res.json();

        // 2. Upload to R2
        const uploadRes = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");

        uploadedUrls.push(publicUrl);
      }
      
      setImages(prev => [...prev, ...uploadedUrls]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sizes.length === 0) {
      toast.error("Please add at least one size");
      return;
    }
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        tags: formData.tags, // Already array
        colors: formData.colors,
        sizes,
        images,
      };

      const res = await fetch("/api/products/add", { // Need to create this API or use existing? Check...
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create product");

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleInputChange} required className="w-full border p-2 rounded" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required className="w-full border p-2 rounded" rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discounted Price</label>
                <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleInputChange} className="w-full border p-2 rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border p-2 rounded">
                {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

             {/* Tags Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50 max-h-32 overflow-y-auto">
                {PRODUCT_TAGS.map(tag => (
                   <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        formData.tags.includes(tag) 
                        ? "bg-black text-white border-black" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                   >
                    {tag}
                   </button>
                ))}
              </div>
            </div>

             {/* Colors Selection */}
             <div>
              <label className="block text-sm font-medium mb-1">Colors</label>
              <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50 max-h-32 overflow-y-auto">
                {PRODUCT_COLORS.map(color => (
                   <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        formData.colors.includes(color) 
                        ? "bg-black text-white border-black" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                   >
                    {color}
                   </button>
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-4">
            {/* Size Management */}
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Sizes & Stock</h3>
              <div className="flex gap-2 mb-2">
                <select 
                    value={newSize} 
                    onChange={e => setNewSize(e.target.value as any)} 
                    className="border p-2 rounded flex-1"
                >
                    {PRODUCT_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
                <input type="number" placeholder="Stock" value={newStock} onChange={e => setNewStock(e.target.value)} className="border p-2 rounded w-24" />
                <button type="button" onClick={handleAddSize} className="bg-blue-600 text-white px-4 rounded text-sm">Add</button>
              </div>
              <div className="space-y-1">
                {sizes.map((s, i) => (
                  <div key={i} className="flex justify-between bg-gray-50 p-2 rounded text-sm">
                    <span>{s.size} - {s.stock} units</span>
                    <button type="button" onClick={() => handleRemoveSize(i)} className="text-red-500">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Images</h3>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-2" />
              {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square">
                    <Image src={url} alt={`Product ${i}`} fill className="object-cover rounded" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full py-3 rounded text-white font-bold ${loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
