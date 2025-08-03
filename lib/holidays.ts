export interface Holiday {
  date: string;
  name: string;
  region: string[];
  type: string;
  description: string;
}

export const holidays: Holiday[] = [
  {
    date: "2025-01-01",
    name: "New Year's Day",
    region: ["Canada", "UK", "USA"],
    type: "Public Holiday",
    description: "Celebrates the first day of the year"
  },
  {
    date: "2025-01-26",
    name: "Republic Day",
    region: ["India"],
    type: "Public Holiday",
    description: "Marks the adoption of India's Constitution"
  },
  {
    date: "2025-02-17",
    name: "Family Day",
    region: ["Canada (ON)"],
    type: "Public Holiday",
    description: "Statutory holiday in many provinces"
  },
  {
    date: "2025-03-01",
    name: "Maha Shivratri",
    region: ["India"],
    type: "Religious (Hindu)",
    description: "Festival honoring Lord Shiva"
  },
  {
    date: "2025-03-29",
    name: "Ramadan Begins (estimate)",
    region: ["Islamic"],
    type: "Religious (Islam)",
    description: "Month of fasting for Muslims"
  },
  {
    date: "2025-04-18",
    name: "Good Friday",
    region: ["Canada", "UK"],
    type: "Religious (Christian)",
    description: "Commemorates the crucifixion of Jesus Christ"
  },
  {
    date: "2025-04-21",
    name: "Easter Monday",
    region: ["Canada", "UK"],
    type: "Religious (Christian)",
    description: "Celebrated the day after Easter Sunday"
  },
  {
    date: "2025-05-27",
    name: "Memorial Day",
    region: ["USA"],
    type: "Public Holiday",
    description: "Honors U.S. military personnel who died in service"
  },
  {
    date: "2025-07-01",
    name: "Canada Day",
    region: ["Canada"],
    type: "Public Holiday",
    description: "Celebrates Canadian Confederation"
  },
  {
    date: "2025-07-04",
    name: "Independence Day",
    region: ["USA"],
    type: "Public Holiday",
    description: "Celebrates American independence"
  },
  {
    date: "2025-08-15",
    name: "Independence Day",
    region: ["India"],
    type: "Public Holiday",
    description: "Marks India's independence from Britain"
  },
  {
    date: "2025-10-02",
    name: "Gandhi Jayanti",
    region: ["India"],
    type: "Public Holiday",
    description: "Honors Mahatma Gandhi"
  },
  {
    date: "2025-10-03",
    name: "Eid al-Adha (estimate)",
    region: ["Islamic"],
    type: "Religious (Islam)",
    description: "Festival of Sacrifice"
  },
  {
    date: "2025-10-13",
    name: "Thanksgiving",
    region: ["Canada"],
    type: "Public Holiday",
    description: "Day of giving thanks"
  },
  {
    date: "2025-10-31",
    name: "Diwali",
    region: ["India"],
    type: "Religious (Hindu)",
    description: "Festival of Lights"
  },
  {
    date: "2025-11-11",
    name: "Remembrance Day",
    region: ["Canada", "UK"],
    type: "Public Holiday",
    description: "Honors military members who died in service"
  },
  {
    date: "2025-11-28",
    name: "Thanksgiving",
    region: ["USA"],
    type: "Public Holiday",
    description: "Celebrated with feasting and gratitude"
  },
  {
    date: "2025-12-25",
    name: "Christmas Day",
    region: ["Canada", "UK", "USA"],
    type: "Religious (Christian)",
    description: "Celebrates the birth of Jesus Christ"
  },
  {
    date: "2025-12-26",
    name: "Boxing Day",
    region: ["Canada", "UK"],
    type: "Public Holiday",
    description: "Traditionally a day for giving to the less fortunate"
  },
  {
    date: "2025-01-14",
    name: "Lohri",
    region: ["India"],
    type: "Religious (Sikh)",
    description: "Harvest festival celebrated in Punjab"
  },
  {
    date: "2025-01-15",
    name: "Pongal",
    region: ["India"],
    type: "Religious (Hindu)",
    description: "Harvest festival in Tamil Nadu"
  },
  {
    date: "2025-01-22",
    name: "Thaipusam",
    region: ["India", "Malaysia"],
    type: "Religious (Hindu)",
    description: "Festival celebrated by the Tamil community"
  },
  {
    date: "2025-03-17",
    name: "St. Patrick's Day",
    region: ["UK", "USA"],
    type: "Cultural/Religious",
    description: "Celebrates Irish heritage and Saint Patrick"
  },
  {
    date: "2025-04-14",
    name: "Baisakhi",
    region: ["India"],
    type: "Religious (Sikh)",
    description: "New Year festival celebrated in Punjab"
  },
  {
    date: "2025-05-01",
    name: "Labour Day",
    region: ["India", "UK"],
    type: "Public Holiday",
    description: "International Workers' Day"
  },
  {
    date: "2025-05-05",
    name: "Cinco de Mayo",
    region: ["USA"],
    type: "Cultural",
    description: "Celebrates the Mexican army's victory over France"
  },
  {
    date: "2025-06-19",
    name: "Juneteenth",
    region: ["USA"],
    type: "Public Holiday",
    description: "Commemorates the emancipation of enslaved African Americans"
  },
  {
    date: "2025-08-12",
    name: "Raksha Bandhan",
    region: ["India"],
    type: "Religious (Hindu)",
    description: "Celebrates the bond between brothers and sisters"
  },
  {
    date: "2025-08-19",
    name: "Janmashtami",
    region: ["India"],
    type: "Religious (Hindu)",
    description: "Marks the birth of Lord Krishna"
  },
  {
    date: "2025-10-02",
    name: "Durga Ashtami",
    region: ["India"],
    type: "Religious (Hindu)",
    description: "Part of the Navratri festival"
  },
  {
    date: "2025-11-01",
    name: "All Saints' Day",
    region: ["UK", "Canada"],
    type: "Religious (Christian)",
    description: "Honors all saints of the church"
  },
  {
    date: "2025-11-04",
    name: "Bhai Dooj",
    region: ["India"],
    type: "Religious (Hindu)",
    description: "Celebrates the bond between brothers and sisters"
  },
  {
    date: "2025-12-12",
    name: "Feast of Our Lady of Guadalupe",
    region: ["USA"],
    type: "Religious (Christian)",
    description: "Honors the Virgin of Guadalupe"
  },
  {
    date: "2025-12-31",
    name: "New Year's Eve",
    region: ["Global"],
    type: "Cultural",
    description: "Celebration of the final day of the Gregorian year"
  }
];

