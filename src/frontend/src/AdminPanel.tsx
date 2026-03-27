import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Cpu,
  Download,
  FileText,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import type {
  ContactSubmission,
  JobApplication,
  JobPosting,
  ROILead,
} from "./backend.d";

const PRIMARY = "oklch(0.52 0.18 264)";
const PRIMARY_LIGHT = "oklch(0.95 0.04 264)";
const PRIMARY_DARK = "oklch(0.42 0.2 264)";

const TEMPLATE_KEY = "systrans_mail_template";

const DEFAULT_SUBJECT = "SysTrans ROI Audit Report for {{name}}";
const DEFAULT_BODY = `Hi {{name}},

Thank you for using the SysTrans ROI Calculator!

Based on your inputs, here is your potential monthly gain:

📊 Monthly Revenue: ₹{{monthlyRevenue}}
⏱ Staff Hours on Manual Tasks: {{staffHours}} hrs/month
💰 Hourly Wage: ₹{{hourlyWage}}
❌ No-Show/Abandoned Leads: {{lostLeads}}/month
📦 Average Order Value: ₹{{avgOrderValue}}

💡 Total Potential Monthly Gain: ₹{{totalMonthlyGain}}

We'd love to show you how SysTrans can help recover this value.

Contact us at systranssupport@gmail.com or +91 8525050112.

Best regards,
SysTrans Team`;

function loadTemplate(): { subject: string; body: string } {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { subject: DEFAULT_SUBJECT, body: DEFAULT_BODY };
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}

function formatINR(value: number): string {
  return value.toLocaleString("en-IN");
}

function applyTemplate(
  template: { subject: string; body: string },
  lead: ROILead,
): { subject: string; body: string } {
  const replacements: Record<string, string> = {
    "{{name}}": lead.name,
    "{{email}}": lead.email,
    "{{phone}}": lead.phone,
    "{{monthlyRevenue}}": formatINR(lead.monthlyRevenue),
    "{{staffHours}}": String(lead.staffHours),
    "{{hourlyWage}}": formatINR(lead.hourlyWage),
    "{{lostLeads}}": String(lead.lostLeads),
    "{{avgOrderValue}}": formatINR(lead.avgOrderValue),
    "{{totalMonthlyGain}}": formatINR(lead.totalMonthlyGain),
  };
  let subject = template.subject;
  let body = template.body;
  for (const [placeholder, value] of Object.entries(replacements)) {
    subject = subject.split(placeholder).join(value);
    body = body.split(placeholder).join(value);
  }
  return { subject, body };
}

