import Time "mo:core/Time";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Types, including authorization features
  type ContactSubmission = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  type ROILead = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    monthlyRevenue : Float;
    staffHours : Float;
    lostLeads : Float;
    hourlyWage : Float;
    avgOrderValue : Float;
    totalMonthlyGain : Float;
    timestamp : Int;
  };

  type JobPosting = {
    id : Nat;
    title : Text;
    description : Text;
    location : Text;
    jobType : Text;
    salaryRange : Text;
    department : Text;
    isActive : Bool;
    createdAt : Int;
  };

  type JobApplication = {
    id : Nat;
    jobId : Nat;
    jobTitle : Text;
    applicantName : Text;
    yearsExperience : Float;
    currentCTC : Text;
    expectedCTC : Text;
    resumeBlobId : Text;
    resumeFileName : Text;
    appliedAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  // Admin-Only state
  let contactSubmissions = Map.empty<Nat, ContactSubmission>();
  let roiLeads = Map.empty<Nat, ROILead>();
  let contactIds = List.empty<Nat>();
  let roiLeadIds = List.empty<Nat>();
  var nextContactId = 0;
  var nextRoiLeadId = 0;

  // Job state
  let jobPostings = Map.empty<Nat, JobPosting>();
  let jobPostingIds = List.empty<Nat>();
  var nextJobId = 0;
  let jobApplications = Map.empty<Nat, JobApplication>();
  let jobApplicationIds = List.empty<Nat>();
  var nextJobApplicationId = 0;

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Include prefabricated authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Contact form submission - public, anyone can submit
  public shared ({ caller }) func submitContact(name : Text, email : Text, message : Text) : async Nat {
    let submissionId = nextContactId;
    nextContactId += 1;

    let submission : ContactSubmission = {
      id = submissionId;
      name;
      email;
      message;
      timestamp = Time.now();
    };
    contactSubmissions.add(submissionId, submission);
    contactIds.add(submissionId);

    submissionId;
  };

  // Submit ROI lead - public function for anyone to submit
  public shared ({ caller }) func submitROILead(
    name : Text,
    email : Text,
    phone : Text,
    monthlyRevenue : Float,
    staffHours : Float,
    lostLeads : Float,
    hourlyWage : Float,
    avgOrderValue : Float,
    totalMonthlyGain : Float,
  ) : async Nat {
    let leadId = nextRoiLeadId;
    nextRoiLeadId += 1;

    let lead : ROILead = {
      id = leadId;
      name;
      email;
      phone;
      monthlyRevenue;
      staffHours;
      lostLeads;
      hourlyWage;
      avgOrderValue;
      totalMonthlyGain;
      timestamp = Time.now();
    };
    roiLeads.add(leadId, lead);
    roiLeadIds.add(leadId);

    leadId;
  };

  // Get all contacts - admin only
  public query ({ caller }) func getContacts() : async [ContactSubmission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view contact submissions");
    };

    contactIds.values().map(func(id) { contactSubmissions.get(id).unwrap() }).toArray();
  };

  // Get all ROI leads - admin only
  public query ({ caller }) func getROILeads() : async [ROILead] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view ROI leads");
    };

    let leadIter = roiLeadIds.values();
    let resultIter = leadIter.map(
      func(id) {
        switch (roiLeads.get(id)) {
          case (?lead) { lead };
          case (null) { Runtime.trap("ROI lead not found") };
        };
      }
    );
    resultIter.toArray();
  };

  // Add admin - admin only (via AccessControl.assignRole which has built-in admin check)
  public shared ({ caller }) func addAdmin(user : Principal) : async () {
    AccessControl.assignRole(accessControlState, caller, user, #admin);
  };

  // Self-register as admin -- only works when no admin has been assigned yet
  public shared ({ caller }) func becomeFirstAdmin() : async () {
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin already assigned. Only one admin can exist.");
    };
    if (caller.isAnonymous()) {
      Runtime.trap("Must be logged in");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        userProfiles.add(
          caller,
          {
            name = "";
          },
        );
      };
      case (_) {};
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

  public query func hasAdminBeenAssigned() : async Bool {
    accessControlState.adminAssigned
  };

  public query ({ caller }) func getContactSubmissionById(id : Nat) : async ?ContactSubmission {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view contact submissions");
    };
    contactSubmissions.get(id);
  };

  public shared ({ caller }) func deleteContactSubmission(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only delete contact if admin");
    };

    if (not contactSubmissions.containsKey(id)) {
      Runtime.trap("Contact submission does not exist");
    };

    contactSubmissions.remove(id);
    let newContactIds = contactIds.filter(func(x) { x != id });
    contactIds.clear();
    contactIds.addAll(newContactIds.values());
    true;
  };

  // --- JOB POSTINGS ---

  // Create job posting - admin only
  public shared ({ caller }) func createJobPosting(
    title : Text,
    description : Text,
    location : Text,
    jobType : Text,
    salaryRange : Text,
    department : Text,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create job postings");
    };
    let jobId = nextJobId;
    nextJobId += 1;
    let posting : JobPosting = {
      id = jobId;
      title;
      description;
      location;
      jobType;
      salaryRange;
      department;
      isActive = true;
      createdAt = Time.now();
    };
    jobPostings.add(jobId, posting);
    jobPostingIds.add(jobId);
    jobId;
  };

  // Delete job posting - admin only
  public shared ({ caller }) func deleteJobPosting(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete job postings");
    };
    if (not jobPostings.containsKey(id)) {
      return false;
    };
    jobPostings.remove(id);
    let newIds = jobPostingIds.filter(func(x) { x != id });
    jobPostingIds.clear();
    jobPostingIds.addAll(newIds.values());
    true;
  };

  // Get active job postings - public
  public query func getJobPostings() : async [JobPosting] {
    jobPostingIds.values().map(func(id) {
      switch (jobPostings.get(id)) {
        case (?p) { p };
        case (null) { Runtime.trap("Job posting not found") };
      };
    }).filter(func(p) { p.isActive }).toArray();
  };

  // Get all job postings (incl inactive) - admin only
  public query ({ caller }) func getAllJobPostings() : async [JobPosting] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all job postings");
    };
    jobPostingIds.values().map(func(id) {
      switch (jobPostings.get(id)) {
        case (?p) { p };
        case (null) { Runtime.trap("Job posting not found") };
      };
    }).toArray();
  };

  // --- JOB APPLICATIONS ---

  // Submit job application - public
  public shared ({ caller }) func submitJobApplication(
    jobId : Nat,
    applicantName : Text,
    yearsExperience : Float,
    currentCTC : Text,
    expectedCTC : Text,
    resumeBlobId : Text,
    resumeFileName : Text,
  ) : async Nat {
    let jobTitle = switch (jobPostings.get(jobId)) {
      case (?p) { p.title };
      case (null) { "Unknown Position" };
    };
    let appId = nextJobApplicationId;
    nextJobApplicationId += 1;
    let app : JobApplication = {
      id = appId;
      jobId;
      jobTitle;
      applicantName;
      yearsExperience;
      currentCTC;
      expectedCTC;
      resumeBlobId;
      resumeFileName;
      appliedAt = Time.now();
    };
    jobApplications.add(appId, app);
    jobApplicationIds.add(appId);
    appId;
  };

  // Get all job applications - admin only
  public query ({ caller }) func getJobApplications() : async [JobApplication] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view job applications");
    };
    jobApplicationIds.values().map(func(id) {
      switch (jobApplications.get(id)) {
        case (?a) { a };
        case (null) { Runtime.trap("Job application not found") };
      };
    }).toArray();
  };
};
