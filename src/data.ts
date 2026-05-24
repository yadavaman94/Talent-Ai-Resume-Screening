import { JobDescription, Candidate, ScreeningResult } from './types';

export const SAMPLE_JOBS: JobDescription[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Engineer (React & Go)',
    department: 'Engineering',
    experience: '5+ years',
    location: 'Remote (US/Canada)',
    minSalary: '$130,000 - $160,000',
    requiredSkills: ['React', 'Go', 'TypeScript', 'PostgreSQL', 'Docker', 'RESTful APIs'],
    preferredSkills: ['Kubernetes', 'AWS', 'GraphQL', 'Microservices', 'CI/CD'],
    descriptionText: `We are looking for a Senior Full Stack Engineer to lead development on modern web platforms. You will design scalable system architectures, deploy React frontends, build highly efficient and concurrent microservices using Go, and maintain our database systems. Collaboration, mentoring junior developers, and keeping security and code-quality high are core parts of this role.`
  },
  {
    id: 'job-2',
    title: 'AI / Machine Learning Engineer',
    department: 'AI Lab',
    experience: '3+ years',
    location: 'San Francisco, CA (Hybrid)',
    minSalary: '$150,000 - $190,000',
    requiredSkills: ['Python', 'PyTorch', 'Large Language Models', 'Transformers', 'NLP', 'Git'],
    preferredSkills: ['TypeScript', 'FastAPI', 'Vector Databases', 'HuggingFace', 'CUDA', 'Docker'],
    descriptionText: `Join our AI Lab to research, fine-tune, and deploy state-of-the-art transformer models. You will be building modern prompt-engineering systems, building custom embedding search pipelines using vector databases (like Pinecone/Milvus), fine-tuning smaller open-source models, and integrating those models into core client products via secure APIs.`
  },
  {
    id: 'job-3',
    title: 'UX / Product Designer',
    department: 'Product & Design',
    experience: '2+ years',
    location: 'New York, NY (On-site)',
    minSalary: '$90,000 - $115,000',
    requiredSkills: ['Figma', 'UI Design', 'Wireframing', 'User Testing', 'Prototyping', 'Design Systems'],
    preferredSkills: ['HTML', 'CSS', 'React', 'Motion Design', 'A/B Testing'],
    descriptionText: `We are looking for a creative UI/UX Product Designer who loves creating beautiful, simple, and functional interfaces. You will run user research interviews, construct interactive prototypes, collaborate closely with frontend developers, and establish and expand our enterprise-level design system in Figma.`
  }
];

