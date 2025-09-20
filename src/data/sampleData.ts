import { TrekPackage } from '../types';

export const samplePackages: TrekPackage[] = [
  {
    id: '1',
    title: 'Munnar Tea Garden Trek',
    description: 'Experience the breathtaking beauty of Munnar\'s rolling tea plantations and misty mountains. This moderate trek takes you through emerald green tea gardens, spice plantations, and offers stunning views of the Western Ghats.',
    location: 'Munnar',
    duration: 3,
    difficulty: 'Moderate',
    price: 8500,
    max_group_size: 15,
    images: [
      'https://images.pexels.com/photos/4254563/pexels-photo-4254563.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/6794458/pexels-photo-6794458.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4254557/pexels-photo-4254557.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival and Tea Museum Visit',
        description: 'Arrive in Munnar, check into accommodation, visit tea museum and factory',
        activities: ['Hotel check-in', 'Tea museum tour', 'Evening leisure walk']
      },
      {
        day: 2,
        title: 'Anamudi Peak Trek',
        description: 'Early morning trek to South India\'s highest peak',
        activities: ['Early morning departure', 'Guided trek to Anamudi', 'Lunch at base camp', 'Return to hotel']
      },
      {
        day: 3,
        title: 'Echo Point and Departure',
        description: 'Visit scenic spots and departure',
        activities: ['Echo Point visit', 'Local market shopping', 'Departure']
      }
    ],
    included: [
      'Professional trekking guide',
      '2 nights accommodation',
      'All meals during trek',
      'Transportation',
      'First aid kit',
      'Permits and entry fees'
    ],
    excluded: [
      'Personal expenses',
      'Travel insurance',
      'Tips and gratuities',
      'Laundry services'
    ],
    created_at: '2024-01-15T00:00:00Z',
    rating: 4.8,
    total_reviews: 124
  },
  {
    id: '2',
    title: 'Wayanad Wildlife Sanctuary Trek',
    description: 'Explore the pristine forests of Wayanad Wildlife Sanctuary, home to elephants, tigers, and diverse flora. This challenging trek offers wildlife sightings and spectacular views of the Western Ghats.',
    location: 'Wayanad',
    duration: 4,
    difficulty: 'Difficult',
    price: 12000,
    max_group_size: 12,
    images: [
      'https://images.pexels.com/photos/1906794/pexels-photo-1906794.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival and Orientation',
        description: 'Arrival, briefing, and acclimatization',
        activities: ['Hotel check-in', 'Safety briefing', 'Equipment check', 'Evening nature walk']
      },
      {
        day: 2,
        title: 'Sanctuary Core Area Trek',
        description: 'Deep forest trekking with wildlife spotting',
        activities: ['Early morning departure', 'Core area trekking', 'Wildlife photography', 'Camp setup']
      },
      {
        day: 3,
        title: 'Chembra Peak Ascent',
        description: 'Trek to Wayanad\'s highest peak',
        activities: ['Pre-dawn start', 'Chembra peak trek', 'Heart-shaped lake visit', 'Summit celebration']
      },
      {
        day: 4,
        title: 'Soochipara Falls and Departure',
        description: 'Waterfall visit and departure',
        activities: ['Waterfall trek', 'Swimming', 'Local lunch', 'Departure']
      }
    ],
    included: [
      'Expert naturalist guide',
      '3 nights accommodation (2 hotel + 1 camp)',
      'All meals',
      'Transportation',
      'Camping equipment',
      'Wildlife permits'
    ],
    excluded: [
      'Personal trekking gear',
      'Travel insurance',
      'Personal expenses',
      'Camera fees'
    ],
    created_at: '2024-01-16T00:00:00Z',
    rating: 4.9,
    total_reviews: 89
  },
  {
    id: '3',
    title: 'Thekkady Spice Trail Adventure',
    description: 'Discover the aromatic spice gardens of Thekkady while trekking through cardamom hills and pepper vines. Perfect for beginners with beautiful landscapes and cultural experiences.',
    location: 'Thekkady',
    duration: 2,
    difficulty: 'Easy',
    price: 6000,
    max_group_size: 20,
    images: [
      'https://images.pexels.com/photos/4220967/pexels-photo-4220967.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Spice Plantation Trek',
        description: 'Explore aromatic spice gardens and plantations',
        activities: ['Spice garden tour', 'Traditional lunch', 'Bamboo rafting', 'Cultural program']
      },
      {
        day: 2,
        title: 'Periyar Lake and Wildlife',
        description: 'Boat safari and nature walk',
        activities: ['Periyar Lake boat ride', 'Wildlife spotting', 'Nature walk', 'Departure']
      }
    ],
    included: [
      'Local guide',
      '1 night accommodation',
      'All meals',
      'Boat safari',
      'Spice garden tour',
      'Cultural activities'
    ],
    excluded: [
      'Personal expenses',
      'Shopping',
      'Additional activities'
    ],
    created_at: '2024-01-17T00:00:00Z',
    rating: 4.6,
    total_reviews: 156
  },
  {
    id: '4',
    title: 'Idukki Dam Valley Expedition',
    description: 'Experience the engineering marvel of Idukki Dam while trekking through pristine valleys and dense forests. This expert-level trek offers challenging terrain and rewarding views.',
    location: 'Idukki',
    duration: 5,
    difficulty: 'Expert',
    price: 15000,
    max_group_size: 10,
    images: [
      'https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1906794/pexels-photo-1906794.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Base Camp Setup',
        description: 'Arrival and preparation for challenging trek',
        activities: ['Equipment check', 'Fitness assessment', 'Base camp setup', 'Route briefing']
      },
      {
        day: 2,
        title: 'Valley Descent',
        description: 'Challenging descent into Idukki valley',
        activities: ['Early start', 'Technical descent', 'River crossing', 'Camp in valley']
      },
      {
        day: 3,
        title: 'Dam Exploration',
        description: 'Explore the dam area and surrounding wilderness',
        activities: ['Dam viewpoint trek', 'Photography session', 'Wild camping', 'Night sky observation']
      },
      {
        day: 4,
        title: 'Ridge Walk',
        description: 'Challenging ridge walk with panoramic views',
        activities: ['Ridge trail navigation', 'Peak bagging', 'Survival skills', 'Camp under stars']
      },
      {
        day: 5,
        title: 'Summit and Return',
        description: 'Final ascent and return journey',
        activities: ['Summit attempt', 'Victory celebration', 'Descent to base', 'Departure']
      }
    ],
    included: [
      'Expert mountaineering guide',
      'All camping equipment',
      'Safety gear and ropes',
      'All meals',
      'Emergency evacuation insurance',
      'Professional photography'
    ],
    excluded: [
      'Personal mountaineering gear',
      'Travel to base camp',
      'Personal insurance',
      'Medical expenses'
    ],
    created_at: '2024-01-18T00:00:00Z',
    rating: 4.7,
    total_reviews: 43
  },
  {
    id: '5',
    title: 'Athirappilly Rainforest Trek',
    description: 'Discover the majestic Athirappilly Falls, known as the "Niagara of India", while trekking through lush rainforests and experiencing Kerala\'s biodiversity.',
    location: 'Thrissur',
    duration: 3,
    difficulty: 'Moderate',
    price: 9500,
    max_group_size: 16,
    images: [
      'https://images.pexels.com/photos/2662816/pexels-photo-2662816.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Rainforest Introduction',
        description: 'Introduction to rainforest ecosystem',
        activities: ['Forest guide meeting', 'Eco-education session', 'Short nature walk', 'Bird watching']
      },
      {
        day: 2,
        title: 'Athirappilly Falls Trek',
        description: 'Full day trek to the magnificent waterfalls',
        activities: ['Early morning trek', 'Waterfall photography', 'Natural pool swimming', 'Packed lunch by falls']
      },
      {
        day: 3,
        title: 'Vazhachal Falls and Departure',
        description: 'Visit nearby falls and explore local culture',
        activities: ['Vazhachal falls visit', 'Local tribal village', 'Cultural exchange', 'Departure']
      }
    ],
    included: [
      'Certified eco-guide',
      '2 nights eco-lodge stay',
      'All organic meals',
      'Transportation',
      'Forest permits',
      'Photography assistance'
    ],
    excluded: [
      'Personal expenses',
      'Professional camera rent',
      'Additional excursions'
    ],
    created_at: '2024-01-19T00:00:00Z',
    rating: 4.5,
    total_reviews: 98
  },
  {
    id: '6',
    title: 'Nelliampathy Hills Weekend Getaway',
    description: 'Perfect weekend escape to the serene Nelliampathy Hills with orange groves, coffee plantations, and panoramic valley views. Ideal for families and beginners.',
    location: 'Palakkad',
    duration: 2,
    difficulty: 'Easy',
    price: 5500,
    max_group_size: 25,
    images: [
      'https://images.pexels.com/photos/4254563/pexels-photo-4254563.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4254557/pexels-photo-4254557.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Orange Grove Exploration',
        description: 'Easy walk through fragrant orange groves',
        activities: ['Orange plantation tour', 'Fresh fruit tasting', 'Plantation lunch', 'Evening relaxation']
      },
      {
        day: 2,
        title: 'Sunrise Point and Coffee Estates',
        description: 'Early morning sunrise viewing and coffee plantation visit',
        activities: ['Sunrise point trek', 'Coffee plantation tour', 'Local breakfast', 'Departure']
      }
    ],
    included: [
      'Local guide',
      '1 night hill resort stay',
      'All meals',
      'Plantation tours',
      'Transportation',
      'Fresh fruit sampling'
    ],
    excluded: [
      'Personal shopping',
      'Extra meals',
      'Personal expenses'
    ],
    created_at: '2024-01-20T00:00:00Z',
    rating: 4.4,
    total_reviews: 187
  }
];