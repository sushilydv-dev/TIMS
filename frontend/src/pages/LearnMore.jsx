import React, { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Code, Layers, Database, Cpu, BarChart2, ShieldCheck, CheckCircle, Users, Zap, Target } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/elevate/Footer";

const TRACK_DATA = {
  "full-stack-web-development": {
    title: "Full-Stack Web Development",
    icon: Code,
    accent: "#fc362d",
    description: "Master both ends of modern web architecture. Build ultra-responsive frontends with highly secure, cloud-hosted backend systems deployed to production.",
    images: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop"
    ],
    whatYouLearn: [
      "React.js & Next.js for modern frontend development",
      "Node.js & Express for scalable backend APIs",
      "PostgreSQL & MongoDB for database management",
      "RESTful APIs & GraphQL for data communication",
      "Authentication & authorization with JWT",
      "Cloud deployment with AWS & Docker",
      "Git version control & CI/CD pipelines",
      "TypeScript for type-safe development"
    ],
    outcomes: [
      "Build production-ready web applications",
      "Design scalable database schemas",
      "Implement secure authentication systems",
      "Deploy applications to cloud infrastructure",
      "Work with modern development workflows"
    ],
    training: "Industry-level training with hands-on projects, code reviews, and real-world scenarios. Learn from senior engineers who have built systems at scale."
  },
  "ui-ux-architecture": {
    title: "UI/UX Architecture & Interaction",
    icon: Layers,
    accent: "#fc362d",
    description: "Learn to design modern, intuitive digital layouts focused entirely on driving engagement — from wireframes to pixel-perfect production interfaces.",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=400&fit=crop"
    ],
    whatYouLearn: [
      "Figma & Adobe XD for design prototyping",
      "User research & persona development",
      "Wireframing & information architecture",
      "Design systems & component libraries",
      "Accessibility standards (WCAG)",
      "Motion design & micro-interactions",
      "Responsive design principles",
      "Design handoff to development teams"
    ],
    outcomes: [
      "Create intuitive user interfaces",
      "Conduct effective user research",
      "Build scalable design systems",
      "Design for accessibility and inclusion",
      "Collaborate effectively with developers"
    ],
    training: "Learn from UX designers who have shipped products used by millions. Master design thinking processes and industry-standard tools."
  },
  "cloud-infrastructure": {
    title: "Cloud Infrastructure & Database",
    icon: Database,
    accent: "#fc362d",
    description: "Dive deep into relational database design, efficient backend scaling pipelines, stateful caching layers, and cloud deployment strategies.",
    images: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=400&fit=crop"
    ],
    whatYouLearn: [
      "AWS, GCP, and Azure cloud platforms",
      "PostgreSQL & MySQL optimization",
      "Redis & Memcached for caching",
      "Kubernetes & Docker containerization",
      "Infrastructure as Code (Terraform)",
      "Monitoring & observability (Prometheus)",
      "Database sharding & replication",
      "Serverless architecture patterns"
    ],
    outcomes: [
      "Design scalable cloud architectures",
      "Optimize database performance",
      "Implement caching strategies",
      "Build resilient distributed systems",
      "Automate infrastructure deployment"
    ],
    training: "Train with cloud architects who have managed infrastructure at scale. Learn best practices for security, reliability, and cost optimization."
  },
  "ai-machine-learning": {
    title: "AI & Machine Learning Fundamentals",
    icon: Cpu,
    accent: "#fc362d",
    description: "Understand model building, data pipelines, and practical ML workflows. Build projects that integrate intelligent features into real-world applications.",
    images: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop"
    ],
    whatYouLearn: [
      "Python for ML & data science",
      "TensorFlow & PyTorch frameworks",
      "Data preprocessing & feature engineering",
      "Supervised & unsupervised learning",
      "Neural networks & deep learning",
      "Natural language processing basics",
      "Computer vision fundamentals",
      "Model deployment & MLOps"
    ],
    outcomes: [
      "Build and train ML models",
      "Process and analyze large datasets",
      "Implement neural network architectures",
      "Deploy ML models to production",
      "Integrate AI features into applications"
    ],
    training: "Learn from ML engineers who have deployed models in production. Work on real datasets and build portfolio-worthy projects."
  },
  "business-hr-management": {
    title: "Business & HR Management",
    icon: BarChart2,
    accent: "#fc362d",
    description: "Structured programs in operations, talent acquisition, and business administration for aspiring management professionals entering corporates.",
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=400&fit=crop"
    ],
    whatYouLearn: [
      "Strategic HR planning & workforce analytics",
      "Talent acquisition & recruitment strategies",
      "Performance management systems",
      "Employee relations & conflict resolution",
      "Compensation & benefits administration",
      "Organizational development",
      "Business process optimization",
      "Leadership & team management"
    ],
    outcomes: [
      "Design effective HR strategies",
      "Lead talent acquisition initiatives",
      "Manage organizational change",
      "Develop high-performing teams",
      "Align HR with business objectives"
    ],
    training: "Learn from HR leaders with experience in Fortune 500 companies. Master modern HR practices and business management principles."
  },
  "cybersecurity-devsecops": {
    title: "Cybersecurity & DevSecOps",
    icon: ShieldCheck,
    accent: "#fc362d",
    description: "Learn security-first development, ethical hacking fundamentals, CI/CD hardening, and compliance practices for modern software teams.",
    images: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1563206767-5b1d97298972?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop"
    ],
    whatYouLearn: [
      "Network security & penetration testing",
      "OWASP security standards",
      "Secure coding practices",
      "DevSecOps pipeline security",
      "Cloud security (AWS, Azure, GCP)",
      "Incident response & forensics",
      "Compliance frameworks (SOC2, GDPR)",
      "Security automation with tools"
    ],
    outcomes: [
      "Identify and mitigate security vulnerabilities",
      "Implement secure development practices",
      "Build secure CI/CD pipelines",
      "Conduct security assessments",
      "Respond to security incidents"
    ],
    training: "Train with security professionals who have protected enterprise systems. Learn offensive and defensive security techniques."
  }
};