export default function AdminPanel() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const {
    actor,
    isFetching,
    isError: actorIsError,
    retry: retryActor,
  } = useActor();
  const queryClient = useQueryClient();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const [claimError, setClaimError] = useState<string | null>(null);

  // isConnecting: logged in, still fetching actor, no error yet
  const isConnecting = isLoggedIn && isFetching && !actorIsError;
  // actorReady: logged in, actor loaded, no error
  const actorReady = isLoggedIn && !!actor && !isFetching && !actorIsError;

  // Mail template state
  const [templateSubject, setTemplateSubject] = useState(
    () => loadTemplate().subject,
  );
  const [templateBody, setTemplateBody] = useState(() => loadTemplate().body);
  const [savedMsg, setSavedMsg] = useState(false);

  const saveTemplate = () => {
    localStorage.setItem(
      TEMPLATE_KEY,
      JSON.stringify({ subject: templateSubject, body: templateBody }),
    );
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const sendMail = (lead: ROILead) => {
    const template = loadTemplate();
    const { subject, body } = applyTemplate(template, lead);
    window.open(
      `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  const { data: isAdmin, isLoading: adminCheckLoading } = useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: actorReady,
  });

  const { mutate: claimAdmin, isPending: claimingAdmin } = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.becomeFirstAdmin();
    },
    onSuccess: () => {
      setClaimError(null);
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["roiLeads"] });
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("admin")
      ) {
        setClaimError(
          "An admin has already been claimed. If this is your account, please log out and log in again.",
        );
      } else {
        setClaimError(msg || "Failed to claim admin access. Please try again.");
      }
    },
  });

  const {
    data: contacts,
    isLoading: contactsLoading,
    error: contactsError,
  } = useQuery<ContactSubmission[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContacts();
    },
    enabled: actorReady && !!isAdmin,
  });

  const {
    data: roiLeads,
    isLoading: roiLoading,
    error: roiError,
  } = useQuery<ROILead[]>({
    queryKey: ["roiLeads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getROILeads();
    },
    enabled: actorReady && !!isAdmin,
  });

  // Job form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const { data: allJobPostings, isLoading: jobPostingsLoading } = useQuery<
    JobPosting[]
  >({
    queryKey: ["allJobPostings"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllJobPostings();
    },
    enabled: actorReady && !!isAdmin,
  });

  const { data: jobApplications, isLoading: jobApplicationsLoading } = useQuery<
    JobApplication[]
  >({
    queryKey: ["jobApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getJobApplications();
    },
    enabled: actorReady && !!isAdmin,
  });

  const { mutate: createJob, isPending: creatingJob } = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await (actor as any).createJobPosting(
        jobTitle,
        jobDesc,
        jobLocation,
        jobType,
        jobSalary,
        jobDept,
      );
    },
    onSuccess: () => {
      setJobTitle("");
      setJobDept("");
      setJobLocation("");
      setJobType("");
      setJobSalary("");
      setJobDesc("");
      queryClient.invalidateQueries({ queryKey: ["allJobPostings"] });
      queryClient.invalidateQueries({ queryKey: ["jobPostings"] });
    },
  });

  const { mutate: deleteJob, isPending: deletingJob } = useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await (actor as any).deleteJobPosting(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allJobPostings"] });
      queryClient.invalidateQueries({ queryKey: ["jobPostings"] });
    },
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-xs px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: PRIMARY }}
              >
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ color: PRIMARY }}>
                SysTrans
              </span>
            </a>
            <span className="text-muted-foreground text-sm hidden sm:inline">
              / Admin Panel
            </span>
          </div>
          {isLoggedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="gap-2"
              data-ocid="admin.secondary_button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: PRIMARY_LIGHT }}
            >
              <ShieldCheck className="w-8 h-8" style={{ color: PRIMARY }} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Access Required
            </h1>
            <p className="text-muted-foreground text-center max-w-sm">
              Please log in with Internet Identity to view contact form
              submissions.
            </p>
            <Button
              onClick={login}
              disabled={isInitializing || isLoggingIn}
              className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 h-11 gap-2"
              data-ocid="admin.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Login with Internet
                  Identity
                </>
              )}
            </Button>
          </div>
        ) : actorIsError ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-5 text-center max-w-sm">
              <p className="text-red-600 font-semibold text-sm">
                Failed to connect to backend.
              </p>
              <p className="text-red-400 text-xs mt-1">
                Please check your connection and try again.
              </p>
            </div>
            <Button
              onClick={() => retryActor()}
              className="gap-2 text-white font-semibold"
              style={{ background: PRIMARY }}
              data-ocid="admin.primary_button"
            >
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        ) : isConnecting || (actorReady && adminCheckLoading) ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: PRIMARY }}
            />
            <p className="text-muted-foreground">
              {isConnecting ? "Connecting to backend..." : "Checking access..."}
            </p>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: PRIMARY_LIGHT }}
            >
              <ShieldCheck className="w-8 h-8" style={{ color: PRIMARY }} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Claim Admin Access
            </h1>
            <p className="text-muted-foreground text-center max-w-sm">
              No admin has been assigned yet. Click below to become the admin
              and access submissions.
            </p>
            <Button
              onClick={() => {
                setClaimError(null);
                claimAdmin();
              }}
              disabled={claimingAdmin || !actor}
              className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 h-11 gap-2"
              data-ocid="admin.primary_button"
            >
              {claimingAdmin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Setting up
                  admin...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Become Admin
                </>
              )}
            </Button>
            {claimError && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-center max-w-sm"
                data-ocid="admin.error_state"
              >
                <p className="text-red-600 text-sm">{claimError}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="contacts" className="space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Admin Panel
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage contact submissions and ROI audit leads.
                </p>
              </div>
              <TabsList className="bg-gray-100 flex-wrap h-auto gap-1">
                <TabsTrigger
                  value="contacts"
                  className="gap-2"
                  data-ocid="admin.tab"
                >
                  <Mail className="w-4 h-4" />
                  Contact Submissions
                  {contacts && contacts.length > 0 && (
                    <Badge
                      className="ml-1 text-white text-xs font-semibold h-5 px-1.5"
                      style={{ background: PRIMARY }}
                    >
                      {contacts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="roi-leads"
                  className="gap-2"
                  data-ocid="admin.tab"
                >
                  <TrendingUp className="w-4 h-4" />
                  ROI Leads
                  {roiLeads && roiLeads.length > 0 && (
                    <Badge
                      className="ml-1 text-white text-xs font-semibold h-5 px-1.5"
                      style={{ background: PRIMARY }}
                    >
                      {roiLeads.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="mail-templates"
                  className="gap-2"
                  data-ocid="admin.tab"
                >
                  <FileText className="w-4 h-4" />
                  Mail Templates
                </TabsTrigger>
                <TabsTrigger
                  value="job-postings"
                  className="gap-2"
                  data-ocid="admin.tab"
                >
                  <Briefcase className="w-4 h-4" />
                  Job Postings
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="gap-2"
                  data-ocid="admin.tab"
                >
                  <Users className="w-4 h-4" />
                  Applications
                </TabsTrigger>
              </TabsList>
            </div>

            {/* CONTACT SUBMISSIONS TAB */}
            <TabsContent value="contacts" className="space-y-4">
              {contactsLoading ? (
                <div
                  className="flex items-center justify-center py-24 gap-3 text-muted-foreground"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading submissions...</span>
                </div>
              ) : contactsError ? (
                <div
                  className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
                  data-ocid="admin.error_state"
                >
                  <p className="text-red-600 font-semibold">
                    Failed to load submissions.
                  </p>
                  <p className="text-red-400 text-sm mt-1">
                    You may not have admin access.
                  </p>
                </div>
              ) : !contacts || contacts.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-24 gap-4 text-center"
                  data-ocid="admin.empty_state"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: PRIMARY_LIGHT }}
                  >
                    <Inbox className="w-7 h-7" style={{ color: PRIMARY }} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    No submissions yet
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    When someone fills out the contact form, their message will
                    appear here.
                  </p>
                </div>
              ) : (
                <div
                  className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm"
                  data-ocid="admin.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold text-foreground w-10">
                          #
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Name
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Email
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Message
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Date &amp; Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((c, i) => (
                        <TableRow
                          key={String(c.id)}
                          data-ocid={`admin.item.${i + 1}`}
                        >
                          <TableCell className="text-muted-foreground text-xs">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {c.name}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`mailto:${c.email}`}
                              className="flex items-center gap-1.5 text-sm hover:underline"
                              style={{ color: PRIMARY }}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {c.email}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs">
                            <p className="line-clamp-2">{c.message}</p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(c.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ROI LEADS TAB */}
            <TabsContent value="roi-leads" className="space-y-4">
              {roiLoading ? (
                <div
                  className="flex items-center justify-center py-24 gap-3 text-muted-foreground"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading ROI leads...</span>
                </div>
              ) : roiError ? (
                <div
                  className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
                  data-ocid="admin.error_state"
                >
                  <p className="text-red-600 font-semibold">
                    Failed to load ROI leads.
                  </p>
                  <p className="text-red-400 text-sm mt-1">
                    You may not have admin access.
                  </p>
                </div>
              ) : !roiLeads || roiLeads.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-24 gap-4 text-center"
                  data-ocid="admin.empty_state"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: PRIMARY_LIGHT }}
                  >
                    <TrendingUp
                      className="w-7 h-7"
                      style={{ color: PRIMARY }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    No ROI leads yet
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    When someone requests an audit report from the ROI
                    calculator, their details will appear here.
                  </p>
                </div>
              ) : (
                <div
                  className="bg-white rounded-2xl border border-border overflow-x-auto shadow-sm"
                  data-ocid="admin.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold text-foreground w-10">
                          #
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Name
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Email
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Phone
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Monthly Revenue
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Staff Hours
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Hourly Wage
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Lost Leads
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Avg Order Value
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Total Monthly Gain
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Date &amp; Time
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roiLeads.map((lead, i) => (
                        <TableRow
                          key={String(lead.id)}
                          data-ocid={`admin.item.${i + 1}`}
                        >
                          <TableCell className="text-muted-foreground text-xs">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {lead.name}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center gap-1.5 text-sm hover:underline"
                              style={{ color: PRIMARY }}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {lead.email}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {lead.phone}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            ₹{formatINR(lead.monthlyRevenue)}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {lead.staffHours} hrs
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            ₹{formatINR(lead.hourlyWage)}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {lead.lostLeads}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            ₹{formatINR(lead.avgOrderValue)}
                          </TableCell>
                          <TableCell>
                            <span
                              className="font-bold text-sm"
                              style={{ color: PRIMARY_DARK }}
                            >
                              ₹{formatINR(lead.totalMonthlyGain)}/mo
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(lead.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs h-8 whitespace-nowrap"
                              style={{ borderColor: PRIMARY, color: PRIMARY }}
                              onClick={() => sendMail(lead)}
                              data-ocid={`admin.secondary_button.${i + 1}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Send Mail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* MAIL TEMPLATES TAB */}
            <TabsContent value="mail-templates" className="space-y-6">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Configure Mail Template
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Set the email subject and body used when clicking "Send
                    Mail" on any ROI lead row.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mail-subject" className="font-semibold">
                    Email Subject
                  </Label>
                  <Input
                    id="mail-subject"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Email subject..."
                    data-ocid="admin.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mail-body" className="font-semibold">
                    Email Body
                  </Label>
                  <Textarea
                    id="mail-body"
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    placeholder="Email body..."
                    rows={10}
                    className="font-mono text-sm resize-y"
                    data-ocid="admin.textarea"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    onClick={saveTemplate}
                    className="text-white font-semibold gap-2"
                    style={{ background: PRIMARY }}
                    data-ocid="admin.save_button"
                  >
                    <FileText className="w-4 h-4" />
                    Save Template
                  </Button>
                  {savedMsg && (
                    <span className="text-green-600 font-semibold text-sm">
                      ✓ Saved!
                    </span>
                  )}
                </div>
              </div>

              {/* Placeholders reference */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-3">
                <h3 className="font-bold text-foreground">
                  Available Placeholders
                </h3>
                <p className="text-muted-foreground text-sm">
                  Use these in your subject or body — they will be replaced with
                  the lead's actual data when sending.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "{{name}}",
                    "{{email}}",
                    "{{phone}}",
                    "{{monthlyRevenue}}",
                    "{{staffHours}}",
                    "{{hourlyWage}}",
                    "{{lostLeads}}",
                    "{{avgOrderValue}}",
                    "{{totalMonthlyGain}}",
                  ].map((p) => (
                    <code
                      key={p}
                      className="text-xs px-2 py-1 rounded-md font-mono"
                      style={{
                        background: PRIMARY_LIGHT,
                        color: PRIMARY_DARK,
                      }}
                    >
                      {p}
                    </code>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* JOB POSTINGS TAB */}
            <TabsContent value="job-postings" className="space-y-6">
              {/* Add Job Form */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Add New Job Posting
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Create a new position to display on the Careers page.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title" className="font-semibold">
                      Job Title
                    </Label>
                    <Input
                      id="job-title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Full Stack Developer"
                      data-ocid="admin.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-dept" className="font-semibold">
                      Department
                    </Label>
                    <Input
                      id="job-dept"
                      value={jobDept}
                      onChange={(e) => setJobDept(e.target.value)}
                      placeholder="e.g. Engineering"
                      data-ocid="admin.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-location" className="font-semibold">
                      Location
                    </Label>
                    <Input
                      id="job-location"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      placeholder="e.g. Puducherry / Remote"
                      data-ocid="admin.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Job Type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger data-ocid="admin.select">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="job-salary" className="font-semibold">
                      Salary Range
                    </Label>
                    <Input
                      id="job-salary"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      placeholder="e.g. 5–10 LPA"
                      data-ocid="admin.input"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="job-desc" className="font-semibold">
                      Description
                    </Label>
                    <Textarea
                      id="job-desc"
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      rows={5}
                      data-ocid="admin.textarea"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => createJob()}
                  disabled={
                    creatingJob ||
                    !jobTitle ||
                    !jobDept ||
                    !jobLocation ||
                    !jobType ||
                    !jobSalary ||
                    !jobDesc
                  }
                  className="text-white font-semibold gap-2"
                  style={{ background: PRIMARY }}
                  data-ocid="admin.submit_button"
                >
                  {creatingJob ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4" /> Add Job Posting
                    </>
                  )}
                </Button>
              </div>

              {/* Job list */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground">
                  Active Postings
                </h2>
                {jobPostingsLoading ? (
                  <div
                    className="flex items-center justify-center py-10"
                    data-ocid="admin.loading_state"
                  >
                    <Loader2
                      className="w-6 h-6 animate-spin"
                      style={{ color: PRIMARY }}
                    />
                  </div>
                ) : !allJobPostings || allJobPostings.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.empty_state"
                  >
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      No job postings yet. Add one above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allJobPostings.map((job, i) => (
                      <div
                        key={String(job.id)}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border"
                        data-ocid={`admin.item.${i + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground truncate">
                              {job.title}
                            </p>
                            <Badge
                              className="text-white text-xs"
                              style={{ background: PRIMARY }}
                            >
                              {job.department}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {job.jobType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {job.location} · {job.salaryRange}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteJob(BigInt(job.id))}
                          disabled={deletingJob}
                          className="gap-1.5 shrink-0"
                          data-ocid={`admin.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* APPLICATIONS TAB */}
            <TabsContent value="applications" className="space-y-4">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Job Applications
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    All submitted applications from the Careers page.
                  </p>
                </div>
                {jobApplicationsLoading ? (
                  <div
                    className="flex items-center justify-center py-10"
                    data-ocid="admin.loading_state"
                  >
                    <Loader2
                      className="w-6 h-6 animate-spin"
                      style={{ color: PRIMARY }}
                    />
                  </div>
                ) : !jobApplications || jobApplications.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.empty_state"
                  >
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No applications yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table data-ocid="admin.table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Applicant Name</TableHead>
                          <TableHead>Applied For</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Current CTC</TableHead>
                          <TableHead>Expected CTC</TableHead>
                          <TableHead>Resume</TableHead>
                          <TableHead>Date Applied</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobApplications.map((app, i) => (
                          <TableRow
                            key={String(app.id)}
                            data-ocid={`admin.row.${i + 1}`}
                          >
                            <TableCell className="text-muted-foreground text-sm">
                              {i + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {app.applicantName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {app.jobTitle}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {app.yearsExperience} yrs
                            </TableCell>
                            <TableCell className="text-sm">
                              {app.currentCTC}
                            </TableCell>
                            <TableCell className="text-sm">
                              {app.expectedCTC}
                            </TableCell>
                            <TableCell>
                              {app.resumeBlobId ? (
                                <span
                                  className="flex items-center gap-1 text-sm"
                                  style={{ color: PRIMARY }}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  {app.resumeFileName || "Resume"}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  {app.resumeFileName || "—"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(
                                Number(app.appliedAt / BigInt(1_000_000)),
                              ).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="bg-white border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        &copy; {currentYear} SysTrans. All rights reserved.
      </footer>
    </div>
  );
}
