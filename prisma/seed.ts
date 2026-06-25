import { PrismaClient, PlanTier, MemberRole, ProjectStatus, DeckStatus, SlideLayout } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.info("🌱 Seeding database...");

  // ─── Plans ──────────────────────────────────────────────────────────────────
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { tier: PlanTier.free },
      update: {},
      create: {
        tier: PlanTier.free,
        name: "Free",
        description: "Get started with SlideForge Studio",
        priceMonthlyUsd: 0,
        priceYearlyUsd: 0,
        maxWorkspaceMembers: 3,
        maxProjectsPerWorkspace: 3,
        maxDecksPerProject: 2,
        maxSlidesPerDeck: 10,
        maxStorageGb: 1,
        aiCreditsPerMonth: 20,
        allowCustomBranding: false,
        allowApiAccess: false,
        allowSso: false,
      },
    }),
    prisma.plan.upsert({
      where: { tier: PlanTier.starter },
      update: {},
      create: {
        tier: PlanTier.starter,
        name: "Starter",
        description: "For small teams getting serious about presentations",
        priceMonthlyUsd: 2900,
        priceYearlyUsd: 29000,
        maxWorkspaceMembers: 10,
        maxProjectsPerWorkspace: 25,
        maxDecksPerProject: 10,
        maxSlidesPerDeck: 50,
        maxStorageGb: 10,
        aiCreditsPerMonth: 200,
        allowCustomBranding: true,
        allowApiAccess: false,
        allowSso: false,
      },
    }),
    prisma.plan.upsert({
      where: { tier: PlanTier.pro },
      update: {},
      create: {
        tier: PlanTier.pro,
        name: "Pro",
        description: "For growing teams with advanced needs",
        priceMonthlyUsd: 7900,
        priceYearlyUsd: 79000,
        maxWorkspaceMembers: 50,
        maxProjectsPerWorkspace: 100,
        maxDecksPerProject: 50,
        maxSlidesPerDeck: 200,
        maxStorageGb: 100,
        aiCreditsPerMonth: 1000,
        allowCustomBranding: true,
        allowApiAccess: true,
        allowSso: false,
      },
    }),
    prisma.plan.upsert({
      where: { tier: PlanTier.enterprise },
      update: {},
      create: {
        tier: PlanTier.enterprise,
        name: "Enterprise",
        description: "Custom limits, SSO, dedicated support",
        priceMonthlyUsd: 0,
        priceYearlyUsd: 0,
        maxWorkspaceMembers: 9999,
        maxProjectsPerWorkspace: 9999,
        maxDecksPerProject: 9999,
        maxSlidesPerDeck: 9999,
        maxStorageGb: 9999,
        aiCreditsPerMonth: 9999,
        allowCustomBranding: true,
        allowApiAccess: true,
        allowSso: true,
      },
    }),
  ]);

  console.info(`  ✓ Seeded ${plans.length} plans`);

  // ─── Demo workspace & user ──────────────────────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@slideforge.io" },
    update: {},
    create: {
      email: "demo@slideforge.io",
      name: "Demo User",
      emailVerified: true,
    },
  });

  const demoWorkspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: demoUser.id,
        workspaceId: demoWorkspace.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      workspaceId: demoWorkspace.id,
      role: MemberRole.owner,
    },
  });

  const freePlan = plans.find((p) => p.tier === PlanTier.free);
  if (!freePlan) throw new Error("Free plan not found after seed");

  await prisma.subscription.upsert({
    where: { workspaceId: demoWorkspace.id },
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      planId: freePlan.id,
      status: "trialing",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // ─── Demo brand kit ─────────────────────────────────────────────────────────
  await prisma.brandKit.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      workspaceId: demoWorkspace.id,
      name: "Default Brand",
      primaryColor: "#2563EB",
      secondaryColor: "#7C3AED",
      accentColor: "#F59E0B",
      backgroundColor: "#FFFFFF",
      fontHeading: "Inter",
      fontBody: "Inter",
      isDefault: true,
    },
  });

  // ─── Demo project & deck ─────────────────────────────────────────────────────
  const demoProject = await prisma.project.upsert({
    where: { id: "00000000-0000-4000-8000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000002",
      workspaceId: demoWorkspace.id,
      createdByUserId: demoUser.id,
      name: "Demo Project",
      description: "Sample project created by the seed script",
      status: ProjectStatus.ready,
    },
  });

  const demoDeck = await prisma.deck.upsert({
    where: { id: "00000000-0000-4000-8000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000003",
      projectId: demoProject.id,
      workspaceId: demoWorkspace.id,
      createdByUserId: demoUser.id,
      title: "Welcome to SlideForge Studio",
      description: "A sample deck demonstrating available layouts",
      status: DeckStatus.ready,
      slideCount: 3,
    },
  });

  const sampleSlides = [
    {
      position: 0,
      layout: SlideLayout.title,
      content: {
        heading: "Welcome to SlideForge Studio",
        subheading: "AI-powered presentations, built for teams",
      },
    },
    {
      position: 1,
      layout: SlideLayout.content,
      content: {
        heading: "What you can do",
        bullets: [
          "Upload documents and let AI generate your deck",
          "Customize with your brand kit",
          "Collaborate with your team in real-time",
          "Export to PPTX, PDF, or HTML",
        ],
      },
    },
    {
      position: 2,
      layout: SlideLayout.metrics,
      content: {
        heading: "By the numbers",
        metrics: [
          { label: "Time saved", value: "80%", change: "+20% vs manual" },
          { label: "Avg slides", value: "24", change: "per project" },
          { label: "Exports", value: "3 formats", change: "PPTX, PDF, HTML" },
        ],
      },
    },
  ];

  for (const slide of sampleSlides) {
    await prisma.slide.upsert({
      where: {
        deckId_position: {
          deckId: demoDeck.id,
          position: slide.position,
        },
      },
      update: {},
      create: {
        deckId: demoDeck.id,
        position: slide.position,
        layout: slide.layout,
        content: slide.content,
        aiGenerated: false,
      },
    });
  }

  console.info(`  ✓ Seeded demo workspace, user, project, and deck`);
  console.info("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
