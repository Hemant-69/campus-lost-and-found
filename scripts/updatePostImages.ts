import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ITEM_IMAGES: Record<string, string> = {
  // Titan Watch
  "Titan Analog Watch near Central Library Steps":
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
  // Dell Charger
  "Dell 65W USB-C Laptop Charger":
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
  // Brown Leather Wallet
  "Brown Leather Wallet found near Sports Ground Pavilion":
    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
  // Casio Calculator
  "Casio Scientific Calculator fx-991EX":
    "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&q=80",
  // Backpack
  "Navy Blue Wildcraft Backpack with College Books":
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  // Keys
  "Set of Three Room Keys with Brass Keychain":
    "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&q=80",
  // Student ID Card
  "College Student Identity Card and City Bus Pass":
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
  // Sony Headphones
  "Sony Over-Ear Wireless Headphones in Black Case":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
};

async function main() {
  console.log("Fetching and feeding real item photos to the database...");

  const posts = await prisma.post.findMany({
    include: {
      images: {
        include: {
          image: true,
        },
      },
    },
  });

  for (const post of posts) {
    const imageUrl = ITEM_IMAGES[post.title];
    if (!imageUrl) {
      console.log(`No image mapped for post: "${post.title}"`);
      continue;
    }

    console.log(`Downloading photo for: "${post.title}"...`);
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) {
        console.error(`Failed to download ${imageUrl}: ${res.statusText}`);
        continue;
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (post.images.length > 0) {
        const imageRecord = post.images[0].image;
        await prisma.image.update({
          where: { id: imageRecord.id },
          data: {
            mimeType: "image/jpeg",
            width: 800,
            height: 600,
            sizeBytes: buffer.length,
            data: buffer,
            thumb: buffer,
          },
        });
        console.log(`Updated existing image ${imageRecord.id} (${buffer.length} bytes) for "${post.title}"`);
      } else {
        const newImg = await prisma.image.create({
          data: {
            kind: "POST",
            ownerId: post.userId,
            mimeType: "image/jpeg",
            width: 800,
            height: 600,
            sizeBytes: buffer.length,
            data: buffer,
            thumb: buffer,
          },
        });
        await prisma.postImage.create({
          data: {
            postId: post.id,
            imageId: newImg.id,
            sortOrder: 0,
          },
        });
        console.log(`Created new image ${newImg.id} (${buffer.length} bytes) for "${post.title}"`);
      }
    } catch (err) {
      console.error(`Error processing photo for "${post.title}":`, err);
    }
  }

  console.log("All item images have been successfully fed to the database!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
