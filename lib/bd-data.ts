export interface BDAreaItem {
  division: string;
  divisionBn: string;
  district: string;
  districtBn: string;
  upazila: string;
  upazilaBn: string;
  areaName: string;
  areaNameBn: string;
  isPopular?: boolean;
}

export const BD_DIVISIONS = [
  { id: "dhaka", name: "Dhaka", nameBn: "ঢাকা" },
  { id: "chattogram", name: "Chattogram", nameBn: "চট্টগ্রাম" },
  { id: "rajshahi", name: "Rajshahi", nameBn: "রাজশাহী" },
  { id: "khulna", name: "Khulna", nameBn: "খুলনা" },
  { id: "barishal", name: "Barishal", nameBn: "বরিশাল" },
  { id: "sylhet", name: "Sylhet", nameBn: "সিলেট" },
  { id: "rangpur", name: "Rangpur", nameBn: "রংপুর" },
  { id: "mymensingh", name: "Mymensingh", nameBn: "ময়মনসিংহ" },
];

export const BD_DISTRICTS_BY_DIVISION: Record<string, { name: string; nameBn: string }[]> = {
  dhaka: [
    { name: "Dhaka", nameBn: "ঢাকা" },
    { name: "Gazipur", nameBn: "গাজীপুর" },
    { name: "Narayanganj", nameBn: "নারায়ণগঞ্জ" },
    { name: "Tangail", nameBn: "টাঙ্গাইল" },
    { name: "Narsingdi", nameBn: "নরসিংদী" },
    { name: "Faridpur", nameBn: "ফরিদপুর" },
    { name: "Manikganj", nameBn: "মানিকগঞ্জ" },
  ],
  chattogram: [
    { name: "Chattogram", nameBn: "চট্টগ্রাম" },
    { name: "Cox's Bazar", nameBn: "কক্সবাজার" },
    { name: "Cumilla", nameBn: "কুমিল্লা" },
    { name: "Feni", nameBn: "ফেনী" },
    { name: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া" },
    { name: "Noakhali", nameBn: "নোয়াখালী" },
  ],
  sylhet: [
    { name: "Sylhet", nameBn: "সিলেট" },
    { name: "Moulvibazar", nameBn: "মৌলভীবাজার" },
    { name: "Habiganj", nameBn: "হবিগঞ্জ" },
    { name: "Sunamganj", nameBn: "সুনামগঞ্জ" },
  ],
  rajshahi: [
    { name: "Rajshahi", nameBn: "রাজশাহী" },
    { name: "Bogura", nameBn: "বগুড়া" },
    { name: "Pabna", nameBn: "পাবনা" },
    { name: "Sirajganj", nameBn: "সিরাজগঞ্জ" },
    { name: "Naogaon", nameBn: "নওগাঁ" },
  ],
  khulna: [
    { name: "Khulna", nameBn: "খুলনা" },
    { name: "Jashore", nameBn: "যশোর" },
    { name: "Kushtia", nameBn: "কুষ্টিয়া" },
    { name: "Satkhira", nameBn: "সাতক্ষীরা" },
  ],
  barishal: [
    { name: "Barishal", nameBn: "বরিশাল" },
    { name: "Patuakhali", nameBn: "পটুয়াখালী" },
    { name: "Bhola", nameBn: "ভোলা" },
  ],
  rangpur: [
    { name: "Rangpur", nameBn: "রংপুর" },
    { name: "Dinajpur", nameBn: "দিনাজপুর" },
    { name: "Kurigram", nameBn: "কুড়িগ্রাম" },
  ],
  mymensingh: [
    { name: "Mymensingh", nameBn: "ময়মনসিংহ" },
    { name: "Jamalpur", nameBn: "জামালপুর" },
    { name: "Netrokona", nameBn: "নেত্রকোণা" },
  ],
};

export const INITIAL_BD_AREAS: BDAreaItem[] = [
  // Dhaka City Popular Areas
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Mirpur", upazilaBn: "মিরপুর", areaName: "Mirpur-10", areaNameBn: "মিরপুর-১০", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Mirpur", upazilaBn: "মিরপুর", areaName: "Mirpur DOHS", areaNameBn: "মিরপুর ডিওএইচএস", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Dhanmondi", upazilaBn: "ধানমন্ডি", areaName: "Dhanmondi 27", areaNameBn: "ধানমন্ডি ২৭", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Gulshan", upazilaBn: "গুলশান", areaName: "Gulshan-1", areaNameBn: "গুলশান-১", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Gulshan", upazilaBn: "গুলশান", areaName: "Gulshan-2", areaNameBn: "গুলশান-২", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Banani", upazilaBn: "বনানী", areaName: "Banani Block E", areaNameBn: "বনানী ব্লক ই", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Uttara", upazilaBn: "উত্তরা", areaName: "Uttara Sector 3", areaNameBn: "উত্তরা সেক্টর ৩", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Uttara", upazilaBn: "উত্তরা", areaName: "Uttara Sector 7", areaNameBn: "উত্তরা সেক্টর ৭", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Mohammadpur", upazilaBn: "মোহাম্মদপুর", areaName: "Mohammadpur Town Hall", areaNameBn: "মোহাম্মদপুর টাউন হল", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Badda", upazilaBn: "বাড্ডা", areaName: "Middle Badda", areaNameBn: "মধ্য বাড্ডা", isPopular: false },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Vatara", upazilaBn: "ভাটারা", areaName: "Bashundhara R/A", areaNameBn: "বসুন্ধরা আ/এ", isPopular: true },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Khilgaon", upazilaBn: "খিলগাঁও", areaName: "Khilgaon Taltola", areaNameBn: "খিলগাঁও তালতলা", isPopular: false },
  { division: "Dhaka", divisionBn: "ঢাকা", district: "Dhaka", districtBn: "ঢাকা", upazila: "Motijheel", upazilaBn: "মতিঝিল", areaName: "Dilkusha", areaNameBn: "দিলকুশা", isPopular: false },
  
  // Chattogram City Popular Areas
  { division: "Chattogram", divisionBn: "চট্টগ্রাম", district: "Chattogram", districtBn: "চট্টগ্রাম", upazila: "Kotwali", upazilaBn: "কোতোয়ালী", areaName: "Agrabad C/A", areaNameBn: "আগ্রাবাদ বা/এ", isPopular: true },
  { division: "Chattogram", divisionBn: "চট্টগ্রাম", district: "Chattogram", districtBn: "চট্টগ্রাম", upazila: "Panchlaish", upazilaBn: "পাঁচলাইশ", areaName: "Nasirabad Housing", areaNameBn: "নাসিরাবাদ হাউজিং", isPopular: true },
  { division: "Chattogram", divisionBn: "চট্টগ্রাম", district: "Chattogram", districtBn: "চট্টগ্রাম", upazila: "Halishahar", upazilaBn: "হালিশহর", areaName: "Halishahar Block B", areaNameBn: "হালিশহর ব্লক বি", isPopular: true },
  { division: "Chattogram", divisionBn: "চট্টগ্রাম", district: "Chattogram", districtBn: "চট্টগ্রাম", upazila: "Khulshi", upazilaBn: "খুলশী", areaName: "South Khulshi", areaNameBn: "দক্ষিণ খুলশী", isPopular: true },

  // Sylhet City Popular Areas
  { division: "Sylhet", divisionBn: "সিলেট", district: "Sylhet", districtBn: "সিলেট", upazila: "Sylhet Sadar", upazilaBn: "সিলেট সদর", areaName: "Zindabazar", areaNameBn: "জিন্দাবাজার", isPopular: true },
  { division: "Sylhet", divisionBn: "সিলেট", district: "Sylhet", districtBn: "সিলেট", upazila: "Sylhet Sadar", upazilaBn: "সিলেট সদর", areaName: "Amberkhana", areaNameBn: "আম্বরখানা", isPopular: true },
  { division: "Sylhet", divisionBn: "সিলেট", district: "Sylhet", districtBn: "সিলেট", upazila: "Sylhet Sadar", upazilaBn: "সিলেট সদর", areaName: "Shahi Eidgah", areaNameBn: "শাহী ঈদগাহ", isPopular: false },

  // Rajshahi
  { division: "Rajshahi", divisionBn: "রাজশাহী", district: "Rajshahi", districtBn: "রাজশাহী", upazila: "Boalia", upazilaBn: "বোয়ালিয়া", areaName: "Saheb Bazar", areaNameBn: "সাহেব বাজার", isPopular: true },
  { division: "Rajshahi", divisionBn: "রাজশাহী", district: "Rajshahi", districtBn: "রাজশাহী", upazila: "Motihar", upazilaBn: "মতিহার", areaName: "Kazla / RU Campus", areaNameBn: "কাজলা / রাবি ক্যাম্পাস", isPopular: false },

  // Khulna
  { division: "Khulna", divisionBn: "খুলনা", district: "Khulna", districtBn: "খুলনা", upazila: "Sonadanga", upazilaBn: "সোনাডাঙ্গা", areaName: "Sonadanga Bus Stand", areaNameBn: "সোনাডাঙ্গা বাস স্ট্যান্ড", isPopular: true },
  { division: "Khulna", divisionBn: "খুলনা", district: "Khulna", districtBn: "খুলনা", upazila: "Khalishpur", upazilaBn: "খালিশপুর", areaName: "Khalishpur Housing", areaNameBn: "খালিশপুর হাউজিং", isPopular: false },
];