const ParallaxImage = ({ src, alt, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ scale: 1.1, rotate: 2 }}
    className={`rounded-xl overflow-hidden shadow-lg ${className}`}
  >
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </motion.div>
);

export const LearnMore = () => {
  const { trackId } = useParams();
  const track = TRACK_DATA[trackId];
  const Icon = track?.icon;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [trackId]);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Track not found</h1>
          <Link to="/" className="text-blue-500 hover:underline">Return to homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.2,
      }}
    >
      <div className="min-h-screen bg-white">
        <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 lg:px-16 overflow-hidden">
        <motion.div
          style={{ y: heroY, backgroundColor: track.accent }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[200px] pointer-events-none"
        />
        
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
              style={{ backgroundColor: `${track.accent}15`, color: track.accent }}
            >
              <Icon className="w-8 h-8" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
              {track.title}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
              {track.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4" />
                Industry Experts
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                <Zap className="w-4 h-4" />
                Modern Tech Stack
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                <Target className="w-4 h-4" />
                Career Focused
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0c0407] mb-4">
              What You'll Learn
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Master the technologies and skills that employers are looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {track.whatYouLearn.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${track.accent}15` }}>
                  <CheckCircle className="w-5 h-5" style={{ color: track.accent }} />
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Approach Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0c0407] mb-6">
                Industry-Level Training
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {track.training}
              </p>
              <div className="space-y-4">
                {track.outcomes.map((outcome, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${track.accent}15` }}>
                      <CheckCircle className="w-4 h-4" style={{ color: track.accent }} />
                    </div>
                    <p className="text-gray-700">{outcome}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative h-[400px] lg:h-[500px]"
            >
              <ParallaxImage
                src={track.images[0]} alt="Technology"
                className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64"
                delay={0.1}
              />
              <ParallaxImage
                src={track.images[1]} alt="Development"
                className="absolute bottom-0 left-0 w-40 h-40 md:w-56 md:h-56"
                delay={0.2}
              />
              <ParallaxImage
                src={track.images[2]} alt="Innovation"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-52 md:h-52"
                delay={0.3}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0c0407] mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of students who have transformed their careers with our programs
            </p>
            <Link
              to="/all-courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: track.accent }}
            >
              Explore Courses
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </motion.div>
        </div>
      </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default LearnMore;