export const SAMPLE_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@codeforge.io',
    phone: '+1 (555) 234-5678',
    skills: ['React', 'TypeScript', 'Go', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'Git', 'CI/CD'],
    education: 'B.S. in Computer Science - University of Washington (Graduated 2018)',
    experienceSummary: 'Senior Software Engineer with 6 years of experience building modern web architectures. Built and optimized Go microservices handling 10k RPS. Engineered highly responsive React dashboards. Fully implemented CI/CD pipelines with GitHub Actions and AWS EKS.',
    createdAt: '2026-05-20T08:00:00Z',
    rawResumeText: `SARAH JENKINS (Senior Full Stack Engineer)
Email: sarah.j@codeforge.io | Phone: +1 (555) 234-5678

PROFESSIONAL SUMMARY:
Lead Full-Stack Developer with 6+ years of specialized experience in robust, reliable web systems. Expertise in React matching with high-performance Go microservices. Passionate about automated deployments, schema optimization, and developer mentoring.

TECHNICAL SKILLS:
- Frontend: React, TypeScript, Redux, TailWind CSS, Jest
- Backend: Go (Golang), Node.js, PostgreSQL, RESTful APIs, Redis, GraphQL
- DevOps: Kubernetes, Docker, AWS (S3, RDS, ECS), CI/CD (GitHub Actions)

WORK HISTORY:
Senior Software Engineer | TechFrontiers | 2021 - Present
- Spearheaded rewriting a legacy Python monorepo into modular Go microservices, reducing server latency by 45%.
- Maintained React/TypeScript enterprise portals with rich data visualization and virtualized tables.
- Leveraged AWS Lambda, ECS, and Docker to ship features in an agile environment.
- Mentored 4 junior and mid-level web developers.

Software Developer | CloudWeave Solutions | 2018 - 2021
- Standardized REST APIs using Go and PostgreSQL.
- Architected modular components inside a global React design library.
- Managed GitLab pipelines and local Docker Compose environments.

EDUCATION:
B.S. in Computer Science
University of Washington, Seattle (2014 - 2018)`
  },
  {
    id: 'cand-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@aiminds.net',
    phone: '+1 (555) 345-6789',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Transformers', 'Large Language Models', 'Vector Databases', 'Git'],
    education: 'M.S. in Artificial Intelligence - Carnegie Mellon University (Graduated 2022)',
    experienceSummary: 'AI Research Engineer with 4 years of deep-learning focus. Expert in fine-tuning BERT, GPT, and Llama series transformers. Created high-accuracy embedding pipelines with vLLM, LangChain, and Qdrant. Strong knowledge of CUDA compilation and model quantization.',
    createdAt: '2026-05-22T09:30:00Z',
    rawResumeText: `ALEX RIVERA (AI Engineer & Researcher)
Email: alex.rivera@aiminds.net | Phone: +1 (555) 345-6789

PROFESSIONAL SUMMARY:
Specialist in Machine Learning and Natural Language Processing. Well-versed in transformer configurations, custom embedding maps, fine-tuning large-scale models, and training regression models. Extensive research publication record coupled with hands-on systems engineering experience.

TECHNICAL SKILLS:
- AI/ML: Python, PyTorch, HuggingFace Transformers, TensorFlow, Keras, NumPy
- Engineering: FastAPI, Docker, Vector DBs (Pinecone, Qdrant, Milvus), SQL, Linux, Git
- LLMs: PEFT, LoRA, Prompt Engineering, RAG architectures

WORK HISTORY:
AI Solutions Specialist | DeepTech Labs | 2022 - Present
- Designed a production RAG (Retrieval-Augmented Generation) pipeline using PyTorch, HuggingFace, and Pinecone, yielding 92% answer accuracy.
- Fine-tuned open-source Llama model variants using LoRA, optimizing performance for proprietary domain datasets.
- Deployed lightweight FastAPI inference containers using Docker, integrated into core SaaS interfaces.

ML Intern | CMU AI Research Center | 2020 - 2022 (Concurrent)
- Conducted fine-tuning experiments on vision-transformer ensembles.
- Preprocessed over 50TB of raw text corpus for model pretraining.

EDUCATION:
M.S. in Artificial Intelligence
Carnegie Mellon University (2020 - 2022)`
  },
  {
    id: 'cand-3',
    name: 'Emily Chen',
    email: 'em_chen_designs@gmail.com',
    phone: '+1 (555) 456-7890',
    skills: ['Figma', 'UI Design', 'UX Design', 'User Testing', 'Wireframing', 'Prototyping', 'Design Systems', 'Adobe Creative Suite'],
    education: 'B.F.A. in Communication Design - Parsons School of Design (Graduated 2021)',
    experienceSummary: 'UI/UX Designer with over 3 years of digital agency experience. Passionate about user-centric layouts, micro-interactions, and visual storytelling. Designed web/mobile frameworks for FinTech and Healthcare domains. Developed responsive visual designs in Figma.',
    createdAt: '2026-05-23T11:15:00Z',
    rawResumeText: `EMILY CHEN (UI/UX Product Designer)
Email: em_chen_designs@gmail.com | Phone: +1 (555) 456-7890

PROFESSIONAL SUMMARY:
Meticulous Product Designer with 3+ years experience transforming customer feedback into elegant visual products. Specialized in multi-screen layout systems, comprehensive component libraries in Figma, and extensive user-acceptance dry tests.

TECHNICAL SKILLS:
- Tools: Figma, Sketch, Adobe XD, Adobe Creative Suite (Illustrator, Photoshop, After Effects)
- UX Practices: Customer Archetype Personas, Journey Maps, Wireframing, Low & High-Fidelity Prototypes, A/B Testing, Heuristic Review
- Code (Basic): HTML, CSS, Storybook Basics

WORK HISTORY:
Lead UX Designer | PixelPulse Agency | 2022 - Present
- Conducted user interviews and card-sorting exercises for 12+ high-profile consumer portals.
- Maintained a dynamic Figma design system used by 18 frontend web developers, improving team delivery speed by 30%.
- Created detailed interactive prototypes simulating rich state transactions for early investor presentations.

Junior Visual Designer | Vanguard Media | 2021 - 2022
- Created social collateral, landing pages, and vector iconography.
- Assisted under high-growth timelines on mobile UI mocks.

EDUCATION:
B.F.A. in Communication Design
Parsons School of Design, New York (2017 - 2021)`
  },
  {
    id: 'cand-4',
    name: 'Michael Miller',
    email: 'm.miller_developer@outlook.com',
    phone: '+1 (555) 890-1234',
    skills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Node.js', 'Express', 'Git', 'MongoDB'],
    education: 'B.A. in English Literature - University of Chicago (Graduated 2019)',
    experienceSummary: 'Frontend Software Developer with 2+ years of experience focusing on React, CSS, and general web applications. Familiar with building basic REST APIs (Node/Express). Interested in bridging technical implementations and storytelling.',
    createdAt: '2026-05-24T02:00:00Z',
    rawResumeText: `MICHAEL MILLER (Frontend React Engineer)
Email: m.miller_developer@outlook.com | Phone: +1 (555) 890-1234

PROFESSIONAL SUMMARY:
Self-taught developer with educational roots in English literature. Focused on crafting highly accessible interfaces and clean React states. Ready to apply strong logical foundations to team engineering workflows.

TECHNICAL SKILLS:
- Web: React, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind, Redux Basics
- Server: Node.js, Express, MongoDB, REST end-points
- Workflow: Git, GitHub, ESLint, npm

WORK HISTORY:
Junior Web Developer | StoryStream | 2023 - Present
- Crafted and maintained modern blog and landing pages built on React.
- Ensured WCAG AA accessibility compliance across all digital assets.
- Integrated third-party mailing list services and optimized image assets.

Technical Content Writer | Freelance | 2019 - 2023
- Drafted user-focused instructions, product blogs, and help-desk standard operating procedures.
- Wrote basic custom layout pages for small business WordPress portals.

EDUCATION:
B.A. in English Literature
University of Chicago (2015 - 2019)`
  },
  {
    id: 'cand-5',
    name: 'David Thompson',
    email: 'david.thompson.it@mail.com',
    phone: '+1 (555) 123-9876',
    skills: ['Network Security', 'SQL Server', 'Java', 'Linux', 'Help Desk Support', 'Shell Scripting'],
    education: 'Associates Degree in Systems Administration - ITT Technical Institute (2015)',
    experienceSummary: 'IT Administrator and Help Desk specialist with 7 years of enterprise computing support. Adept in network protocol configuration, firewalls, relational databases (MS SQL), Linux, and internal tool maintenance.',
    createdAt: '2026-05-21T10:45:00Z',
    rawResumeText: `DAVID THOMPSON (IT Systems Specialist)
Email: david.thompson.it@mail.com | Phone: +1 (555) 123-9876

PROFESSIONAL SUMMARY:
Experienced Systems Administrator and IT support professional. Focused on high-availability infrastructures, active directory credentials, system patches, and custom SQL configurations.

TECHNICAL SKILLS:
- SysAdmin: Linux (RedHat, Ubuntu), Windows Server, Active Directory, Cisco Routing, Firewalls
- Databases: MS SQL Server, basic MySQL, backup automation
- Coding: Java (Basic), Bash Shell Scripting, PowerShell

WORK HISTORY:
IT Support Administrator | Corporate Solutions Group | 2019 - Present
- Oversee desktop configuration patches and server rack storage safety for 500+ on-site personnel.
- Scripted custom backup schedules in Bash decreasing manual maintenance efforts.
- Resolved tier-2 directory issues and software licensing quotas.

Database Systems Technician | NorthWest IT | 2016 - 2019
- Set up automated SQL alerts and weekly database defragmentation loops.
- Supported remote users with VPN configuration and security keys.

EDUCATION:
A.S. in Systems Administration
ITT Technical Institute (2013 - 2015)`
  }
];