export interface HolidayPreferences {
  regions: string[];
  types: string[];
}

export const defaultHolidayPreferences: HolidayPreferences = {
  regions: ["Canada", "UK", "USA", "India", "Islamic", "Global"],
  types: ["Public Holiday", "Religious (Christian)", "Religious (Hindu)", "Religious (Sikh)", "Religious (Islam)", "Cultural", "Cultural/Religious"]
};

export function getHolidaysForDate(date: Date, preferences: HolidayPreferences = defaultHolidayPreferences): Holiday[] {
  const dateString = date.toISOString().split('T')[0];
  return holidays.filter(holiday => {
    if (holiday.date !== dateString) return false;
    
    // Check if any of the holiday's regions match user preferences
    const regionMatch = holiday.region.some(region => preferences.regions.includes(region));
    
    // Check if the holiday type matches user preferences
    const typeMatch = preferences.types.includes(holiday.type);
    
    return regionMatch && typeMatch;
  });
}

export function getUpcomingHolidays(preferences: HolidayPreferences = defaultHolidayPreferences, limit: number = 10): Holiday[] {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  return holidays
    .filter(holiday => {
      if (holiday.date < todayString) return false;
      
      // Check if any of the holiday's regions match user preferences
      const regionMatch = holiday.region.some(region => preferences.regions.includes(region));
      
      // Check if the holiday type matches user preferences
      const typeMatch = preferences.types.includes(holiday.type);
      
      return regionMatch && typeMatch;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function getHolidayTypeColor(type: string): string {
  switch (type) {
    case "Public Holiday":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Religious (Christian)":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Religious (Hindu)":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Religious (Sikh)":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Religious (Islam)":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Cultural":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    case "Cultural/Religious":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

// New function to generate holiday options for Event Generator
export function getHolidayOptionsForEventGenerator(preferences: HolidayPreferences = defaultHolidayPreferences): string[] {
  // Get all holidays that match user preferences
  const filteredHolidays = holidays.filter(holiday => {
    const regionMatch = holiday.region.some(region => preferences.regions.includes(region));
    const typeMatch = preferences.types.includes(holiday.type);
    return regionMatch && typeMatch;
  });

  // Extract unique holiday names and sort them
  const holidayNames = Array.from(new Set(filteredHolidays.map(holiday => holiday.name)));
  
  // Sort alphabetically
  holidayNames.sort();
  
  // Add "Other" option at the end
  holidayNames.push("Other");
  
  return holidayNames;
}

// Function to get holiday details by name
export function getHolidayDetailsByName(holidayName: string): Holiday | undefined {
  return holidays.find(holiday => holiday.name === holidayName);
}

// Function to get holidays by type for categorization
export function getHolidaysByType(preferences: HolidayPreferences = defaultHolidayPreferences): Record<string, Holiday[]> {
  const filteredHolidays = holidays.filter(holiday => {
    const regionMatch = holiday.region.some(region => preferences.regions.includes(region));
    const typeMatch = preferences.types.includes(holiday.type);
    return regionMatch && typeMatch;
  });

  const holidaysByType: Record<string, Holiday[]> = {};
  
  filteredHolidays.forEach(holiday => {
    if (!holidaysByType[holiday.type]) {
      holidaysByType[holiday.type] = [];
    }
    holidaysByType[holiday.type].push(holiday);
  });

  // Sort holidays within each type by name
  Object.keys(holidaysByType).forEach(type => {
    holidaysByType[type].sort((a, b) => a.name.localeCompare(b.name));
  });

  return holidaysByType;
} 