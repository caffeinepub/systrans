import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Cpu,
  Database,
  Facebook,
  Globe,
  Layers,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Twitter,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import developerImg from "/assets/uploads/1774532258715-019d2a68-771f-7280-997b-4847283e05f7-1.png";
import teamImg from "/assets/uploads/screenshot_20260326-205515-019d2ac0-43a8-71ed-b141-b11046049400-1.png";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "FAQ", href: "#faq" },
  { label: "ROI Calculator", href: "#roi-calculator" },
  { label: "Contact", href: "#contact" },
  { label: "Careers", href: "/careers" },
];

const SERVICES = [
  {
    icon: Cloud,
    title: "Cloud Solutions",
    description:
      "Seamlessly migrate and manage your infrastructure on AWS, Azure, or GCP. Scale effortlessly as your business grows.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Settings,
    title: "Managed IT Services",
    description:
      "Proactive monitoring, maintenance, and helpdesk support so your team stays productive around the clock.",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description:
      "Advanced threat detection, compliance auditing, and end-to-end encryption to safeguard your digital assets.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Code2,
    title: "Software Development",
    description:
      "Custom web and mobile applications built with modern stacks — delivered on time and within budget.",
    color: "text-cyan-500",
    bg: "bg-cyan-50",
  },
];

const VALUES = [
  "Innovation-first approach to every challenge",
  "Transparent communication and honest pricing",
  "Dedicated support team available 24/7",
  "Proven methodology for on-time delivery",
  "Long-term partnerships, not one-off projects",
];

const PARTNERS = [
  { name: "TechCorp", icon: Database },
  { name: "DataSystems", icon: Database },
  { name: "SecureNet", icon: Lock },
  { name: "CloudBase", icon: Cloud },
  { name: "DevStack", icon: Layers },
  { name: "GlobalIT", icon: Globe },
];

const FEATURES = [
  {
    icon: Users,
    title: "Client-Centric Culture",
    desc: "Every decision we make starts with understanding what matters most to you.",
  },
  {
    icon: Star,
    title: "Award-Winning Team",
    desc: "Our engineers are certified experts recognized across the industry.",
  },
  {
    icon: Award,
    title: "Results Guaranteed",
    desc: "We commit to measurable outcomes — or we keep working until we deliver.",
  },
];

const STATS = [
  { value: "10+", label: "Clients Served" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "5+", label: "Years Experience" },
];

const FAQS = [
  {
    question:
      "I already have a WhatsApp number and a Facebook page. Why do I need a website and an app?",
    answer:
      'Social media is "rented land." If the platform changes its algorithm or closes your account, you lose your customers. A professional website and app are "owned assets." They build much higher trust with premium customers and allow you to collect data (emails/phone numbers) so you can market to your audience directly without paying for ads.',
  },
  {
    question:
      'I am not a "tech person." How will I manage the app and website?',
    answer:
      'We build our solutions with a "User-First" Admin Dashboard. If you can use WhatsApp or Facebook, you can manage your new digital store. We also provide a 2-hour training session for you and your staff, plus a "Quick Start" manual to handle daily updates like changing prices or adding new products.',
  },
  {
    question: "How long does the entire process take?",
    answer:
      "A standard digital transformation (Web + Basic App) typically takes 4 to 6 weeks.\n\nWeek 1-2: Design and Approval.\nWeek 3-4: Development and Testing.\nWeek 5-6: Launch and Staff Training.",
  },
  {
    question: 'Will my business be "down" while you are building this?',
    answer:
      'Not at all. Your current physical operations and any existing social media pages will continue to run as usual. We build the digital system in the background and only "flip the switch" to go live once everything is tested and you are 100% satisfied.',
  },
  {
    question: "What happens after the launch? Do you provide support?",
    answer:
      'Yes. We don\'t just "build and disappear." Every project includes 30 days of free post-launch support. After that, we offer affordable Maintenance Plans that cover security updates, cloud hosting management, and minor content changes to ensure your tech stays fast and secure.',
  },
];

