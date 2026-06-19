export const demoRentals = [
  { name: "JBL SRX828SP Subwoofer", category: "Audio", status: "Available", condition: "Good" },
  { name: "Pioneer CDJ-3000", category: "DJ Gear", status: "Rented", condition: "Excellent", due_date: "2026-06-21" },
  { name: "Sharpy Beam Moving Head", category: "Lighting", status: "Maintenance", condition: "Needs Repair" },
  { name: "Yamaha QL5 Digital Console", category: "Audio", status: "Available", condition: "Excellent" },
  { name: "Smoke Machine 1500W", category: "Effects", status: "Rented", condition: "Good", due_date: "2026-06-20" },
  { name: "Truss 2m Aluminum", category: "Staging", status: "Available", condition: "Fair" },
];

export const demoStaff = [
  { name: "Ravi Kumar", role: "DJ Operator", status: "Available" },
  { name: "Mani Shankar", role: "Sound Engineer", status: "Assigned" },
  { name: "Arjun Prakash", role: "Light Operator", status: "Available" },
  { name: "Suresh Babu", role: "Helper", status: "Assigned" },
  { name: "Vicky", role: "Helper", status: "Available" },
  { name: "Kumar", role: "Driver", status: "Available" },
  { name: "Prakash", role: "Sound Engineer", status: "Leave" },
];

export const demoSetups = [
  { name: "Basic Setup", quantity: 2, status: "Available" },
  { name: "Honeycomb Setup", quantity: 2, status: "Booked" },
  { name: "Premium Setup", quantity: 1, status: "Maintenance" },
  { name: "LED Dance Floor Setup", quantity: 1, status: "Available" },
  { name: "Line Array Setup", quantity: 1, status: "Available" },
  { name: "Outdoor Setup", quantity: 1, status: "Available" },
  { name: "Wedding Setup", quantity: 1, status: "Available" },
  { name: "Festival Setup", quantity: 1, status: "Available" },
];

export const demoVehicles = [
  { name: "Vehicle 1", registration_number: "TN-00-DJ-0001", status: "Available" },
  { name: "Vehicle 2", registration_number: "TN-00-DJ-0002", status: "Booked" },
];

export const demoEvents = [
  {
    id: "demo-1",
    title: "Wedding Event",
    event_type: "Wedding",
    event_date: "2026-06-20",
    event_time: "17:00:00",
    location: "ECR, Chennai",
    setup_name: "Honeycomb Setup",
    vehicle_name: "Vehicle 2",
    staff_count: 5,
    status: "Planned",
    customer_name: "Wedding Customer",
    customer_mobile: "9000000001",
    total_amount: 50000,
  },
  {
    id: "demo-2",
    title: "Birthday Party",
    event_type: "Birthday",
    event_date: "2026-06-20",
    event_time: "19:30:00",
    location: "OMR, Chennai",
    setup_name: "Basic Setup",
    vehicle_name: "Vehicle 1",
    staff_count: 3,
    status: "Planned",
    customer_name: "Birthday Customer",
    customer_mobile: "9000000002",
    total_amount: 25000,
  },
  {
    id: "demo-3",
    title: "Corporate Event",
    event_type: "Corporate",
    event_date: "2026-06-21",
    event_time: "10:00:00",
    location: "Nungambakkam, Chennai",
    setup_name: "Premium Setup",
    vehicle_name: "Vehicle 1",
    staff_count: 6,
    status: "Confirmed",
    customer_name: "Corporate Customer",
    customer_mobile: "9000000003",
    total_amount: 75000,
  },
];

export function formatEventDate(date?: string, time?: string) {
  if (!date) return "Date not set";
  const parsed = new Date(`${date}T${time || "00:00:00"}`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: time ? "2-digit" : undefined,
    minute: time ? "2-digit" : undefined,
  }).format(parsed);
}

export function formatShortDate(date?: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(date));
}
