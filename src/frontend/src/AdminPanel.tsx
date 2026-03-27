import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Cpu,
  Download,
  Eye,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  RotateCcw,
  Save,
  Send,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useRef, useState } from "react";
import type { ContactSubmission, ROILead } from "./backend.d";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = "oklch(0.52 0.18 264)";
const PRIMARY_LIGHT = "oklch(0.95 0.04 264)";
const PRIMARY_DARK = "oklch(0.42 0.2 264)";

const LS_SUBJECT = "systrans_mail_subject";
const LS_BODY = "systrans_mail_body";

const DEFAULT_SUBJECT = "SysTrans ROI Audit Report for {{name}}";
const DEFAULT_BODY = `Hi {{name}},

Here is your SysTrans ROI Audit Report:

Monthly Revenue: ₹{{monthlyRevenue}}
Staff Hours/month: {{staffHours}} hrs
Hourly Wage: ₹{{hourlyWage}}
Lost Leads/month: {{lostLeads}}
Avg Order Value: ₹{{avgOrderValue}}

💰 Total Potential Monthly Gain: ₹{{totalMonthlyGain}}/mo

Date: {{date}}

Ready to recover this revenue? Contact SysTrans today.

Best regards,
SysTrans Team`;

const PLACEHOLDERS = [
  "{{name}}",
  "{{email}}",
  "{{phone}}",
  "{{monthlyRevenue}}",
  "{{staffHours}}",
  "{{hourlyWage}}",
  "{{lostLeads}}",
  "{{avgOrderValue}}",
  "{{totalMonthlyGain}}",
  "{{date}}",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}

function formatINR(value: number): string {
  return value.toLocaleString("en-IN");
}

function loadTemplate() {
  return {
    subject: localStorage.getItem(LS_SUBJECT) ?? DEFAULT_SUBJECT,
    body: localStorage.getItem(LS_BODY) ?? DEFAULT_BODY,
  };
}

function renderTemplate(template: string, lead: ROILead): string {
  return template
    .replace(/{{name}}/g, lead.name)
    .replace(/{{email}}/g, lead.email)
    .replace(/{{phone}}/g, lead.phone)
    .replace(/{{monthlyRevenue}}/g, formatINR(lead.monthlyRevenue))
    .replace(/{{staffHours}}/g, String(lead.staffHours))
    .replace(/{{hourlyWage}}/g, formatINR(lead.hourlyWage))
    .replace(/{{lostLeads}}/g, String(lead.lostLeads))
    .replace(/{{avgOrderValue}}/g, formatINR(lead.avgOrderValue))
    .replace(/{{totalMonthlyGain}}/g, formatINR(lead.totalMonthlyGain))
    .replace(/{{date}}/g, formatTimestamp(lead.timestamp));
}

