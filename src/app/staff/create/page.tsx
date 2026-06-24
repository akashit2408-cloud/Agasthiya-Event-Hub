"use client";

import { ChevronLeft, User, Phone, Briefcase, CheckCircle2, AlertCircle, Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface FormData {
  name: string;
  phone: string;
  gpayNumber: string;
  role: string;
  status: string;
  profileImage: string | null;
}

interface FormErrors {
  name?: string;
  phone?: string;
  profileImage?: string;
}

export default function CreateStaffPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    gpayNumber: "",
    role: "Helper",
    status: "Available",
    profileImage: null
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const roles = ["DJ Operator", "Helper", "Driver"];
  const statuses = ["Available", "Assigned", "Leave"];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({...errors, profileImage: "Please select an image file"});
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress down to WebP with 0.7 quality to target ~200kb or less
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
        setImagePreview(compressedDataUrl);
        setFormData({...formData, profileImage: compressedDataUrl});
        setErrors({...errors, profileImage: undefined});
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({...formData, profileImage: null});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    if (formData.gpayNumber && /^\d{10}$/.test(formData.gpayNumber)) {
      alert("Please enter a valid UPI ID (e.g., name@okaxis or 9876543210@upi). Do not enter just a 10-digit phone number, otherwise GPay will not know which bank to open.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('staff').insert([{
        name: formData.name,
        mobile: formData.phone,
        gpay_number: formData.gpayNumber || null,
        role: formData.role,
        status: formData.status,
        avatar_seed: formData.profileImage || null
      }]);
      
      if (error) {
        console.error("Supabase Error Details:", error);
        throw error;
      }
      
      router.push('/staff');
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('Failed to create staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({...formData, phone: value});
    if (errors.phone) setErrors({...errors, phone: undefined});
  };

  const handleGpayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, gpayNumber: e.target.value});
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, name: e.target.value});
    if (errors.name) setErrors({...errors, name: undefined});
  };

  const isFormValid = formData.name.trim() && formData.phone.trim();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 bg-gray-50 rounded-full active:scale-95 transition-transform hover:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft size={20} className="text-gray-900" />
        </button>
        <h1 className="text-base font-extrabold text-gray-900">Add New Staff</h1>
        <div className="w-9"></div>
      </div>

      {/* Form */}
      <div className="p-5 space-y-6 flex-1">
        {/* Profile Picture */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
            Profile Picture
          </label>
          
          <div className="flex flex-col items-center gap-4">
            {/* Image Preview or Placeholder */}
            <div className="relative">
              <div className={cn(
                "w-32 h-32 rounded-full border-4 overflow-hidden transition-all",
                imagePreview ? "border-primary" : "border-gray-200 bg-gray-100"
              )}>
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Profile preview" 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={48} className="text-gray-300" />
                  </div>
                )}
              </div>
              
              {/* Remove button */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              )}
              
              {/* Camera button */}
              {!imagePreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
                  aria-label="Upload image"
                >
                  <Camera size={18} />
                </button>
              )}
            </div>

            {/* Upload/Change Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-white border-2 border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-primary hover:text-primary transition-all active:scale-95"
            >
              {imagePreview ? "Change Photo" : "Upload Photo"}
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload profile picture"
            />

            {/* Error Message */}
            {errors.profileImage && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.profileImage}
              </p>
            )}

            {/* Helper Text */}
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Recommended: Square image, max 5MB (JPG, PNG, or WebP)
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Name Field */}
        <div className="space-y-2">
          <label 
            htmlFor="name"
            className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1"
          >
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              id="name"
              type="text" 
              placeholder="e.g. Ravi Kumar"
              value={formData.name}
              onChange={handleNameChange}
              className={cn(
                "w-full bg-white border rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none",
                errors.name ? "border-red-300" : "border-gray-200"
              )}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="text-xs text-red-500 ml-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label 
            htmlFor="phone"
            className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1"
          >
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              id="phone"
              type="tel" 
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handlePhoneChange}
              maxLength={10}
              className={cn(
                "w-full bg-white border rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none",
                errors.phone ? "border-red-300" : "border-gray-200"
              )}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
          </div>
          {errors.phone && (
            <p id="phone-error" className="text-xs text-red-500 ml-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.phone}
            </p>
          )}
        </div>

        {/* GPay/UPI Field */}
        <div className="space-y-2">
          <label 
            htmlFor="gpayNumber"
            className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1"
          >
            Google Pay / UPI ID (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
            <input 
              id="gpayNumber"
              type="text" 
              placeholder="e.g. 9876543210@upi or name@okaxis"
              value={formData.gpayNumber}
              onChange={handleGpayChange}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <p className="text-[10px] text-gray-500 ml-1 font-medium mt-1">
            *Must be a valid UPI ID ending in @bank (e.g., @okaxis). Do not use just a phone number.
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
            <Briefcase size={14} />
            Role *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData({...formData, role})}
                className={cn(
                  "py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center hover:shadow-md active:scale-95",
                  formData.role === role 
                    ? "bg-primary/10 border-primary text-primary shadow-sm" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
                aria-pressed={formData.role === role}
              >
                {role}
              </button>
            ))}
          </div>
        </div>



        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-bold mb-1">Quick Tip</p>
            <p className="text-blue-600">Adding a profile picture helps you quickly identify team members in your staff list and event assignments.</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-5 pb-20 bg-white border-t border-gray-100 sticky bottom-0">
        <button 
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className={cn(
            "w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg",
            isFormValid && !isSubmitting
              ? "bg-[#00A859] text-white shadow-green-500/20 active:scale-95 hover:bg-[#009450]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Save Staff Member
            </>
          )}
        </button>
      </div>
    </div>
  );
}