import { storage } from "./storage.js";

// Define the initial pricing tiers based on existing subscription tiers
const initialPricingTiers = [
  {
    id: "mj_scott",
    name: "MJ Scott",
    description: "Entry-level tier for small teams getting started with performance management",
    monthlyPrice: 999, // $9.99 in cents
    yearlyPrice: 9999, // $99.99 in cents
    maxSeats: 5,
    features: [
      "Basic performance reviews",
      "Simple goal tracking", 
      "Email notifications",
      "Basic reporting",
      "Up to 5 team members"
    ],
    targetMarket: "Small startups and teams",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "forming",
    name: "Forming",
    description: "Perfect for growing teams establishing their performance culture",
    monthlyPrice: 2499, // $24.99 in cents
    yearlyPrice: 24999, // $249.99 in cents
    maxSeats: 25,
    features: [
      "Comprehensive performance reviews",
      "Advanced goal management",
      "360-degree feedback",
      "Team analytics",
      "Email & SMS notifications",
      "Custom competencies",
      "Up to 25 team members"
    ],
    targetMarket: "Small to medium teams",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "storming",
    name: "Storming",
    description: "Ideal for teams navigating growth and establishing processes",
    monthlyPrice: 4999, // $49.99 in cents
    yearlyPrice: 49999, // $499.99 in cents
    maxSeats: 100,
    features: [
      "All Forming features",
      "Department management",
      "Advanced reporting & analytics",
      "Performance calibration",
      "Bulk review management",
      "API access",
      "Priority support",
      "Up to 100 team members"
    ],
    targetMarket: "Growing companies",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "norming",
    name: "Norming",
    description: "For established teams optimizing their performance management",
    monthlyPrice: 9999, // $99.99 in cents
    yearlyPrice: 99999, // $999.99 in cents
    maxSeats: 500,
    features: [
      "All Storming features",
      "Advanced integrations",
      "Custom workflows",
      "Multi-department analytics",
      "White-label options",
      "Dedicated account manager",
      "Up to 500 team members"
    ],
    targetMarket: "Mid-size companies",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "performing",
    name: "Performing",
    description: "Enterprise-grade solution for high-performing organizations",
    monthlyPrice: 19999, // $199.99 in cents
    yearlyPrice: 199999, // $1999.99 in cents
    maxSeats: -1, // Unlimited
    features: [
      "All Norming features",
      "Unlimited team members",
      "Enterprise integrations",
      "Advanced security & compliance",
      "Custom reporting",
      "Dedicated infrastructure",
      "24/7 premium support",
      "Custom training & onboarding"
    ],
    targetMarket: "Large enterprises",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "appsumo",
    name: "AppSumo Lifetime",
    description: "Special lifetime deal for AppSumo customers",
    monthlyPrice: 0, // Lifetime deal
    yearlyPrice: 0, // Lifetime deal
    maxSeats: 50,
    features: [
      "Lifetime access",
      "Performance reviews",
      "Goal management",
      "Basic analytics",
      "Email notifications",
      "Up to 50 team members",
      "AppSumo exclusive features"
    ],
    targetMarket: "AppSumo customers",
    isActive: true,
    sortOrder: 6,
  }
];

export async function seedPricingTiers() {
  console.log("🌱 Starting pricing tiers seeding...");
  
  try {
    // Check if pricing tiers already exist
    const existingTiers = await storage.getPricingTiers();
    
    if (existingTiers.length > 0) {
      console.log(`✅ Pricing tiers already exist (${existingTiers.length} tiers found). Skipping seeding.`);
      return;
    }

    // Create each pricing tier
    for (const tierData of initialPricingTiers) {
      try {
        const createdTier = await storage.createPricingTier(tierData);
        console.log(`✅ Created pricing tier: ${createdTier.name} (${createdTier.id})`);
      } catch (error) {
        console.error(`❌ Failed to create pricing tier ${tierData.id}:`, error);
      }
    }

    console.log("🎉 Pricing tiers seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during pricing tiers seeding:", error);
    throw error;
  }
}

// Allow running this script directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedPricingTiers()
    .then(() => {
      console.log("Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}