function downloadCSV(leads: ROILead[], filename = "roi-leads.csv") {
  const headers = [
    "#",
    "Name",
    "Email",
    "Phone",
    "Monthly Revenue (₹)",
    "Staff Hours (hrs)",
    "Hourly Wage (₹)",
    "Lost Leads",
    "Avg Order Value (₹)",
    "Total Monthly Gain (₹/mo)",
    "Date & Time",
  ];
  const rows = leads.map((lead, i) => [
    i + 1,
    lead.name,
    lead.email,
    lead.phone,
    lead.monthlyRevenue,
    lead.staffHours,
    lead.hourlyWage,
    lead.lostLeads,
    lead.avgOrderValue,
    lead.totalMonthlyGain,
    formatTimestamp(lead.timestamp),
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildBulkMailtoBody(leads: ROILead[]): string {
  const lines = [
    "SysTrans ROI Leads Report",
    "=========================\n",
    ...leads.map(
      (lead, i) =>
        `Lead #${i + 1}\n` +
        `Name: ${lead.name}\n` +
        `Email: ${lead.email}\n` +
        `Phone: ${lead.phone}\n` +
        `Monthly Revenue: ₹${formatINR(lead.monthlyRevenue)}\n` +
        `Staff Hours: ${lead.staffHours} hrs\n` +
        `Hourly Wage: ₹${formatINR(lead.hourlyWage)}\n` +
        `Lost Leads: ${lead.lostLeads}\n` +
        `Avg Order Value: ₹${formatINR(lead.avgOrderValue)}\n` +
        `Total Monthly Gain: ₹${formatINR(lead.totalMonthlyGain)}/mo\n` +
        `Date: ${formatTimestamp(lead.timestamp)}\n`,
    ),
  ];
  return lines.join("\n");
}

function sendLeadMail(lead: ROILead) {
  const { subject, body } = loadTemplate();
  const renderedSubject = renderTemplate(subject, lead);
  const renderedBody = renderTemplate(body, lead);
  const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(renderedSubject)}&body=${encodeURIComponent(renderedBody)}`;
  window.location.href = mailto;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlaceholderChips({
  onInsert,
}: {
  onInsert: (ph: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {PLACEHOLDERS.map((ph) => (
        <button
          key={ph}
          type="button"
          onClick={() => onInsert(ph)}
          className="px-2 py-0.5 rounded text-xs font-mono border border-border bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
          style={{ color: PRIMARY }}
        >
          {ph}
        </button>
      ))}
    </div>
  );
}

function MailTemplatesTab() {
  const init = loadTemplate();
  const [subject, setSubject] = useState(init.subject);
  const [body, setBody] = useState(init.body);
  const [saved, setSaved] = useState(false);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastFocused = useRef<"subject" | "body">("body");

  function insertPlaceholder(ph: string) {
    if (lastFocused.current === "subject" && subjectRef.current) {
      const el = subjectRef.current;
      const start = el.selectionStart ?? subject.length;
      const end = el.selectionEnd ?? subject.length;
      const next = subject.slice(0, start) + ph + subject.slice(end);
      setSubject(next);
      setTimeout(() => {
        el.setSelectionRange(start + ph.length, start + ph.length);
        el.focus();
      }, 0);
    } else if (bodyRef.current) {
      const el = bodyRef.current;
      const start = el.selectionStart ?? body.length;
      const end = el.selectionEnd ?? body.length;
      const next = body.slice(0, start) + ph + body.slice(end);
      setBody(next);
      setTimeout(() => {
        el.setSelectionRange(start + ph.length, start + ph.length);
        el.focus();
      }, 0);
    }
  }

  function handleSave() {
    localStorage.setItem(LS_SUBJECT, subject);
    localStorage.setItem(LS_BODY, body);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setSubject(DEFAULT_SUBJECT);
    setBody(DEFAULT_BODY);
    localStorage.removeItem(LS_SUBJECT);
    localStorage.removeItem(LS_BODY);
    setSaved(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-foreground">Mail Templates</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the email subject and body used when sending individual ROI
          audit reports. Click a placeholder chip to insert it at your cursor
          position.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 space-y-5 shadow-sm">
        {/* Subject */}
        <div className="space-y-1.5">
          <Label htmlFor="mail-subject" className="font-semibold">
            Subject Line
          </Label>
          <Input
            id="mail-subject"
            ref={subjectRef}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onFocus={() => {
              lastFocused.current = "subject";
            }}
            placeholder="Email subject..."
            className="font-mono text-sm"
            data-ocid="admin.input"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <Label htmlFor="mail-body" className="font-semibold">
            Email Body
          </Label>
          <Textarea
            id="mail-body"
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => {
              lastFocused.current = "body";
            }}
            rows={12}
            placeholder="Email body..."
            className="font-mono text-sm resize-y"
            data-ocid="admin.textarea"
          />
        </div>

        {/* Placeholder chips */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Insert Placeholder
          </p>
          <PlaceholderChips onInsert={insertPlaceholder} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            className="gap-2 text-white font-semibold"
            style={{ background: PRIMARY }}
            data-ocid="admin.save_button"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Template"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
            data-ocid="admin.secondary_button"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          {saved && (
            <span
              className="text-sm font-medium"
              style={{ color: PRIMARY }}
              data-ocid="admin.success_state"
            >
              ✓ Template saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface LeadDetailModalProps {
  lead: ROILead | null;
  onClose: () => void;
}

function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  if (!lead) return null;
  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full" data-ocid="admin.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: PRIMARY }} />
            {lead.name} — ROI Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {(
            [
              ["Name", lead.name],
              ["Email", lead.email],
              ["Phone", lead.phone],
              ["Monthly Revenue", `₹${formatINR(lead.monthlyRevenue)}`],
              ["Staff Hours/month", `${lead.staffHours} hrs`],
              ["Hourly Wage", `₹${formatINR(lead.hourlyWage)}`],
              ["Lost Leads/month", String(lead.lostLeads)],
              ["Avg Order Value", `₹${formatINR(lead.avgOrderValue)}`],
              ["Date", formatTimestamp(lead.timestamp)],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 text-sm border-b border-gray-100 pb-2 last:border-0"
            >
              <span className="text-muted-foreground font-medium min-w-[140px]">
                {label}
              </span>
              <span className="text-foreground font-semibold text-right">
                {value}
              </span>
            </div>
          ))}
          {/* Total gain highlight */}
          <div
            className="rounded-xl p-4 text-center mt-2"
            style={{ background: PRIMARY_LIGHT }}
          >
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Total Potential Monthly Gain
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: PRIMARY }}>
              ₹{formatINR(lead.totalMonthlyGain)}/mo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() =>
              downloadCSV(
                [lead],
                `roi-lead-${lead.name.replace(/\s+/g, "-").toLowerCase()}.csv`,
              )
            }
            data-ocid="admin.secondary_button"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
          <Button
            size="sm"
            className="gap-2 text-white"
            style={{ background: PRIMARY }}
            onClick={() => sendLeadMail(lead)}
            data-ocid="admin.primary_button"
          >
            <Send className="w-4 h-4" />
            Send Mail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const {
    actor,
    isFetching,
    error: actorError,
    refetch: retryActor,
  } = useActor();
  const queryClient = useQueryClient();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const [claimError, setClaimError] = useState<string | null>(null);
  const isConnecting = isLoggedIn && (isFetching || !actor) && !actorError;

  // ROI bulk modal state
  const [roiModalOpen, setRoiModalOpen] = useState(false);
  const [showMailInput, setShowMailInput] = useState(false);
  const [mailAddress, setMailAddress] = useState("");

  // Per-row detail modal
  const [selectedLead, setSelectedLead] = useState<ROILead | null>(null);

  // ─── Queries ──────────────────────────────────────────────────────────────

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
    enabled: !!actor && !isFetching && isLoggedIn,
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
    enabled: !!actor && !isFetching && isLoggedIn && !!isAdmin,
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
    enabled: !!actor && !isFetching && isLoggedIn && !!isAdmin,
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleBulkSendMail = () => {
    if (!mailAddress || !roiLeads) return;
    const subject = encodeURIComponent("SysTrans ROI Leads Report");
    const body = encodeURIComponent(buildBulkMailtoBody(roiLeads));
    window.location.href = `mailto:${mailAddress}?subject=${subject}&body=${body}`;
  };

  const currentYear = new Date().getFullYear();

  // ─── Render ───────────────────────────────────────────────────────────────

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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
            {isInitializing && (
              <p
                className="text-xs text-muted-foreground flex items-center gap-1"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Connecting...
              </p>
            )}
          </div>
        ) : actorError ? (
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
        ) : isConnecting || adminCheckLoading ? (
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
          // TABS
          <Tabs defaultValue="contacts" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Admin Panel
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage contact submissions, ROI audit leads, and mail
                  templates.
                </p>
              </div>
              <TabsList className="bg-gray-100">
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
                  <Settings className="w-4 h-4" />
                  Mail Templates
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── CONTACT SUBMISSIONS TAB ── */}
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
                    You may not have admin access. Contact the site owner.
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

            {/* ── ROI LEADS TAB ── */}
            <TabsContent value="roi-leads" className="space-y-4">
              {roiLeads && roiLeads.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {roiLeads.length} lead{roiLeads.length !== 1 ? "s" : ""}{" "}
                    collected
                  </p>
                  <Button
                    size="sm"
                    className="gap-2 text-white font-semibold shadow-sm"
                    style={{ background: PRIMARY }}
                    onClick={() => {
                      setShowMailInput(false);
                      setMailAddress("");
                      setRoiModalOpen(true);
                    }}
                    data-ocid="admin.open_modal_button"
                  >
                    <Eye className="w-4 h-4" />
                    View All
                  </Button>
                </div>
              )}

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
                    You may not have admin access. Contact the site owner.
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
                          Phone
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Total Monthly Gain
                        </TableHead>
                        <TableHead className="font-bold text-foreground whitespace-nowrap">
                          Date &amp; Time
                        </TableHead>
                        <TableHead className="font-bold text-foreground text-right">
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
                          {/* Per-row actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="View details"
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                style={{ color: PRIMARY }}
                                onClick={() => setSelectedLead(lead)}
                                data-ocid={`admin.edit_button.${i + 1}`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Download CSV"
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground"
                                onClick={() =>
                                  downloadCSV(
                                    [lead],
                                    `roi-lead-${lead.name.replace(/\s+/g, "-").toLowerCase()}.csv`,
                                  )
                                }
                                data-ocid={`admin.secondary_button.${i + 1}`}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Send mail"
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground"
                                onClick={() => sendLeadMail(lead)}
                                data-ocid={`admin.primary_button.${i + 1}`}
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ── MAIL TEMPLATES TAB ── */}
            <TabsContent value="mail-templates">
              <MailTemplatesTab />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* ── ROI BULK VIEW MODAL ── */}
      <Dialog open={roiModalOpen} onOpenChange={setRoiModalOpen}>
        <DialogContent
          className="max-w-6xl w-full max-h-[90vh] flex flex-col p-0 gap-0"
          data-ocid="admin.dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: PRIMARY }} />
                  ROI Leads — Full Report
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  {roiLeads?.length ?? 0} total leads
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => roiLeads && downloadCSV(roiLeads)}
                  data-ocid="admin.secondary_button"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
                <Button
                  size="sm"
                  className="gap-2 text-white"
                  style={{ background: PRIMARY }}
                  onClick={() => setShowMailInput((prev) => !prev)}
                  data-ocid="admin.primary_button"
                >
                  <Send className="w-4 h-4" />
                  Send Mail
                </Button>
              </div>
            </div>

            {showMailInput && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  type="email"
                  placeholder="Enter recipient email address"
                  value={mailAddress}
                  onChange={(e) => setMailAddress(e.target.value)}
                  className="flex-1 h-9 text-sm"
                  data-ocid="admin.input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBulkSendMail();
                  }}
                />
                <Button
                  size="sm"
                  disabled={!mailAddress}
                  className="gap-1.5 text-white flex-shrink-0"
                  style={{ background: PRIMARY }}
                  onClick={handleBulkSendMail}
                  data-ocid="admin.submit_button"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </Button>
              </div>
            )}
          </DialogHeader>

          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 sticky top-0">
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
                    Monthly Revenue (₹)
                  </TableHead>
                  <TableHead className="font-bold text-foreground whitespace-nowrap">
                    Staff Hours (hrs)
                  </TableHead>
                  <TableHead className="font-bold text-foreground whitespace-nowrap">
                    Hourly Wage (₹)
                  </TableHead>
                  <TableHead className="font-bold text-foreground whitespace-nowrap">
                    Lost Leads
                  </TableHead>
                  <TableHead className="font-bold text-foreground whitespace-nowrap">
                    Avg Order Value (₹)
                  </TableHead>
                  <TableHead className="font-bold text-foreground whitespace-nowrap">
                    Total Monthly Gain (₹/mo)
                  </TableHead>
                  <TableHead className="font-bold text-foreground whitespace-nowrap">
                    Date &amp; Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roiLeads?.map((lead, i) => (
                  <TableRow
                    key={String(lead.id)}
                    data-ocid={`admin.row.${i + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground whitespace-nowrap">
                      {lead.name}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 text-sm hover:underline whitespace-nowrap"
                        style={{ color: PRIMARY }}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {lead.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-foreground whitespace-nowrap">
                      {lead.phone}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      ₹{formatINR(lead.monthlyRevenue)}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      {lead.staffHours}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SINGLE LEAD DETAIL MODAL ── */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      <footer className="bg-white border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        &copy; {currentYear} SysTrans. All rights reserved.
      </footer>
    </div>
  );
}
