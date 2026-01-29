import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const interests = [
  // Hobbies
  { name: "Reading", category: "hobbies" },
  { name: "Gaming", category: "hobbies" },
  { name: "Cooking", category: "hobbies" },
  { name: "Photography", category: "hobbies" },
  { name: "Gardening", category: "hobbies" },
  { name: "Travel", category: "hobbies" },
  { name: "Music", category: "hobbies" },
  { name: "Movies & TV", category: "hobbies" },
  { name: "Art & Design", category: "hobbies" },
  { name: "Writing", category: "hobbies" },

  // Sports & Fitness
  { name: "Running", category: "sports" },
  { name: "Hiking", category: "sports" },
  { name: "Yoga", category: "sports" },
  { name: "Cycling", category: "sports" },
  { name: "Swimming", category: "sports" },
  { name: "Team Sports", category: "sports" },
  { name: "Golf", category: "sports" },
  { name: "Fitness & Gym", category: "sports" },

  // Tech
  { name: "AI & Machine Learning", category: "tech" },
  { name: "Web Development", category: "tech" },
  { name: "Mobile Apps", category: "tech" },
  { name: "Data Science", category: "tech" },
  { name: "Cybersecurity", category: "tech" },
  { name: "Open Source", category: "tech" },
  { name: "Startups", category: "tech" },
  { name: "Product Management", category: "tech" },

  // Professional Development
  { name: "Leadership", category: "professional" },
  { name: "Public Speaking", category: "professional" },
  { name: "Mentoring", category: "professional" },
  { name: "Career Growth", category: "professional" },
  { name: "Networking", category: "professional" },

  // Lifestyle
  { name: "Coffee & Tea", category: "lifestyle" },
  { name: "Wine & Craft Beer", category: "lifestyle" },
  { name: "Sustainability", category: "lifestyle" },
  { name: "Parenting", category: "lifestyle" },
  { name: "Pets", category: "lifestyle" },
  { name: "Volunteering", category: "lifestyle" },
];

async function main() {
  console.log("Seeding interests...");

  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { name: interest.name },
      update: {},
      create: interest,
    });
  }

  console.log(`Seeded ${interests.length} interests`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
