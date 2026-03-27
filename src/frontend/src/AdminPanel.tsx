import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { ContactSubmission, ROILead } from "./backend.d";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}

function formatINR(value: number): string {
  return value.toLocaleString("en-IN");
}

export default function AdminPanel() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  // Check if user is admin
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

  // Try to become first admin
  const { mutate: claimAdmin, isPending: claimingAdmin } = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.becomeFirstAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["roiLeads"] });
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-xs px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <img
                src="/assets/generated/systrans-symbol-only-transparent.dim_200x200.png"
                alt="SysTrans Symbol"
                className="h-10 w-auto object-contain"
              />
              <span
                className="font-bold text-lg"
                style={{ color: "oklch(0.52 0.18 264)" }}
              >
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
          // LOGIN PROMPT
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: "oklch(0.95 0.04 264)" }}
            >
              <ShieldCheck
                className="w-8 h-8"
                style={{ color: "oklch(0.52 0.18 264)" }}
              />
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
        ) : adminCheckLoading ? (
          // CHECKING ADMIN STATUS
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "oklch(0.52 0.18 264)" }}
            />
            <p className="text-muted-foreground">Checking access...</p>
          </div>
        ) : !isAdmin ? (
          // NOT ADMIN -- offer to claim if first admin slot is open
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: "oklch(0.95 0.04 264)" }}
            >
              <ShieldCheck
                className="w-8 h-8"
                style={{ color: "oklch(0.52 0.18 264)" }}
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Claim Admin Access
            </h1>
            <p className="text-muted-foreground text-center max-w-sm">
              No admin has been assigned yet. Click below to become the admin
              and access submissions.
            </p>
            <Button
              onClick={() => claimAdmin()}
              disabled={claimingAdmin}
              className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 h-11 gap-2"
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
          // TABS: CONTACT SUBMISSIONS + ROI LEADS
          <Tabs defaultValue="contacts" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Admin Panel
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage contact submissions and ROI audit leads.
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
                      style={{ background: "oklch(0.52 0.18 264)" }}
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
                      style={{ background: "oklch(0.52 0.18 264)" }}
                    >
                      {roiLeads.length}
                    </Badge>
                  )}
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
                    style={{ background: "oklch(0.95 0.04 264)" }}
                  >
                    <Inbox
                      className="w-7 h-7"
                      style={{ color: "oklch(0.52 0.18 264)" }}
                    />
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
                              style={{ color: "oklch(0.52 0.18 264)" }}
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
                    style={{ background: "oklch(0.95 0.04 264)" }}
                  >
                    <TrendingUp
                      className="w-7 h-7"
                      style={{ color: "oklch(0.52 0.18 264)" }}
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
                              style={{ color: "oklch(0.52 0.18 264)" }}
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
                              style={{ color: "oklch(0.42 0.2 264)" }}
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
              )}
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
