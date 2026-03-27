import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";

module {
  type OldState = {
    contactSubmissions : Map.Map<Nat, { id : Nat; name : Text; email : Text; message : Text; timestamp : Int }>;
    contactIds : List.List<Nat>;
    nextId : Nat;
  };

  type NewState = {
    contactSubmissions : Map.Map<Nat, { id : Nat; name : Text; email : Text; message : Text; timestamp : Int }>;
    roiLeads : Map.Map<Nat, { id : Nat; name : Text; email : Text; phone : Text; monthlyRevenue : Float; staffHours : Float; lostLeads : Float; hourlyWage : Float; avgOrderValue : Float; totalMonthlyGain : Float; timestamp : Int }>;
    contactIds : List.List<Nat>;
    roiLeadIds : List.List<Nat>;
    nextContactId : Nat;
    nextRoiLeadId : Nat;
  };

  public func run(old : OldState) : NewState {
    { old with roiLeads = Map.empty() : Map.Map<Nat, { id : Nat; name : Text; email : Text; phone : Text; monthlyRevenue : Float; staffHours : Float; lostLeads : Float; hourlyWage : Float; avgOrderValue : Float; totalMonthlyGain : Float; timestamp : Int }>; roiLeadIds = List.empty(); nextContactId = old.nextId; nextRoiLeadId = 0 };
  };
};
