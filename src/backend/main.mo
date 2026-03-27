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

  // Include prefabricated authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

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

    let contactIter = contactIds.values();
    let resultIter = contactIter.map(
      func(id) {
        switch (contactSubmissions.get(id)) {
          case (?contact) { contact };
          case (null) { Runtime.trap("Contact submission not found") };
        };
      }
    );
    resultIter.toArray();
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

  // Warning for legacy canisters attempting legacy admin migration
  public shared ({ caller }) func getAllContactSubmissions() : async [ContactSubmission] {
    Runtime.trap(
      "This is a legacy canister and you are trying to call a deprecated function. Please use `addAdmin` to become the first admin. Once you are an admin, you can use the `getContacts` function. Afterwards, `getAllContactSubmissions` can be deleted.",
    );
  };
};
