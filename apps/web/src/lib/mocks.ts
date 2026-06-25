import type { Workspace, Project, Job, Insight, Slide, Upload, BriefingData, Outline, Export } from './api/types'

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    plan: 'pro',
    createdAt: '2024-01-15T10:00:00Z',
    _count: { projects: 12, members: 8 },
  },
  {
    id: 'ws-2',
    name: 'Personal',
    slug: 'personal',
    plan: 'free',
    createdAt: '2024-02-01T10:00:00Z',
    _count: { projects: 3, members: 1 },
  },
]

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    workspaceId: 'ws-1',
    name: 'Q3 2024 Investor Deck',
    description: 'Board presentation for Series B funding round',
    status: 'ready',
    slideCount: 24,
    createdAt: '2024-06-10T08:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  },
  {
    id: 'proj-2',
    workspaceId: 'ws-1',
    name: 'Product Roadmap H2',
    description: 'Internal roadmap for engineering and design teams',
    status: 'processing',
    slideCount: 18,
    createdAt: '2024-06-18T09:00:00Z',
    updatedAt: '2024-06-25T11:00:00Z',
  },
  {
    id: 'proj-3',
    workspaceId: 'ws-1',
    name: 'Sales Kickoff 2025',
    description: 'Annual sales team alignment and strategy',
    status: 'draft',
    slideCount: 0,
    createdAt: '2024-06-25T10:00:00Z',
    updatedAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'proj-4',
    workspaceId: 'ws-2',
    name: 'Conference Talk: AI in Design',
    status: 'ready',
    slideCount: 32,
    createdAt: '2024-05-20T12:00:00Z',
    updatedAt: '2024-06-01T16:00:00Z',
  },
]

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    projectId: 'proj-2',
    type: 'transcription',
    status: 'completed',
    progress: 100,
    message: 'Transcription complete — 47 minutes processed',
    createdAt: '2024-06-25T09:00:00Z',
    completedAt: '2024-06-25T09:08:00Z',
  },
  {
    id: 'job-2',
    projectId: 'proj-2',
    type: 'analysis',
    status: 'running',
    progress: 67,
    message: 'Extracting key themes and structure…',
    createdAt: '2024-06-25T09:08:00Z',
  },
  {
    id: 'job-3',
    projectId: 'proj-2',
    type: 'generation',
    status: 'pending',
    progress: 0,
    message: 'Waiting for analysis to complete',
    createdAt: '2024-06-25T09:08:00Z',
  },
]

export const mockInsights: Insight[] = [
  {
    id: 'ins-1',
    projectId: 'proj-1',
    type: 'summary',
    content: 'This deck focuses on Series B fundraising, emphasizing 3x YoY growth and expanding enterprise customer base.',
    confidence: 0.95,
  },
  {
    id: 'ins-2',
    projectId: 'proj-1',
    type: 'keyword',
    content: 'Series B, ARR growth, enterprise, go-to-market, international expansion',
    confidence: 0.91,
  },
  {
    id: 'ins-3',
    projectId: 'proj-1',
    type: 'recommendation',
    content: 'Slide 7 has too much text. Consider splitting into two slides or using visuals to replace the third paragraph.',
    confidence: 0.88,
  },
  {
    id: 'ins-4',
    projectId: 'proj-1',
    type: 'sentiment',
    content: 'Overall tone is confident and data-driven. Narrative arc is strong through slide 15, then weakens slightly.',
    confidence: 0.79,
  },
]

export const mockSlides: Slide[] = Array.from({ length: 24 }, (_, i) => ({
  id: `slide-${i + 1}`,
  projectId: 'proj-1',
  index: i,
  title: [
    'The Problem', 'Our Solution', 'Market Opportunity', 'Product Demo',
    'Business Model', 'Traction', 'Team', 'Financials', 'The Ask',
    'Go-to-Market Strategy', 'Competitive Landscape', 'Customer Testimonials',
    'Product Roadmap', 'Technology Stack', 'Partnerships', 'Risk Mitigation',
    'Appendix: Unit Economics', 'Appendix: Cohort Analysis', 'Appendix: Team Bios',
    'Appendix: Market Research', 'Appendix: Customer References', 'Appendix: Financials Detail',
    'Thank You', 'Contact',
  ][i] ?? `Slide ${i + 1}`,
  content: i === 0 ? '60% of enterprise presentations fail to convert because they lack structured narrative.' : undefined,
  bgColor: `hsl(${220 + i * 3} 18% ${9 + (i % 3)}%)`,
}))

export const mockBriefing: BriefingData = {
  projectId: 'proj-1',
  audience: 'Series B investors with enterprise SaaS background',
  objective: 'Secure $15M Series B at $75M valuation to accelerate international expansion',
  tone: 'Confident, data-driven, strategic',
  duration: 20,
  keyMessages: [
    '3x ARR growth in 18 months',
    'Enterprise-first GTM with 94% net retention',
    'Proven team with two prior exits',
  ],
  context: 'Presenting to a panel of 4 investors at our SF office. Followed by 45-minute Q&A.',
}

export const mockOutline: Outline = {
  projectId: 'proj-1',
  sections: [
    { id: 'sec-1', title: 'Hook & Problem', slides: ['slide-1', 'slide-2'], order: 0 },
    { id: 'sec-2', title: 'Solution & Product', slides: ['slide-3', 'slide-4', 'slide-5'], order: 1 },
    { id: 'sec-3', title: 'Market & Business', slides: ['slide-6', 'slide-7', 'slide-8'], order: 2 },
    { id: 'sec-4', title: 'Traction & Team', slides: ['slide-9', 'slide-10'], order: 3 },
    { id: 'sec-5', title: 'The Ask', slides: ['slide-11', 'slide-12'], order: 4 },
  ],
}

export const mockExports: Export[] = [
  {
    id: 'exp-1',
    projectId: 'proj-1',
    format: 'pptx',
    status: 'ready',
    url: '#',
    createdAt: '2024-06-20T15:00:00Z',
  },
  {
    id: 'exp-2',
    projectId: 'proj-1',
    format: 'pdf',
    status: 'ready',
    url: '#',
    createdAt: '2024-06-20T15:05:00Z',
  },
]
