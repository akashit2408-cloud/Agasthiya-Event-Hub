"use client";

import { ChevronLeft, Truck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface FormData {
  name: string;
  registration_number: string;
  status: string;
}

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id;
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    registration_number: "",
    status: "Available"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchVehicle = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            name: data.name || "",
            registration_number: data.registration_number || "",
            status: data.status === "Maintenance" ? "Maintenance" : "Available"
          });
        }
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicle();
  }, [vehicleId]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('vehicles').update({
        name: formData.name,
        registration_number: formData.registration_number,
        status: formData.status
      }).eq('id', vehicleId);
      
      if (error) throw error;
      
      router.push('/vehicles');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 bg-gray-50 rounded-full active:scale-95 transition-transform hover:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-900" />
        </button>
        <h1 className="text-base font-extrabold text-gray-900">Edit Vehicle</h1>
        <div className="w-9"></div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-5 space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Vehicle Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Truck size={18} />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow placeholder:font-medium shadow-sm"
                  placeholder="e.g. Tata Ace"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.registration_number}
                onChange={(e) => setFormData({...formData, registration_number: e.target.value.toUpperCase()})}
                className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow placeholder:font-medium shadow-sm"
                placeholder="e.g. TN-00-DJ-0000"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Override Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Available", "Maintenance"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({...formData, status})}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      formData.status === status
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 font-medium ml-1">Note: &quot;Available&quot; means it will automatically change to &quot;Booked&quot; when assigned to an event.</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="p-5 bg-white border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all ${
              isFormValid 
                ? "bg-primary text-white shadow-primary/30 hover:bg-primary/90 active:scale-95" 
                : "bg-gray-100 text-gray-400 shadow-none"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
