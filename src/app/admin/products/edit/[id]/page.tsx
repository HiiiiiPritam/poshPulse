
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discountedPrice: "",
    category: "SAREE",
    tags: "",
  });

  const [sizes, setSizes] = useState<{size: string, stock: number}[]>([]);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then(data => {
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          discountedPrice: data.discountedPrice || "",
          category: data.category,
          tags: data.tags.join(", "),
        });
        setSizes(data.sizes || []);
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSize = () => {
    if (newSize && newStock) {
      setSizes(prev => [...prev, { size: newSize, stock: parseInt(newStock) }]);
      setNewSize("");
      setNewStock("");
    }
  };

  const handleRemoveSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
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

    setUpdating(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        tags: formData.tags.split(",").map(t => t.trim()),
        sizes,
        images,
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update product");

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
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
                <option value="SAREE">Saree</option>
                <option value="LEHENGA">Lehenga</option>
                <option value="SUITS">Suits</option>
                <option value="KURTI">Kurti</option>
                <option value="DUPATTA">Dupatta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input name="tags" value={formData.tags} onChange={handleInputChange} className="w-full border p-2 rounded" placeholder="silk, party wear, red" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Size Management */}
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Sizes & Stock</h3>
              <div className="flex gap-2 mb-2">
                <input placeholder="Size (e.g. M, XL)" value={newSize} onChange={e => setNewSize(e.target.value)} className="border p-2 rounded flex-1" />
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

        <button type="submit" disabled={updating} className={`w-full py-3 rounded text-white font-bold ${updating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {updating ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