function SysTransLogo({
  size = "md",
  dark = false,
}: { size?: "sm" | "md" | "lg"; dark?: boolean }) {
  const boxSize =
    size === "lg" ? "w-12 h-12" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize =
    size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const textSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${boxSize} rounded-xl flex items-center justify-center flex-shrink-0`}
        style={{ background: "oklch(0.52 0.18 264)" }}
      >
        <Cpu className={`${iconSize} text-white`} />
      </div>
      <span
        className={`font-bold ${textSize} ${dark ? "text-white" : ""}`}
        style={dark ? {} : { color: "oklch(0.22 0.04 264)" }}
      >
        SysTrans
      </span>
    </div>
  );
}

function formatINR(value: number): string {
  return value.toLocaleString("en-IN");
}

export default function App() {
  const { actor, isFetching } = useActor();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ROI Calculator state
  const [roi, setRoi] = useState({
    monthlyRevenue: "",
    staffHours: "",
    lostLeads: "",
    hourlyWage: "",
    avgOrderValue: "",
  });
  const [roiDialogOpen, setRoiDialogOpen] = useState(false);
  const [roiLead, setRoiLead] = useState({ name: "", email: "", phone: "" });
  const [roiSubmitting, setRoiSubmitting] = useState(false);
  const [roiSubmitted, setRoiSubmitted] = useState(false);
  const [roiSubmitError, setRoiSubmitError] = useState<string | null>(null);

  const roiH = Number.parseFloat(roi.staffHours) || 0;
  const roiL = Number.parseFloat(roi.lostLeads) || 0;
  const roiW = Number.parseFloat(roi.hourlyWage) || 0;
  const roiA = Number.parseFloat(roi.avgOrderValue) || 0;
  const roiR = Number.parseFloat(roi.monthlyRevenue) || 0;
  const timeRecovery = roiH * roiW;
  const revenueRecovery = roiL * roiA;
  const totalGain = timeRecovery + revenueRecovery;
  const hasResults = roiH > 0 || roiL > 0;

  async function handleROILeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRoiSubmitError(null);
    setRoiSubmitting(true);
    try {
      if (!actor || isFetching) {
        setRoiSubmitError("Please wait a moment and try again.");
        return;
      }
      await actor.submitROILead(
        roiLead.name,
        roiLead.email,
        roiLead.phone,
        roiR,
        roiH,
        roiL,
        roiW,
        roiA,
        totalGain,
      );
      setRoiSubmitted(true);
    } catch {
      setRoiSubmitError("Failed to submit. Please try again.");
    } finally {
      setRoiSubmitting(false);
    }
  }

  function handleROIDialogClose(open: boolean) {
    if (!open) {
      setRoiDialogOpen(false);
      if (roiSubmitted) {
        setRoiSubmitted(false);
        setRoiLead({ name: "", email: "", phone: "" });
      }
    } else {
      setRoiDialogOpen(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (!actor || isFetching) {
        setSubmitError("Please wait a moment and try again.");
        return;
      }
      await actor.submitContact(
        formData.name,
        formData.email,
        formData.message,
      );
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", message: "" });
      }, 4000);
    } catch {
      setSubmitError("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="#home" className="flex items-center" data-ocid="nav.link">
            <SysTransLogo size="md" />
          </a>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button
              className="bg-primary text-white hover:bg-primary/90 font-semibold px-5"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-ocid="header.primary_button"
            >
              Get Started
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
            <Button
              className="bg-primary text-white hover:bg-primary/90 font-semibold w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              data-ocid="header.primary_button"
            >
              Get Started
            </Button>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="home" className="relative overflow-hidden bg-white">
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, oklch(0.52 0.18 264 / 0.35) 1.5px, transparent 1.5px)",
              backgroundSize: "36px 36px",
            }}
          />
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center relative">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-5">
                <Star className="w-3.5 h-3.5" /> Trusted by 10+ Companies
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-5">
                Smart IT Solutions for{" "}
                <span
                  className="relative"
                  style={{ color: "oklch(0.52 0.18 264)" }}
                >
                  Modern Business
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                At SysTrans, we specialize in &apos;System Transformation.&apos;
                We take your traditional business systems and migrate them into
                high-performance websites and mobile apps. We don&apos;t just
                build software; we transform how you serve your customers.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 font-semibold gap-2"
                  onClick={() =>
                    document
                      .getElementById("services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  data-ocid="hero.primary_button"
                >
                  Explore Services <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border font-semibold"
                  onClick={() =>
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  data-ocid="hero.secondary_button"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div
                className="absolute -right-6 top-6 bottom-0 left-12 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.52 0.18 264), oklch(0.42 0.2 264))",
                }}
              />
              <img
                src={developerImg}
                alt="Developer at monitors"
                className="relative z-10 w-full rounded-2xl shadow-xl object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* ROI CALCULATOR SECTION */}
        <section
          id="roi-calculator"
          className="py-20 px-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.52 0.18 264), oklch(0.42 0.2 264))",
          }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> Live ROI Calculator
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Calculate Your ROI
              </h2>
              <p className="text-white/80 max-w-xl mx-auto">
                See exactly how much SysTrans can save your business every
                month.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Inputs card */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="bg-white rounded-2xl p-8 shadow-xl"
              >
                <h3 className="font-bold text-foreground text-lg mb-6">
                  Enter Your Business Numbers
                </h3>
                <div className="space-y-5">
                  <div>
                    <Label
                      htmlFor="roi-revenue"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Monthly Revenue (₹)
                    </Label>
                    <Input
                      id="roi-revenue"
                      type="number"
                      min="0"
                      placeholder="e.g. 500000"
                      value={roi.monthlyRevenue}
                      onChange={(e) =>
                        setRoi((p) => ({
                          ...p,
                          monthlyRevenue: e.target.value,
                        }))
                      }
                      className="bg-white border-border"
                      data-ocid="roi.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="roi-hours"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Staff Hours on Manual Tasks / Month
                    </Label>
                    <Input
                      id="roi-hours"
                      type="number"
                      min="0"
                      placeholder="e.g. 80"
                      value={roi.staffHours}
                      onChange={(e) =>
                        setRoi((p) => ({ ...p, staffHours: e.target.value }))
                      }
                      className="bg-white border-border"
                      data-ocid="roi.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="roi-leads"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Lost / Abandoned Leads / Month
                    </Label>
                    <Input
                      id="roi-leads"
                      type="number"
                      min="0"
                      placeholder="e.g. 20"
                      value={roi.lostLeads}
                      onChange={(e) =>
                        setRoi((p) => ({ ...p, lostLeads: e.target.value }))
                      }
                      className="bg-white border-border"
                      data-ocid="roi.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="roi-wage"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Avg. Hourly Wage (₹)
                    </Label>
                    <Input
                      id="roi-wage"
                      type="number"
                      min="0"
                      placeholder="e.g. 200"
                      value={roi.hourlyWage}
                      onChange={(e) =>
                        setRoi((p) => ({ ...p, hourlyWage: e.target.value }))
                      }
                      className="bg-white border-border"
                      data-ocid="roi.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="roi-aov"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Average Order Value (₹)
                    </Label>
                    <Input
                      id="roi-aov"
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={roi.avgOrderValue}
                      onChange={(e) =>
                        setRoi((p) => ({ ...p, avgOrderValue: e.target.value }))
                      }
                      className="bg-white border-border"
                      data-ocid="roi.input"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Results card */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="flex flex-col gap-5"
              >
                <div className="bg-white/15 backdrop-blur rounded-2xl p-6 border border-white/20">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-5">
                    Your Monthly Recovery Estimate
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
                          Time Recovery
                        </p>
                        <p className="text-white/60 text-xs mt-0.5">
                          {roiH > 0 && roiW > 0
                            ? `${roiH} hrs × ₹${roiW}/hr`
                            : "H × Hourly Wage"}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-white">
                        ₹{formatINR(timeRecovery)}
                      </span>
                    </div>
                    <div className="border-t border-white/20" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
                          Revenue Recovery
                        </p>
                        <p className="text-white/60 text-xs mt-0.5">
                          {roiL > 0 && roiA > 0
                            ? `${roiL} leads × ₹${roiA} AOV`
                            : "L × Avg. Order Value"}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-white">
                        ₹{formatINR(revenueRecovery)}
                      </span>
                    </div>
                    <div className="border-t border-white/20" />
                    <div
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{ background: "rgba(255,255,255,0.18)" }}
                    >
                      <div>
                        <p className="text-white font-bold text-sm uppercase tracking-wide">
                          Total Monthly Gain
                        </p>
                        <p className="text-white/70 text-xs mt-0.5">
                          Time Recovery + Revenue Recovery
                        </p>
                      </div>
                      <span className="text-3xl font-extrabold text-white">
                        ₹{formatINR(totalGain)}
                      </span>
                    </div>
                  </div>
                </div>

                {hasResults && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-center"
                  >
                    <p className="text-white/80 text-sm">
                      You could be losing{" "}
                      <span className="font-bold text-white">
                        ₹{formatINR(totalGain)}/month
                      </span>{" "}
                      right now. Let SysTrans fix that.
                    </p>
                  </motion.div>
                )}

                <Button
                  size="lg"
                  className="w-full font-bold h-12 text-base gap-2 shadow-lg"
                  style={{
                    background: "white",
                    color: "oklch(0.42 0.2 264)",
                  }}
                  onClick={() => setRoiDialogOpen(true)}
                  data-ocid="roi.open_modal_button"
                >
                  <TrendingUp className="w-5 h-5" />
                  Get My Full Audit Report
                </Button>
                <p className="text-center text-white/60 text-xs">
                  Free. No commitment. We&apos;ll send you a personalised
                  analysis.
                </p>
              </motion.div>
            </div>
          </div>

          {/* ROI Lead Capture Dialog */}
          <Dialog open={roiDialogOpen} onOpenChange={handleROIDialogClose}>
            <DialogContent className="sm:max-w-md" data-ocid="roi.dialog">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Get Your Full Audit Report
                </DialogTitle>
              </DialogHeader>

              {roiSubmitted ? (
                <div
                  className="flex flex-col items-center gap-4 py-8"
                  data-ocid="roi.success_state"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "oklch(0.95 0.04 264)" }}
                  >
                    <CheckCircle2
                      className="w-7 h-7"
                      style={{ color: "oklch(0.52 0.18 264)" }}
                    />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">
                    Request Submitted!
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Thank you! Our team will review your numbers and send a
                    personalised audit report within 24 hours.
                  </p>
                  <Button
                    className="bg-primary text-white hover:bg-primary/90 font-semibold mt-2"
                    onClick={() => handleROIDialogClose(false)}
                    data-ocid="roi.close_button"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleROILeadSubmit} className="space-y-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    Leave your details and we&apos;ll send you a personalised
                    ROI analysis based on your numbers.
                  </p>

                  {totalGain > 0 && (
                    <div
                      className="rounded-xl p-4 text-center"
                      style={{ background: "oklch(0.95 0.04 264)" }}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: "oklch(0.52 0.18 264)" }}
                      >
                        Your Estimated Monthly Gain
                      </p>
                      <p
                        className="text-2xl font-extrabold"
                        style={{ color: "oklch(0.42 0.2 264)" }}
                      >
                        ₹{formatINR(totalGain)}/month
                      </p>
                    </div>
                  )}

                  <div>
                    <Label
                      htmlFor="lead-name"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="lead-name"
                      placeholder="Your name"
                      value={roiLead.name}
                      onChange={(e) =>
                        setRoiLead((p) => ({ ...p, name: e.target.value }))
                      }
                      required
                      data-ocid="roi.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lead-email"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="lead-email"
                      type="email"
                      placeholder="you@company.com"
                      value={roiLead.email}
                      onChange={(e) =>
                        setRoiLead((p) => ({ ...p, email: e.target.value }))
                      }
                      required
                      data-ocid="roi.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lead-phone"
                      className="text-foreground font-semibold text-sm mb-1.5 block"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="lead-phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={roiLead.phone}
                      onChange={(e) =>
                        setRoiLead((p) => ({ ...p, phone: e.target.value }))
                      }
                      required
                      data-ocid="roi.input"
                    />
                  </div>

                  {roiSubmitError && (
                    <p
                      className="text-sm text-red-500"
                      data-ocid="roi.error_state"
                    >
                      {roiSubmitError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleROIDialogClose(false)}
                      data-ocid="roi.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={roiSubmitting || isFetching || !actor}
                      className="flex-1 bg-primary text-white hover:bg-primary/90 font-semibold gap-2"
                      data-ocid="roi.submit_button"
                    >
                      {roiSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Send My Report"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="bg-section-tint py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Services
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Comprehensive technology services designed to keep your
                operations running smoothly and securely.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICES.map((svc, i) => (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-border shadow-card hover:shadow-lg transition-shadow"
                  data-ocid={`services.item.${i + 1}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${svc.bg} flex items-center justify-center mb-4`}
                  >
                    <svc.icon className={`w-6 h-6 ${svc.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {svc.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={teamImg}
                alt="Our team"
                className="w-full rounded-2xl shadow-card object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="text-sm font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: "oklch(0.52 0.18 264)" }}
              >
                Who We Are
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                About Us
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                Founded in 2026, SysTrans is a full-spectrum IT solutions
                provider helping businesses of all sizes harness the power of
                modern technology. Our certified team of engineers, architects,
                and consultants brings deep expertise across cloud, security,
                and software domains.
              </p>
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wide mb-3">
                Core Values
              </h4>
              <ul className="space-y-2">
                {VALUES.map((v) => (
                  <li
                    key={v}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: "oklch(0.52 0.18 264)" }}
                    />
                    {v}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* RECENT PROJECTS / PARTNERS */}
        <section id="portfolio" className="bg-section-tint py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Recent Projects
              </h2>
              <p className="text-muted-foreground">
                Trusted by leading companies across industries.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4 mb-14">
              {PARTNERS.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border border-border shadow-xs"
                  data-ocid={`portfolio.item.${i + 1}`}
                >
                  <p.icon
                    className="w-5 h-5"
                    style={{ color: "oklch(0.52 0.18 264)" }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.95 0.04 264)" }}
                  >
                    <f.icon
                      className="w-5 h-5"
                      style={{ color: "oklch(0.52 0.18 264)" }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-1">
                      {f.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US - STATS */}
        <section
          className="py-20 px-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.52 0.18 264), oklch(0.42 0.2 264))",
          }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Why Choose Us?
              </h2>
              <p className="text-white/80 mb-12 max-w-xl mx-auto">
                Numbers that speak to our commitment to excellence and client
                success.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-3 gap-8">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="text-center"
                  data-ocid={`stats.item.${i + 1}`}
                >
                  <div className="text-5xl font-extrabold text-white mb-2">
                    {s.value}
                  </div>
                  <div className="text-white/80 font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <span
                className="text-sm font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: "oklch(0.52 0.18 264)" }}
              >
                Got Questions?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Honest answers to the questions we hear most from business
                owners like you.
              </p>
            </motion.div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="border border-border rounded-2xl overflow-hidden"
                  data-ocid={`faq.item.${i + 1}`}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-section-tint transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-semibold text-foreground text-sm md:text-base leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className="w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300"
                      style={{
                        transform:
                          openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 border-t border-border bg-section-tint">
                          {faq.answer.split("\n").map((line, j) =>
                            line.trim() === "" ? null : (
                              <p
                                key={`${faq.question}-${j}`}
                                className="text-sm text-muted-foreground leading-relaxed mb-2 last:mb-0"
                              >
                                {line}
                              </p>
                            ),
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-20 px-6 bg-section-tint">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Get in Touch
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Ready to transform your IT infrastructure? Let&apos;s start a
                conversation.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white rounded-2xl p-8 border border-border">
                {submitted ? (
                  <div
                    className="flex flex-col items-center justify-center h-full gap-4 py-12"
                    data-ocid="contact.success_state"
                  >
                    <CheckCircle2
                      className="w-14 h-14"
                      style={{ color: "oklch(0.52 0.18 264)" }}
                    />
                    <h3 className="font-bold text-foreground text-xl">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Thank you for reaching out. We&apos;ll get back to you
                      within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-foreground font-semibold text-sm mb-1.5 block"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, name: e.target.value }))
                        }
                        required
                        className="bg-white border-border"
                        data-ocid="contact.input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-foreground font-semibold text-sm mb-1.5 block"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, email: e.target.value }))
                        }
                        required
                        className="bg-white border-border"
                        data-ocid="contact.input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="message"
                        className="text-foreground font-semibold text-sm mb-1.5 block"
                      >
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project or challenge..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            message: e.target.value,
                          }))
                        }
                        required
                        className="bg-white border-border resize-none"
                        data-ocid="contact.textarea"
                      />
                    </div>
                    {submitError && (
                      <p
                        className="text-sm text-red-500"
                        data-ocid="contact.error_state"
                      >
                        {submitError}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={submitting || isFetching || !actor}
                      className="w-full bg-primary text-white hover:bg-primary/90 font-semibold h-11 gap-2"
                      data-ocid="contact.submit_button"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : isFetching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                )}
              </div>

              <div className="flex flex-col gap-6 justify-center">
                <h3 className="text-xl font-bold text-foreground">
                  Contact Details
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      Icon: MapPin,
                      label: "Address",
                      value: "Puducherry 605009",
                    },
                    { Icon: Phone, label: "Phone", value: "+91 8525050112" },
                    {
                      Icon: Mail,
                      label: "Email",
                      value: "systranssupport@gmail.com",
                    },
                    {
                      Icon: Globe,
                      label: "Website",
                      value: "www.systrans-7ef.caffeine.xyz",
                    },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "oklch(0.95 0.04 264)" }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: "oklch(0.52 0.18 264)" }}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {label}
                        </p>
                        <p className="text-sm text-foreground font-semibold">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  {[
                    { Icon: Linkedin, label: "LinkedIn" },
                    { Icon: Twitter, label: "Twitter" },
                    { Icon: Facebook, label: "Facebook" },
                  ].map(({ Icon, label }) => (
                    <button
                      type="button"
                      key={label}
                      aria-label={label}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-section-tint transition-colors"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-navy text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="mb-4">
                <SysTransLogo size="md" dark />
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Empowering businesses with innovative IT solutions since 2026.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/80 mb-4">
                Menu
              </h4>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                      data-ocid="footer.link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/80 mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "Accessibility",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#contact"
                      className="text-sm text-white/60 hover:text-white transition-colors"
                      data-ocid="footer.link"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/40">
            <span>&copy; {currentYear} SysTrans. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
