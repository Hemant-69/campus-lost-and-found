import {
  PrismaClient,
  Role,
  AccountStatus,
  PostType,
  PostCategory,
  CampusLocation,
  PostStatus,
  ClaimStatus,
  ImageKind,
  ReportTargetType,
  ReportReason,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Valid 1x1 WebP binary image generated in-memory without external files
const TINY_WEBP = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x4c, 0x0d, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00,
  0x10, 0x07, 0x10, 0x11, 0x11, 0x88, 0x88, 0xfe, 0x07, 0x00,
]);

async function main() {
  console.log("Starting database seeding for Campus Lost and Found on Neon DB...");

  // Clean existing seed data for idempotency
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.idVerification.deleteMany();
  await prisma.image.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  // 1. Seed Administrator
  const admin = await prisma.user.upsert({
    where: { email: "admin@campus.edu" },
    update: {},
    create: {
      name: "Campus Administrator",
      email: "admin@campus.edu",
      passwordHash: adminPasswordHash,
      rollNumber: "ADMIN001",
      department: "Campus Security & Administration",
      year: 4,
      role: Role.ADMIN,
      status: AccountStatus.VERIFIED,
    },
  });
  console.log(`Administrator created: ${admin.email}`);

  // 2. Seed Verified Students
  const student1 = await prisma.user.upsert({
    where: { email: "rahul.sharma@campus.edu" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "rahul.sharma@campus.edu",
      passwordHash,
      rollNumber: "21CS042",
      department: "Computer Science",
      year: 3,
      role: Role.STUDENT,
      status: AccountStatus.VERIFIED,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "ananya.patel@campus.edu" },
    update: {},
    create: {
      name: "Ananya Patel",
      email: "ananya.patel@campus.edu",
      passwordHash,
      rollNumber: "22EC018",
      department: "Electronics & Communication",
      year: 2,
      role: Role.STUDENT,
      status: AccountStatus.VERIFIED,
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: "priya.deshmukh@campus.edu" },
    update: {},
    create: {
      name: "Priya Deshmukh",
      email: "priya.deshmukh@campus.edu",
      passwordHash,
      rollNumber: "20IT077",
      department: "Information Technology",
      year: 4,
      role: Role.STUDENT,
      status: AccountStatus.VERIFIED,
    },
  });

  const student4 = await prisma.user.upsert({
    where: { email: "arjun.nair@campus.edu" },
    update: {},
    create: {
      name: "Arjun Nair",
      email: "arjun.nair@campus.edu",
      passwordHash,
      rollNumber: "21ME035",
      department: "Mechanical Engineering",
      year: 3,
      role: Role.STUDENT,
      status: AccountStatus.VERIFIED,
    },
  });

  // 3. Seed Pending Student (Waiting for ID Verification)
  const studentPending = await prisma.user.upsert({
    where: { email: "vikram.singh@campus.edu" },
    update: {},
    create: {
      name: "Vikram Singh",
      email: "vikram.singh@campus.edu",
      passwordHash,
      rollNumber: "23CE091",
      department: "Civil Engineering",
      year: 1,
      role: Role.STUDENT,
      status: AccountStatus.PENDING,
    },
  });

  const pendingIdImg = await prisma.image.create({
    data: {
      kind: ImageKind.ID_CARD,
      ownerId: studentPending.id,
      mimeType: "image/webp",
      width: 800,
      height: 600,
      sizeBytes: TINY_WEBP.length,
      data: TINY_WEBP,
      thumb: TINY_WEBP,
    },
  });

  await prisma.idVerification.upsert({
    where: { userId: studentPending.id },
    update: {},
    create: {
      userId: studentPending.id,
      imageId: pendingIdImg.id,
      status: AccountStatus.PENDING,
    },
  });

  // 4. Seed Rejected Student (Can see reason and re-upload)
  const studentRejected = await prisma.user.upsert({
    where: { email: "sneha.reddy@campus.edu" },
    update: {},
    create: {
      name: "Sneha Reddy",
      email: "sneha.reddy@campus.edu",
      passwordHash,
      rollNumber: "22BT014",
      department: "Biotechnology",
      year: 2,
      role: Role.STUDENT,
      status: AccountStatus.REJECTED,
    },
  });

  const rejectedIdImg = await prisma.image.create({
    data: {
      kind: ImageKind.ID_CARD,
      ownerId: studentRejected.id,
      mimeType: "image/webp",
      width: 800,
      height: 600,
      sizeBytes: TINY_WEBP.length,
      data: TINY_WEBP,
      thumb: TINY_WEBP,
    },
  });

  await prisma.idVerification.upsert({
    where: { userId: studentRejected.id },
    update: {},
    create: {
      userId: studentRejected.id,
      imageId: rejectedIdImg.id,
      status: AccountStatus.REJECTED,
      rejectionReason: "ID card photo was blurry and roll number was illegible. Please re-upload a clear photograph.",
      reviewedAt: new Date(),
    },
  });

  console.log("Students and verification states seeded.");

  // Helper to create image records
  async function createPostImage(ownerId: string) {
    return prisma.image.create({
      data: {
        kind: ImageKind.POST,
        ownerId,
        mimeType: "image/webp",
        width: 800,
        height: 600,
        sizeBytes: TINY_WEBP.length,
        data: TINY_WEBP,
        thumb: TINY_WEBP,
      },
    });
  }

  // 5. Seed Diverse Posts
  // Post 1: FOUND Titan Watch (OPEN, has pending claim from Ananya)
  const img1 = await createPostImage(student1.id);
  const post1 = await prisma.post.create({
    data: {
      type: PostType.FOUND,
      title: "Titan Analog Watch near Central Library Steps",
      description: "Found an analog wristwatch with steel strap and blue dial on the central steps of the library. It is currently safe with me.",
      category: PostCategory.OTHER,
      dateLostOrFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: CampusLocation.LIBRARY,
      locationDetail: "Main entrance staircase, second flight",
      verificationDetail: "Engraved initials R.K. on the stainless steel back cover",
      status: PostStatus.OPEN,
      userId: student1.id,
      images: {
        create: [{ imageId: img1.id, sortOrder: 0 }],
      },
    },
  });

  // Pending claim by student2 on Post 1
  await prisma.claim.create({
    data: {
      postId: post1.id,
      claimantId: student2.id,
      description: "This is my brother's Titan watch with silver link strap and blue textured face.",
      verificationAnswer: "Initials R.K. engraved on the back for Ramesh Kumar.",
      status: ClaimStatus.PENDING,
    },
  });

  // Post 2: FOUND Dell 65W Charger (CLAIM_IN_PROGRESS, approved claim with 6-digit code for Priya)
  const img2 = await createPostImage(student2.id);
  const post2 = await prisma.post.create({
    data: {
      type: PostType.FOUND,
      title: "Dell 65W USB-C Laptop Charger",
      description: "Found a black Dell Type-C power adapter plugged into an outlet on desk 14 in the quiet study hall.",
      category: PostCategory.ELECTRONICS,
      dateLostOrFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: CampusLocation.LIBRARY,
      locationDetail: "Second floor quiet study hall, table 14",
      verificationDetail: "Yellow university lab inventory sticker on the power brick cable wrap",
      status: PostStatus.CLAIM_IN_PROGRESS,
      userId: student2.id,
      images: {
        create: [{ imageId: img2.id, sortOrder: 0 }],
      },
    },
  });

  const handoverDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  await prisma.claim.create({
    data: {
      postId: post2.id,
      claimantId: student3.id,
      description: "I forgot my black Dell 65W power brick after studying for exams on Tuesday afternoon.",
      verificationAnswer: "Has a yellow university lab sticker wrapped around the output cord.",
      status: ClaimStatus.APPROVED,
      handoverCode: "849201",
      handoverDeadline,
    },
  });

  // Post 3: FOUND Leather Wallet (RETURNED, completed handover)
  const img3 = await createPostImage(student4.id);
  const post3 = await prisma.post.create({
    data: {
      type: PostType.FOUND,
      title: "Brown Leather Wallet found near Sports Ground Pavilion",
      description: "Found a bifold leather wallet on the spectator benches near the football field. Contains university bus cards and keys.",
      category: PostCategory.WALLET,
      dateLostOrFound: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      location: CampusLocation.SPORTS_GROUND,
      locationDetail: "Pavilion row 3 bench",
      verificationDetail: "Library barcode 9042 and folded metro pass in inner slot",
      status: PostStatus.RETURNED,
      userId: student4.id,
      images: {
        create: [{ imageId: img3.id, sortOrder: 0 }],
      },
    },
  });

  await prisma.claim.create({
    data: {
      postId: post3.id,
      claimantId: student1.id,
      description: "My brown Woodland leather wallet containing my campus card and metro pass.",
      verificationAnswer: "Metro pass inside with library card ending in 9042.",
      status: ClaimStatus.APPROVED,
      handoverCode: "612450",
      handoverCompletedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Post 4: LOST Casio Calculator (OPEN)
  const img4 = await createPostImage(student1.id);
  const post4 = await prisma.post.create({
    data: {
      type: PostType.LOST,
      title: "Casio Scientific Calculator fx-991EX",
      description: "Misplaced my calculator during the Engineering Mathematics tutorial. It has silver lettering and a protective hard cover.",
      category: PostCategory.ELECTRONICS,
      dateLostOrFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: CampusLocation.BLOCK_B,
      locationDetail: "Room B-204, middle row left side",
      status: PostStatus.OPEN,
      userId: student1.id,
      images: {
        create: [{ imageId: img4.id, sortOrder: 0 }],
      },
    },
  });

  // Post 5: LOST Blue Wildcraft Backpack (OPEN)
  const img5 = await createPostImage(student3.id);
  await prisma.post.create({
    data: {
      type: PostType.LOST,
      title: "Navy Blue Wildcraft Backpack with College Books",
      description: "Left my college backpack on the cafeteria seating bench during lunch hour. Contains third year IT lecture notes and stationary pouch.",
      category: PostCategory.BAGS,
      dateLostOrFound: new Date(),
      location: CampusLocation.CANTEEN,
      locationDetail: "Outdoor patio seating bench near juices corner",
      status: PostStatus.OPEN,
      userId: student3.id,
      images: {
        create: [{ imageId: img5.id, sortOrder: 0 }],
      },
    },
  });

  // Post 6: FOUND Room Keys (OPEN)
  const img6 = await createPostImage(student4.id);
  await prisma.post.create({
    data: {
      type: PostType.FOUND,
      title: "Set of Three Room Keys with Brass Keychain",
      description: "Found three keys on a circular ring with a brass tag near the Hostel Block A entrance corridor.",
      category: PostCategory.KEYS,
      dateLostOrFound: new Date(),
      location: CampusLocation.HOSTEL_BOYS,
      locationDetail: "Corridor junction between Block 1 and 2",
      verificationDetail: "Brass tag stamped with room number 312 and small red plastic ring on main key",
      status: PostStatus.OPEN,
      userId: student4.id,
      images: {
        create: [{ imageId: img6.id, sortOrder: 0 }],
      },
    },
  });

  // Post 7: LOST College Student ID Card and Bus Pass (OPEN)
  const img7 = await createPostImage(student2.id);
  await prisma.post.create({
    data: {
      type: PostType.LOST,
      title: "College Student Identity Card and City Bus Pass",
      description: "Lost my lanyard with student ID card and quarterly route bus pass between Block A and Main Gate.",
      category: PostCategory.ID_CARDS,
      dateLostOrFound: new Date(),
      location: CampusLocation.MAIN_GATE,
      locationDetail: "Pathway leading from Block A to security checkpoint",
      status: PostStatus.OPEN,
      userId: student2.id,
      images: {
        create: [{ imageId: img7.id, sortOrder: 0 }],
      },
    },
  });

  // Post 8: FOUND Sony Headphones (OPEN)
  const img8 = await createPostImage(student3.id);
  await prisma.post.create({
    data: {
      type: PostType.FOUND,
      title: "Sony Over-Ear Wireless Headphones in Black Case",
      description: "Found a black zippered audio case containing noise-cancelling headphones left in the auditorium after the guest seminar.",
      category: PostCategory.ELECTRONICS,
      dateLostOrFound: new Date(Date.now() - 12 * 60 * 60 * 1000),
      location: CampusLocation.AUDITORIUM,
      locationDetail: "Row G, seat 18",
      verificationDetail: "Custom white braided auxiliary cable inside case pouch and small sticker on headband",
      status: PostStatus.OPEN,
      userId: student3.id,
      images: {
        create: [{ imageId: img8.id, sortOrder: 0 }],
      },
    },
  });

  console.log("Sample posts and claims created across all categories.");

  // 6. Public Comments and Replies on Post 1
  const parentComment = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: student3.id,
      content: "Is this watch currently deposited at the central security office desk?",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: student1.id,
      parentId: parentComment.id,
      content: "No, I currently have it with me in Block A. Real owner can submit a claim here and we will meet at the Security Office.",
    },
  });

  // 7. Direct Messaging Thread on Post 4 (LOST Calculator)
  const u1 = student1.id < student2.id ? student1.id : student2.id;
  const u2 = student1.id < student2.id ? student2.id : student1.id;

  const conversation = await prisma.conversation.create({
    data: {
      postId: post4.id,
      userOneId: u1,
      userTwoId: u2,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: student2.id,
      content: "Hello Rahul, I found a Casio fx-991EX on table 4 in B-204 right after class. Does it have silver initials on back?",
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
      isRead: true,
      readAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: student1.id,
      content: "Yes, exactly! Those are my initials RS. Can we meet near the library reception at 4 PM?",
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
      isRead: false,
    },
  });

  // 8. Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: NotificationType.CLAIM_RECEIVED,
        title: "New Ownership Claim Submitted",
        message: 'Ananya Patel filed a claim for your found item "Titan Analog Watch near Central Library Steps".',
        link: `/posts/${post1.id}?tab=claims`,
      },
      {
        userId: student3.id,
        type: NotificationType.CLAIM_APPROVED,
        title: "Claim Approved - Handover Code Ready",
        message: 'Your claim for "Dell 65W USB-C Laptop Charger" was approved! Your handover code is 849201.',
        link: "/my-claims",
      },
      {
        userId: student2.id,
        type: NotificationType.NEW_MESSAGE,
        title: "New Message Received",
        message: 'Rahul Sharma sent a message regarding "Casio Scientific Calculator fx-991EX".',
        link: `/messages/${conversation.id}`,
      },
      {
        userId: student3.id,
        type: NotificationType.COMMENT_REPLY,
        title: "Reply to Your Comment",
        message: 'Rahul Sharma replied to your question on "Titan Analog Watch near Central Library Steps".',
        link: `/posts/${post1.id}#comments`,
      },
    ],
  });

  // 9. Sample Report for Admin Moderation Queue
  await prisma.report.create({
    data: {
      reporterId: student2.id,
      targetType: ReportTargetType.POST,
      postId: post1.id,
      reason: ReportReason.SPAM,
      note: "Sample report test entry to populate administrator reports review queue.",
      status: "OPEN",
    },
  });

  // 10. Audit Log Entries
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "DATABASE_INITIALIZED",
        targetType: "SYSTEM",
        targetId: "SYSTEM_INIT",
        details: JSON.stringify({ provider: "Neon Serverless Postgres" }),
      },
      {
        actorId: student1.id,
        action: "POST_CREATED",
        targetType: "POST",
        targetId: post1.id,
        details: JSON.stringify({ type: "FOUND", category: "OTHER" }),
      },
      {
        actorId: student2.id,
        action: "CLAIM_SUBMITTED",
        targetType: "CLAIM",
        targetId: post1.id,
        details: JSON.stringify({ postId: post1.id }),
      },
    ],
  });

  console.log("Seeding completed successfully on Neon DB.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
