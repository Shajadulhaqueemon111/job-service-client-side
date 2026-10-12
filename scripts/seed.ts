import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../lib/mongodb";
import { User, Provider, Category, Area, ServiceRequest, Review, PayoutRequest } from "../models";
import { INITIAL_BD_AREAS } from "../lib/bd-data";

async function seed() {
  console.log("🌱 Starting ShebaBD Database Seeding...");
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Provider.deleteMany({}),
    Category.deleteMany({}),
    Area.deleteMany({}),
    ServiceRequest.deleteMany({}),
    Review.deleteMany({}),
    PayoutRequest.deleteMany({}),
  ]);
  console.log("🧹 Cleared existing database records.");

  // Password hashes
  const adminPassword = await bcrypt.hash("Admin@123456", 10);
  const commonPassword = await bcrypt.hash("Password123", 10);

  // 1. Create Admin User
  const admin = await User.create({
    name: "System Admin (ShebaBD)",
    email: "admin@shebabd.com",
    password: adminPassword,
    phone: "01711000000",
    role: "admin",
    status: "active",
    twoFactorEnabled: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    address: "Gulshan-2, Dhaka",
  });
  console.log("✅ Admin user created: admin@shebabd.com / Admin@123456");

  // 2. Create Regular Customers
  const customer1 = await User.create({
    name: "Tarek Mahmud",
    email: "tarek@gmail.com",
    password: commonPassword,
    phone: "01712345678",
    role: "user",
    status: "active",
    twoFactorEnabled: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    address: "House 24, Road 7, Dhanmondi, Dhaka",
  });

  const customer2 = await User.create({
    name: "Sadia Sultana",
    email: "sadia@gmail.com",
    password: commonPassword,
    phone: "01812345678",
    role: "user",
    status: "active",
    twoFactorEnabled: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    address: "Block D, Mirpur-10, Dhaka",
  });
  console.log("✅ Customers created: tarek@gmail.com, sadia@gmail.com / Password123");

  // 3. Create Categories
  const categoryData = [
    {
      name: "AC Repair & Servicing",
      nameBn: "এসি মেরামত ও সার্ভিসিং",
      slug: "ac-repair",
      icon: "Wind",
      description: "Comprehensive AC maintenance, jet wash, gas refilling, compressor repair, and installation.",
      descriptionBn: "জেট ওয়াশ, গ্যাস রিফিল, কম্প্রেসার মেরামত এবং নতুন এসি ইনস্টলেশন সুবিধা।",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
      isPopular: true,
      order: 1,
    },
    {
      name: "Electrician",
      nameBn: "ইলেকট্রিশিয়ান সার্ভিস",
      slug: "electrician",
      icon: "Zap",
      description: "Short circuit repair, house wiring, ceiling fan, DB box, switch & socket installation.",
      descriptionBn: "শর্ট সার্কিট সমাধান, ওয়্যারিং, ফ্যান, ডিবি বক্স ও সুইচ-সকেট ফিটিং।",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
      isPopular: true,
      order: 2,
    },
    {
      name: "Plumbing & Sanitary",
      nameBn: "প্লাম্বিং ও পাইপলাইন",
      slug: "plumber",
      icon: "Wrench",
      description: "Water pipe leakage, bathroom fittings, motor installation, sink drainage unclogging.",
      descriptionBn: "পানির পাইপ লিক ঠিক করা, বাথরুম ফিটিংস, পানির মোটর ও ড্রেনেজ পরিষ্কার।",
      image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80",
      isPopular: true,
      order: 3,
    },
    {
      name: "Home & Online Tutor",
      nameBn: "গৃহশিক্ষক ও টিউটরিং",
      slug: "tutor",
      icon: "GraduationCap",
      description: "Bangla & English Medium, HSC/SSC exam prep, Math, Science, and Spoken English.",
      descriptionBn: "বাংলা ও ইংলিশ মিডিয়াম, এসএসসি/এইচএসসি প্রস্তুতি, গণিত ও বিজ্ঞান গৃহশিক্ষক।",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
      isPopular: true,
      order: 4,
    },
    {
      name: "House Cleaning & Maid",
      nameBn: "বাসা ও অফিস ক্লিনিং",
      slug: "house-cleaning",
      icon: "Sparkles",
      description: "Deep home cleaning, bathroom cleaning, kitchen degreasing, and sofa shampoo wash.",
      descriptionBn: "পুরো বাসা ডিপ ক্লিনিং, বাথরুম, কিচেন ও সোফা শ্যাম্পু ওয়াশ সার্ভিস।",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
      isPopular: true,
      order: 5,
    },
    {
      name: "Home Painting & Polish",
      nameBn: "রঙ মিস্ত্রি ও পেইন্টিং",
      slug: "home-painting",
      icon: "Paintbrush",
      description: "Interior & exterior wall painting, damp proofing, lacquer polish for wooden doors.",
      descriptionBn: "দেয়ালে আধুনিক রঙ, ড্যাম্প প্রুফিং এবং কাঠের দরজায় উন্নত পালিশ।",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80",
      isPopular: true,
      order: 6,
    },
    {
      name: "Appliance Repair",
      nameBn: "হোম অ্যাপ্লায়েন্স মেরামত",
      slug: "appliance-repair",
      icon: "Tv",
      description: "Refrigerator, washing machine, microwave oven, TV, and water heater repair.",
      descriptionBn: "ফ্রিজ, ওয়াশিং মেশিন, মাইক্রোওয়েভ ওভেন এবং গিজার মেরামত।",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
      isPopular: true,
      order: 7,
    },
    {
      name: "Carpentry & Furniture",
      nameBn: "কাঠমিস্ত্রি ও ফার্নিচার",
      slug: "carpentry",
      icon: "Hammer",
      description: "Custom wooden furniture repair, door lock installation, wardrobe fixing.",
      descriptionBn: "কাঠের ফার্নিচার মেরামত, দরজার লক পরিবর্তন এবং ফিটিংস সেবা।",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
      isPopular: false,
      order: 8,
    },
  ];

  const categories = await Category.insertMany(categoryData);
  console.log(`✅ Created ${categories.length} categories.`);

  // 4. Create Areas
  const areas = await Area.insertMany(INITIAL_BD_AREAS);
  console.log(`✅ Created ${areas.length} Bangladesh areas.`);

  // 5. Create Providers (Users + Provider profiles)
  const providersData = [
    {
      name: "Rafiqul Islam",
      email: "rafiq.ac@shebabd.com",
      phone: "01715123456",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
      categorySlug: "ac-repair",
      businessTitle: "Master AC Cool & Engineering Services",
      bio: "10+ years experienced certified HVAC technician in Dhaka. Specialist in Daikin, Gree, General, Walton, and Panasonic inverter AC master jet wash, leak repairs, and gas refilling. Fast doorstep service within 1 hour.",
      skills: ["Inverter AC Repair", "Jet Wash Cleaning", "Gas Refill R410/R32", "Compressor Replacement", "Split AC Installation"],
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Mirpur",
      address: "Plot 12, Main Road, Mirpur-10, Dhaka",
      experienceYears: 10,
      hourlyRate: 500,
      priceRangeMin: 600,
      priceRangeMax: 4500,
      rating: 4.9,
      reviewCount: 38,
      completedJobsCount: 142,
      isVerified: true,
      verificationStatus: "approved",
      galleryImages: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
      ],
    },
    {
      name: "Kamal Hossain",
      email: "kamal.electric@shebabd.com",
      phone: "01815987654",
      avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&q=80",
      categorySlug: "electrician",
      businessTitle: "Quick Fix Electrical Solutions Dhaka",
      bio: "Diploma electrical engineer offering residential and corporate electrical diagnostics, circuit breaker repairs, power load balance, and light fitting across Dhanmondi, Mohammadpur, and Lalmatia.",
      skills: ["Short Circuit Troubleshooting", "DB Box Setup", "IPS & Inverter Wiring", "Substation Support", "Lighting Automation"],
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Dhanmondi",
      address: "Road 27, Dhanmondi, Dhaka",
      experienceYears: 7,
      hourlyRate: 400,
      priceRangeMin: 400,
      priceRangeMax: 3000,
      rating: 4.8,
      reviewCount: 29,
      completedJobsCount: 98,
      isVerified: true,
      verificationStatus: "approved",
      galleryImages: [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
      ],
    },
    {
      name: "Jahangir Alam",
      email: "jahangir.plumb@shebabd.com",
      phone: "01915444333",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&q=80",
      categorySlug: "plumber",
      businessTitle: "Dhaka Plumbing & Sanitary Pro Care",
      bio: "Expert plumber serving Gulshan, Banani, and Baridhara. We handle concealed pipe leak detections with modern thermal cameras, geyser pipeline installations, and high-pressure water pump motor setup.",
      skills: ["Leak Detection", "Geyser Pipeline Fitting", "Motor Pump Repair", "Bathroom Commode Fitting", "Sewer Line Unclogging"],
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Gulshan",
      address: "Gulshan-1 Circle, Dhaka",
      experienceYears: 12,
      hourlyRate: 450,
      priceRangeMin: 500,
      priceRangeMax: 5000,
      rating: 4.9,
      reviewCount: 52,
      completedJobsCount: 210,
      isVerified: true,
      verificationStatus: "approved",
      galleryImages: [
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80",
      ],
    },
    {
      name: "Engr. Tanvir Ahmed",
      email: "tanvir.tutor@shebabd.com",
      phone: "01719223344",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
      categorySlug: "tutor",
      businessTitle: "EduCare Science & Mathematics Tuition",
      bio: "BUET graduate tutor with 6 years experience mentoring English Version & Bangla Medium students from Class 8 to HSC. Focused on conceptual clarity in Physics, Chemistry, and Higher Math.",
      skills: ["HSC Physics & Math", "SSC Science", "English Version Tuition", "O/A Level Mathematics", "Admission Prep"],
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Uttara",
      address: "Sector 3, Uttara, Dhaka",
      experienceYears: 6,
      hourlyRate: 800,
      priceRangeMin: 3500,
      priceRangeMax: 12000,
      rating: 5.0,
      reviewCount: 18,
      completedJobsCount: 65,
      isVerified: true,
      verificationStatus: "approved",
      galleryImages: [
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      ],
    },
    {
      name: "Sumon Miah",
      email: "sumon.clean@shebabd.com",
      phone: "01819334455",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80",
      categorySlug: "house-cleaning",
      businessTitle: "Chittagong Deep Clean Specialists",
      bio: "Serving Agrabad, Nasirabad, and Halishahar with top-tier industrial vacuuming, deep wash, kitchen oil removal, and office disinfection. Reliable team with verified background checks.",
      skills: ["Home Deep Clean", "Sofa & Carpet Wash", "Bathroom Acid Wash", "Kitchen Degreasing", "Water Tank Cleaning"],
      division: "Chattogram",
      district: "Chattogram",
      upazila: "Kotwali",
      address: "Agrabad Commercial Area, Chattogram",
      experienceYears: 5,
      hourlyRate: 350,
      priceRangeMin: 1200,
      priceRangeMax: 8000,
      rating: 4.7,
      reviewCount: 21,
      completedJobsCount: 85,
      isVerified: true,
      verificationStatus: "approved",
      galleryImages: [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
      ],
    },
    {
      name: "Habibur Rahman",
      email: "habib.paint@shebabd.com",
      phone: "01611778899",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
      categorySlug: "home-painting",
      businessTitle: "Color Craft Painting & Damp Solutions",
      bio: "Berger and Asian Paints certified master painter. Complete wall moisture waterproofing, texture coatings, smooth putty finishes, and wood burnish.",
      skills: ["Plastic Paint", "Wall Putty Finish", "Damp Waterproofing", "Wood Polish & Duco", "Exterior Weathercoat"],
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Mohammadpur",
      address: "Town Hall, Mohammadpur, Dhaka",
      experienceYears: 9,
      hourlyRate: 400,
      priceRangeMin: 2000,
      priceRangeMax: 25000,
      rating: 4.8,
      reviewCount: 15,
      completedJobsCount: 54,
      isVerified: true,
      verificationStatus: "approved",
      galleryImages: [
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
      ],
    },
    {
      name: "Shahinur Islam",
      email: "shahin.appliance@shebabd.com",
      phone: "01711223388",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
      categorySlug: "appliance-repair",
      businessTitle: "Sylhet Quick Appliance Care",
      bio: "Repair specialist for non-cooling refrigerators, washing machine spin motor failures, microwave magnetrons, and LED TV backlight replacements in Sylhet Sadar.",
      skills: ["Fridge Gas Charge", "Washing Machine Motherboard", "Microwave Magnetron", "Water Purifier Ro Setup", "Geyser Heating Element"],
      division: "Sylhet",
      district: "Sylhet",
      upazila: "Sylhet Sadar",
      address: "Zindabazar, Sylhet",
      experienceYears: 8,
      hourlyRate: 400,
      priceRangeMin: 500,
      priceRangeMax: 4000,
      rating: 4.9,
      reviewCount: 24,
      completedJobsCount: 78,
      isVerified: true,
      verificationStatus: "approved",
      galleryImages: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      ],
    },
    {
      name: "Belal Hossain",
      email: "belal.carpenter@shebabd.com",
      phone: "01911445566",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
      categorySlug: "carpentry",
      businessTitle: "Modern Woodcraft & Interior Furniture",
      bio: "Experienced carpenter for custom closet builds, modular kitchen cabinets, door fitting, and high-end furniture maintenance.",
      skills: ["Door Hanging & Locks", "Kitchen Cabinets", "Bed & Sofa Frame Repair", "Plywood Cutting & Edge Band", "Drawer Channels"],
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Badda",
      address: "Middle Badda, Dhaka",
      experienceYears: 6,
      hourlyRate: 350,
      priceRangeMin: 400,
      priceRangeMax: 8000,
      rating: 4.6,
      reviewCount: 12,
      completedJobsCount: 42,
      isVerified: false,
      verificationStatus: "pending", // Sample pending provider for Admin verification testing!
      galleryImages: [
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
      ],
    },
  ];

  const createdProviders = [];
  for (const p of providersData) {
    const user = await User.create({
      name: p.name,
      email: p.email,
      password: commonPassword,
      phone: p.phone,
      role: "provider",
      status: "active",
      twoFactorEnabled: true,
      avatar: p.avatar,
      address: p.address,
    });

    const categoryObj = categories.find((c) => c.slug === p.categorySlug);

    const provider = await Provider.create({
      user: user._id,
      category: categoryObj?._id || categories[0]._id,
      businessTitle: p.businessTitle,
      bio: p.bio,
      skills: p.skills,
      areas: [areas[0]._id, areas[1]._id],
      division: p.division,
      district: p.district,
      upazila: p.upazila,
      address: p.address,
      phone: p.phone,
      experienceYears: p.experienceYears,
      hourlyRate: p.hourlyRate,
      priceRangeMin: p.priceRangeMin,
      priceRangeMax: p.priceRangeMax,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isVerified: p.isVerified,
      verificationStatus: p.verificationStatus,
      galleryImages: p.galleryImages,
      completedJobsCount: p.completedJobsCount,
      isAvailable: true,
    });

    createdProviders.push(provider);
  }
  console.log(`✅ Created ${createdProviders.length} service providers.`);

  // 6. Create Service Requests (completed, accepted, pending) with Commission & Profit Accounting
  const reqCompleted1 = await ServiceRequest.create({
    user: customer1._id,
    provider: createdProviders[0]._id, // Rafiqul (AC)
    category: categories[0]._id,
    title: "Gree 1.5 Ton Inverter AC Jet Wash & Gas Check",
    description: "The AC is not cooling properly and blowing room temperature air. Need thorough indoor & outdoor jet wash.",
    division: "Dhaka",
    district: "Dhaka",
    area: "Dhanmondi 27",
    address: "House 24, Road 7, Dhanmondi, Dhaka",
    phone: "01712345678",
    preferredDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    preferredTime: "10:30 AM",
    estimatedBudget: 1500,
    finalPrice: 1600,
    commissionRate: 10,
    commissionAmount: 160,
    providerEarnings: 1440,
    paymentStatus: "paid",
    paymentMethod: "bkash",
    transactionId: "BK9X4Y8Z",
    senderMfsNumber: "01712345678",
    paidAmount: 1600,
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "completed",
    hasReview: true,
    providerNotes: "Indoor unit evaporator cleaned and refilled 150g R410 gas. Tested cooling ok.",
  });

  const reqCompleted2 = await ServiceRequest.create({
    user: customer2._id,
    provider: createdProviders[2]._id, // Jahangir (Plumber)
    category: categories[2]._id,
    title: "Concealed Pipe Leakage Repair in Bathroom",
    description: "Water dripping into the false ceiling below. Need immediate detection and pipe joint replacement.",
    division: "Dhaka",
    district: "Dhaka",
    area: "Mirpur-10",
    address: "Block D, Mirpur-10, Dhaka",
    phone: "01812345678",
    preferredDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    preferredTime: "02:00 PM",
    estimatedBudget: 1200,
    finalPrice: 1200,
    commissionRate: 10,
    commissionAmount: 120,
    providerEarnings: 1080,
    paymentStatus: "paid",
    paymentMethod: "nagad",
    transactionId: "NG8K3M1P",
    senderMfsNumber: "01812345678",
    paidAmount: 1200,
    paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "completed",
    hasReview: true,
    providerNotes: "Broken PVC elbow joint replaced. Water leakage completely stopped.",
  });

  // Additional Completed Requests for rich profit accounting
  await ServiceRequest.create({
    user: customer1._id,
    provider: createdProviders[1]._id, // Kamal (Electrician)
    category: categories[1]._id,
    title: "Complete Residential DB Box & Short Circuit Rewiring",
    description: "Fixed short circuits and reorganized the main DB breaker panel with modern Schneider breakers.",
    division: "Dhaka",
    district: "Dhaka",
    area: "Dhanmondi",
    address: "House 24, Road 7, Dhanmondi",
    phone: "01712345678",
    preferredDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    preferredTime: "04:00 PM",
    estimatedBudget: 2200,
    finalPrice: 2200,
    commissionRate: 10,
    commissionAmount: 220,
    providerEarnings: 1980,
    paymentStatus: "paid",
    paymentMethod: "bkash",
    transactionId: "BK2T7L9W",
    senderMfsNumber: "01712345678",
    paidAmount: 2200,
    paidAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    status: "completed",
    hasReview: false,
    providerNotes: "Rewiring completed and load balanced.",
  });

  await ServiceRequest.create({
    user: customer2._id,
    provider: createdProviders[3]._id, // Tanvir (Tutor)
    category: categories[3]._id,
    title: "HSC Higher Mathematics Conceptual Crash Course (1 Month)",
    description: "12 sessions conceptual mentoring for Calculus and Coordinate Geometry.",
    division: "Dhaka",
    district: "Dhaka",
    area: "Uttara",
    address: "Sector 3, Uttara, Dhaka",
    phone: "01812345678",
    preferredDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    preferredTime: "06:00 PM",
    estimatedBudget: 6000,
    finalPrice: 6000,
    commissionRate: 10,
    commissionAmount: 600,
    providerEarnings: 5400,
    paymentStatus: "paid",
    paymentMethod: "nagad",
    transactionId: "NG5J82D3",
    senderMfsNumber: "01812345678",
    paidAmount: 6000,
    paidAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: "completed",
    hasReview: false,
    providerNotes: "12 online + in-person tutoring sessions completed successfully.",
  });

  // Accepted request for customer1 to test bKash/Nagad checkout live
  await ServiceRequest.create({
    user: customer1._id,
    provider: createdProviders[0]._id, // Rafiqul (AC)
    category: categories[0]._id,
    title: "General Inverter AC Master Servicing & Cooling Check",
    description: "Air conditioner indoor blower cleaning and outdoor condenser coil wash. Ready for payment.",
    division: "Dhaka",
    district: "Dhaka",
    area: "Dhanmondi",
    address: "House 24, Road 7, Dhanmondi",
    phone: "01712345678",
    preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    preferredTime: "11:00 AM",
    estimatedBudget: 1800,
    finalPrice: 1800,
    commissionRate: 10,
    commissionAmount: 180,
    providerEarnings: 1620,
    paymentStatus: "pending",
    status: "accepted",
    hasReview: false,
    providerNotes: "Appointment confirmed. Final bill ৳1800. Please proceed with payment via bKash or Nagad.",
  });

  // Pending request for testing user & provider dashboards
  await ServiceRequest.create({
    user: customer1._id,
    provider: createdProviders[1]._id, // Kamal (Electrician)
    category: categories[1]._id,
    title: "Main DB Circuit Breaker Tripping Frequently",
    description: "Whenever the water pump or microwave is turned on, the 32A breaker trips. Need load balancing and check for short circuits.",
    division: "Dhaka",
    district: "Dhaka",
    area: "Dhanmondi",
    address: "House 24, Road 7, Dhanmondi",
    phone: "01712345678",
    preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    preferredTime: "11:00 AM",
    estimatedBudget: 800,
    commissionRate: 10,
    commissionAmount: 80,
    providerEarnings: 720,
    paymentStatus: "pending",
    status: "pending",
    hasReview: false,
  });

  // Accepted request for customer2
  await ServiceRequest.create({
    user: customer2._id,
    provider: createdProviders[0]._id, // Rafiqul
    category: categories[0]._id,
    title: "New 2 Ton Split AC Installation",
    description: "Need wall mounting brackets and copper piping connection for newly bought AC.",
    division: "Dhaka",
    district: "Dhaka",
    area: "Mirpur-10",
    address: "Block D, Mirpur-10",
    phone: "01812345678",
    preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    preferredTime: "03:30 PM",
    estimatedBudget: 2500,
    commissionRate: 10,
    commissionAmount: 250,
    providerEarnings: 2250,
    paymentStatus: "pending",
    status: "accepted",
    hasReview: false,
  });

  console.log("✅ Created sample service requests with 10% commission calculations.");

  // 7. Create Reviews on Completed Requests
  await Review.create({
    user: customer1._id,
    provider: createdProviders[0]._id,
    serviceRequest: reqCompleted1._id,
    rating: 5,
    comment: "Rafiq bhai came on time with all professional jet wash tools. My AC is cooling like brand new now! Very polite and fair pricing. Highly recommended in Dhaka!",
    providerResponse: "Thank you so much Tarek bhai for trusting our service. Always happy to help!",
    isFlagged: false,
  });

  await Review.create({
    user: customer2._id,
    provider: createdProviders[2]._id,
    serviceRequest: reqCompleted2._id,
    rating: 5,
    comment: "দারুণ কাজ! বাথরুমের লুকানো পাইপ লিক অনেক দিন ধরে ডিস্টার্ব করছিল, জাহাঙ্গীর ভাই এসে ৩০ মিনিটেই বের করে সুন্দরভাবে ফিক্স করে দিয়েছেন। ধন্যবাদ সেবা বিডি!",
    providerResponse: "ধন্যবাদ সাদিয়া আপু। কোনো সমস্যা হলে যেকোনো সময় কল করবেন।",
    isFlagged: false,
  });

  console.log("✅ Created authentic customer reviews.");

  // 8. Update Provider Wallet Balances and Sample Payout History
  await Provider.findByIdAndUpdate(createdProviders[0]._id, {
    walletBalance: 2440,
    totalEarnings: 2940,
    totalWithdrawn: 500,
    bkashNumber: "01719112233",
  });

  await PayoutRequest.create({
    provider: createdProviders[0]._id,
    user: createdProviders[0].user,
    amount: 500,
    paymentMethod: "bkash",
    accountNumber: "01719112233",
    accountType: "personal",
    status: "approved",
    transactionId: "BK_OUT_7X8M2A",
    adminNotes: "Instant MFS Payout processed successfully",
    processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  await Provider.findByIdAndUpdate(createdProviders[1]._id, {
    walletBalance: 1980,
    totalEarnings: 1980,
    totalWithdrawn: 0,
    bkashNumber: "01812345678",
  });

  await Provider.findByIdAndUpdate(createdProviders[2]._id, {
    walletBalance: 1080,
    totalEarnings: 1080,
    totalWithdrawn: 0,
    nagadNumber: "01812345678",
  });

  await Provider.findByIdAndUpdate(createdProviders[3]._id, {
    walletBalance: 5400,
    totalEarnings: 5400,
    totalWithdrawn: 0,
    nagadNumber: "01819223344",
  });

  console.log("✅ Seeded provider wallet balances and sample MFS payouts.");

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n================ DEMO CREDENTIALS ================");
  console.log("Admin:     admin@shebabd.com    / Admin@123456");
  console.log("Provider:  rafiq.ac@shebabd.com / Password123");
  console.log("Customer:  tarek@gmail.com      / Password123");
  console.log("===================================================\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
