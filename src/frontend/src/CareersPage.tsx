import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { loadConfig } from "@/config";
import { useActor } from "@/hooks/useActor";
import { StorageClient } from "@/utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Clock,
  Cpu,
  DollarSign,
  Loader2,
  MapPin,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import logoImg from "/assets/uploads/img_20260326_205828_212-019d2acb-457d-713a-90a5-4104922a99ca-1.jpg";
import type { JobPosting } from "./backend.d";

const PRIMARY = "oklch(0.52 0.18 264)";

function SysTransLogo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logoImg}
        alt="SysTrans"
        className="w-9 h-9 rounded-xl object-cover shadow-sm"
      />
      <span className="font-bold text-xl tracking-tight text-foreground">
        SysTrans
      </span>
    </div>
  );
}

type View = "list" | "detail" | "apply";

export default function CareersPage() {
  const { actor } = useActor();
  const [view, setView] = useState<View>("list");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Apply form state
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [currentCTC, setCurrentCTC] = useState("");
  const [expectedCTC, setExpectedCTC] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: jobPostings, isLoading } = useQuery<JobPosting[]>({
    queryKey: ["jobPostings"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getJobPostings();
    },
    enabled: !!actor,
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !selectedJob || !resumeFile) return;
    setSubmitting(true);
    try {
      // Upload resume to blob storage
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await resumeFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);

      await (actor as any).submitJobApplication(
        BigInt(selectedJob.id),
        name,
        Number.parseFloat(experience),
        currentCTC,
        expectedCTC,
        hash,
        resumeFile.name,
      );

      toast.success("Application submitted! We'll be in touch soon.");
      // Reset form
      setName("");
      setExperience("");
      setCurrentCTC("");
      setExpectedCTC("");
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setView("list"), 2000);
    } catch (err) {
      toast.error("Failed to submit application. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // year used inline in footer

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <SysTransLogo />
          </a>
          <a
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            data-ocid="careers.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* LIST VIEW */}
        {view === "list" && (
          <div data-ocid="careers.list">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Open Positions at SysTrans
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Join our team and help businesses transform with cutting-edge IT
                solutions.
              </p>
            </div>

            {isLoading ? (
              <div
                className="flex items-center justify-center py-24"
                data-ocid="careers.loading_state"
              >
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: PRIMARY }}
                />
              </div>
            ) : !jobPostings || jobPostings.length === 0 ? (
              <div
                className="text-center py-24 text-muted-foreground"
                data-ocid="careers.empty_state"
              >
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">
                  No open positions right now.
                </p>
                <p className="text-sm mt-1">Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobPostings.map((job, i) => (
                  <button
                    key={String(job.id)}
                    type="button"
                    className="text-left bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 cursor-pointer"
                    onClick={() => {
                      setSelectedJob(job);
                      setView("detail");
                    }}
                    data-ocid={`careers.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h2 className="text-lg font-bold text-foreground">
                        {job.title}
                      </h2>
                      <Badge
                        className="text-white text-xs font-semibold shrink-0"
                        style={{ background: PRIMARY }}
                      >
                        {job.department}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {job.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salaryRange}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                    <div
                      className="mt-4 text-sm font-semibold"
                      style={{ color: PRIMARY }}
                    >
                      View Details →
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && selectedJob && (
          <div data-ocid="careers.panel">
            <button
              type="button"
              onClick={() => setView("list")}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
              data-ocid="careers.secondary_button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Positions
            </button>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge
                  className="text-white font-semibold"
                  style={{ background: PRIMARY }}
                >
                  {selectedJob.department}
                </Badge>
                <Badge variant="outline">{selectedJob.jobType}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mt-2 mb-4">
                {selectedJob.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  {selectedJob.salaryRange}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {selectedJob.department}
                </span>
              </div>

              <div className="border-t border-border pt-6 mb-8">
                <h2 className="text-lg font-bold mb-3">Job Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              <Button
                onClick={() => setView("apply")}
                className="text-white font-semibold px-8 h-11"
                style={{ background: PRIMARY }}
                data-ocid="careers.primary_button"
              >
                Apply Now
              </Button>
            </div>
          </div>
        )}

        {/* APPLY VIEW */}
        {view === "apply" && selectedJob && (
          <div data-ocid="careers.modal">
            <button
              type="button"
              onClick={() => setView("detail")}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
              data-ocid="careers.secondary_button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Job Details
            </button>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 max-w-xl">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Apply for
              </h1>
              <p
                className="text-lg font-semibold mb-6"
                style={{ color: PRIMARY }}
              >
                {selectedJob.title}
              </p>

              <form onSubmit={handleApply} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="app-name" className="font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="app-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    data-ocid="careers.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-experience" className="font-semibold">
                    Years of Experience
                  </Label>
                  <Input
                    id="app-experience"
                    type="number"
                    min="0"
                    step="0.5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 3"
                    required
                    data-ocid="careers.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-current-ctc" className="font-semibold">
                    Current CTC
                  </Label>
                  <Input
                    id="app-current-ctc"
                    value={currentCTC}
                    onChange={(e) => setCurrentCTC(e.target.value)}
                    placeholder="e.g. 5 LPA"
                    required
                    data-ocid="careers.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-expected-ctc" className="font-semibold">
                    Expected CTC
                  </Label>
                  <Input
                    id="app-expected-ctc"
                    value={expectedCTC}
                    onChange={(e) => setExpectedCTC(e.target.value)}
                    placeholder="e.g. 8 LPA"
                    required
                    data-ocid="careers.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Resume</Label>
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    style={resumeFile ? { borderColor: PRIMARY } : {}}
                    data-ocid="careers.dropzone"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      required
                      onChange={(e) =>
                        setResumeFile(e.target.files?.[0] ?? null)
                      }
                      data-ocid="careers.upload_button"
                    />
                    {resumeFile ? (
                      <p
                        className="text-sm font-medium"
                        style={{ color: PRIMARY }}
                      >
                        ✓ {resumeFile.name}
                      </p>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload resume
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, DOCX supported
                        </p>
                      </>
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !resumeFile}
                  className="w-full text-white font-semibold h-11"
                  style={{ background: PRIMARY }}
                  data-ocid="careers.submit_button"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        <span>
          &copy; {new Date().getFullYear()} SysTrans. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