export const PRE_SCREENING_RESULTS: ScreeningResult[] = [
  // Full Stack Engineer matching Job-1
  {
    candidateId: 'cand-1',
    jobId: 'job-1',
    overallScore: 94,
    skillsMatchScore: 96,
    experienceScore: 92,
    educationScore: 90,
    matchedSkills: ['React', 'TypeScript', 'Go', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'CI/CD'],
    missingSkills: ['Kubernetes'],
    strengths: [
      'Strong dual competency in React frontends and highly concurrent Go microservices.',
      'Significant production experience optimizing backend microservice architectures (45% latency reduction).',
      'Solid DevOps knowledge deploying using Docker, ECS, and maintaining CI/CD systems.'
    ],
    weaknesses: [
      'Lacks direct experience with Kubernetes, which is a preferred skill for this role.'
    ],
    recommendation: 'Highly Recommended. This candidate meets or exceeds almost every requirement for the role and possesses strong technical initiative, mentoring background, and production experience with our specific stack.',
    suggestedQuestions: [
      'Can you explain the concurrency patterns you used in Go when designing microservices at TechFrontiers?',
      'Since you used ECS, how would you approach migrating your Docker containers to Kubernetes if we scale out?',
      'How do you manage state sharing and bundle optimization between independent components in a React portal?'
    ],
    status: 'Qualified'
  },
  {
    candidateId: 'cand-4',
    jobId: 'job-1',
    overallScore: 62,
    skillsMatchScore: 60,
    experienceScore: 65,
    educationScore: 60,
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'Express', 'Git'],
    missingSkills: ['Go', 'PostgreSQL', 'Docker', 'RESTful APIs'],
    strengths: [
      'Decent proficiency in React web development and modern client-side states.',
      'Strong communication background from their English literature degree and tech writing experience.',
      'Understands web standards and matches accessibility guidelines well.'
    ],
    weaknesses: [
      'Completely lacks Go (Golang) experience, which is mandatory for this full-stack role.',
      'No experience with relational databases (PostgreSQL) or containerization tools (Docker).'
    ],
    recommendation: 'Needs Interview. Not an immediate fit for the Senior role due to missing backend experience in Go, but shows high potential as a Frontend developer. Consider for a Frontend-focused track.',
    suggestedQuestions: [
      'How have you approached learning-by-doing when working with Node.js and Express APIs?',
      'Do you have any familiarity with relational data models (like PostgreSQL) versus documentary structures (MongoDB)?',
      'What accessibility tests or tools do you normally run to ensure compliance?'
    ],
    status: 'Needs Interview'
  },
  // AI Engineer matching Job-2
  {
    candidateId: 'cand-2',
    jobId: 'job-2',
    overallScore: 95,
    skillsMatchScore: 98,
    experienceScore: 93,
    educationScore: 95,
    matchedSkills: ['Python', 'PyTorch', 'Transformers', 'Large Language Models', 'NLP', 'Git', 'Vector Databases', 'FastAPI', 'Docker'],
    missingSkills: [],
    strengths: [
      'Exceptional educational background with an M.S. in AI from CMU.',
      'Hands-on expertise deploying production-ready LoRA fine-tuning and FastAPI-based vector-pipelines.',
      'Strong theoretical training blended with practical containerized deployment (Docker, Pinecone).'
    ],
    weaknesses: [
      'Lacks TypeScript experience, which is preferred for full UI integration/prototyping.'
    ],
    recommendation: 'Highly Recommended. An outstanding fit for the AI team. Rivera bridges academic research with modern LLM fine-tuning and deployment pipelines, which matches our job target perfectly.',
    suggestedQuestions: [
      'What were the biggest challenges you faced when training and serving LoRA adapter sheets with resource constraints?',
      'How did you structure the vector database queries in Milvus/Pinecone to manage high semantic throughput for RAG?',
      'How would you deploy model inference endpoints to keep cold-start latency low?'
    ],
    status: 'Qualified'
  }
];
