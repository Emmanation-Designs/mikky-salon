export interface ServiceItem {
  id: string;
  name: string;
  category: 'Haircuts' | 'Beard' | 'Extras';
  price: number;
  description: string;
  image: string;
  duration: string;
}

export interface BookingItem {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  barber: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  image: string;
}

export const SHOWCASE_SERVICES: ServiceItem[] = [
  {
    id: 'classic-fade',
    name: 'Classic Fade',
    category: 'Haircuts',
    price: 15,
    description: 'Clean and stylish fade for a fresh look.',
    image: '/src/assets/images/mikkys_signature_fade_1792242196486.jpg',
    duration: '35 mins',
  },
  {
    id: 'taper-fade',
    name: 'Taper Fade',
    category: 'Haircuts',
    price: 12,
    description: 'Smooth and natural taper for a clean finish.',
    image: '/src/assets/images/haircut_fade_classic_1792138006925.jpg',
    duration: '30 mins',
  },
  {
    id: 'low-fade',
    name: 'Low Fade',
    category: 'Haircuts',
    price: 12,
    description: 'Subtle and sharp, perfect for any occasion.',
    image: '/src/assets/images/haircut_twist_fade_1792138007425.jpg',
    duration: '30 mins',
  },
  {
    id: 'high-fade',
    name: 'High Fade',
    category: 'Haircuts',
    price: 15,
    description: 'Bold and modern, for a standout look.',
    image: '/src/assets/images/mikkys_signature_fade_1792242196486.jpg',
    duration: '40 mins',
  },
  {
    id: 'line-up',
    name: 'Line Up',
    category: 'Haircuts',
    price: 10,
    description: 'Sharp edges for a clean, polished appearance.',
    image: '/src/assets/images/haircut_fade_classic_1792138006925.jpg',
    duration: '20 mins',
  },
  {
    id: 'beard-trim',
    name: 'Beard Trim',
    category: 'Beard',
    price: 10,
    description: 'Precision beard shaping and straight razor edging.',
    image: '/src/assets/images/haircut_beard_grooming_1792138006451.jpg',
    duration: '25 mins',
  },
  {
    id: 'beard-shave',
    name: 'Full Hot Towel Shave',
    category: 'Beard',
    price: 12,
    description: 'Traditional hot lather straight razor shave.',
    image: '/src/assets/images/haircut_beard_grooming_1792138006451.jpg',
    duration: '30 mins',
  },
  {
    id: 'hair-wash',
    name: 'Hair Wash',
    category: 'Extras',
    price: 8,
    description: 'Deep cleansing scalp wash and revitalizing massage.',
    image: '/src/assets/images/barber_tools_craft_1792138007201.jpg',
    duration: '15 mins',
  },
  {
    id: 'black-dye',
    name: 'Black Dye Enhancement',
    category: 'Extras',
    price: 14,
    description: 'Natural pigment enhancement for hair and beard line.',
    image: '/src/assets/images/mikkys_signature_fade_1792242196486.jpg',
    duration: '25 mins',
  },
];

export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'bk-101',
    serviceId: 'classic-fade',
    serviceName: 'Fade Cut',
    price: 15,
    date: 'Sat, Nov 14, 2025',
    time: '10:00 AM',
    barber: 'Any Available',
    status: 'Confirmed',
    image: '/src/assets/images/mikkys_signature_fade_1792242196486.jpg',
  },
  {
    id: 'bk-102',
    serviceId: 'beard-trim',
    serviceName: 'Beard Trim',
    price: 10,
    date: 'Tue, Nov 18, 2025',
    time: '11:30 AM',
    barber: 'Master Barber',
    status: 'Confirmed',
    image: '/src/assets/images/haircut_beard_grooming_1792138006451.jpg',
  },
  {
    id: 'bk-103',
    serviceId: 'hair-wash',
    serviceName: 'Hair Wash',
    price: 8,
    date: 'Fri, Nov 21, 2025',
    time: '3:00 PM',
    barber: 'Any Available',
    status: 'Confirmed',
    image: '/src/assets/images/barber_tools_craft_1792138007201.jpg',
  },
];
