"""
Data models for the IOCore2 Coverage Analysis Tool.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Set, Any, Optional, Tuple

@dataclass
class TestCase:
    """Model representing a test case."""
    key: str
    name: str
    state: str = "ReadyForEvent"
    version: str = "1"
    created_on: Optional[str] = None
    actors: List[str] = field(default_factory=list)
    raw_data: Optional[Dict[str, Any]] = None

@dataclass
class SREQ:
    """Model representing a System Requirement."""
    number: str
    name: str
    status: str = "Active"
    actor: Optional[str] = None
    test_cases: Dict[str, TestCase] = field(default_factory=dict)
    si_number: Optional[str] = None
    si_name: Optional[str] = None
    tin_number: Optional[str] = None
    tin_name: Optional[str] = None
    ep_number: Optional[str] = None
    ep_name: Optional[str] = None
    function_name: Optional[str] = None
    
    def add_test_case(self, test_case: TestCase) -> None:
        """Add a test case to this SREQ."""
        if test_case.key not in self.test_cases:
            self.test_cases[test_case.key] = test_case
            
        # Add actor if not already present
        if self.actor and self.actor not in test_case.actors:
            test_case.actors.append(self.actor)

@dataclass
class Function:
    """Model representing a functional area."""
    name: str
    sreqs: Dict[str, SREQ] = field(default_factory=dict)
    
    def add_sreq(self, sreq: SREQ) -> None:
        """Add a SREQ to this function."""
        if sreq.number not in self.sreqs:
            sreq.function_name = self.name
            self.sreqs[sreq.number] = sreq
        else:
            # Merge test cases if SREQ already exists
            existing_sreq = self.sreqs[sreq.number]
            for key, test_case in sreq.test_cases.items():
                existing_sreq.add_test_case(test_case)

@dataclass
class EP:
    """Model representing an EP (Exchange Point)."""
    number: str
    name: str
    sreqs: Dict[str, SREQ] = field(default_factory=dict)
    
    def add_sreq(self, sreq: SREQ) -> None:
        """Add a SREQ to this EP."""
        if sreq.number not in self.sreqs:
            sreq.ep_number = self.number
            sreq.ep_name = self.name
            self.sreqs[sreq.number] = sreq
        else:
            # Merge test cases if SREQ already exists
            existing_sreq = self.sreqs[sreq.number]
            for key, test_case in sreq.test_cases.items():
                existing_sreq.add_test_case(test_case)

@dataclass
class TIN:
    """Model representing a TIN (Technical Interface)."""
    number: str
    name: str
    eps: Dict[str, EP] = field(default_factory=dict)
    
    def add_ep(self, ep: EP) -> None:
        """Add an EP to this TIN."""
        if ep.number not in self.eps:
            self.eps[ep.number] = ep
        else:
            # Merge SREQs if EP already exists
            existing_ep = self.eps[ep.number]
            for number, sreq in ep.sreqs.items():
                existing_ep.add_sreq(sreq)
    
    def add_sreq(self, sreq: SREQ, ep_number: str, ep_name: str) -> None:
        """Add a SREQ to this TIN under the specified EP."""
        if ep_number not in self.eps:
            ep = EP(number=ep_number, name=ep_name)
            self.eps[ep_number] = ep
        
        sreq.tin_number = self.number
        sreq.tin_name = self.name
        self.eps[ep_number].add_sreq(sreq)

@dataclass
class SI:
    """Model representing an SI (System Interface)."""
    number: str
    name: str
    tins: Dict[str, TIN] = field(default_factory=dict)
    functions: Dict[str, Function] = field(default_factory=dict)
    
    def add_tin(self, tin: TIN) -> None:
        """Add a TIN to this SI."""
        if tin.number not in self.tins:
            self.tins[tin.number] = tin
        else:
            # Merge EPs if TIN already exists
            existing_tin = self.tins[tin.number]
            for number, ep in tin.eps.items():
                existing_tin.add_ep(ep)
    
    def add_function(self, function: Function) -> None:
        """Add a Function to this SI."""
        if function.name not in self.functions:
            self.functions[function.name] = function
        else:
            # Merge SREQs if Function already exists
            existing_function = self.functions[function.name]
            for number, sreq in function.sreqs.items():
                existing_function.add_sreq(sreq)
    
    def add_sreq_to_tin(self, sreq: SREQ, tin_number: str, tin_name: str, ep_number: str, ep_name: str) -> None:
        """Add a SREQ to this SI under the specified TIN and EP."""
        if tin_number not in self.tins:
            tin = TIN(number=tin_number, name=tin_name)
            self.tins[tin_number] = tin
        
        sreq.si_number = self.number
        sreq.si_name = self.name
        self.tins[tin_number].add_sreq(sreq, ep_number, ep_name)
    
    def add_sreq_to_function(self, sreq: SREQ, function_name: str) -> None:
        """Add a SREQ to this SI under the specified Function."""
        if function_name not in self.functions:
            function = Function(name=function_name)
            self.functions[function_name] = function
        
        sreq.si_number = self.number
        sreq.si_name = self.name
        self.functions[function_name].add_sreq(sreq)

@dataclass
class IER:
    """Model representing an IER (Interface Exchange Requirement)."""
    number: str
    name: str
    test_cases: Dict[str, TestCase] = field(default_factory=dict)
    
    def add_test_case(self, test_case: TestCase) -> None:
        """Add a test case to this IER."""
        if test_case.key not in self.test_cases:
            self.test_cases[test_case.key] = test_case

@dataclass
class PI:
    """Model representing a PI (Programmatic Interface)."""
    number: str
    name: str
    iers: Dict[str, IER] = field(default_factory=dict)
    
    def add_ier(self, ier: IER) -> None:
        """Add an IER to this PI."""
        if ier.number not in self.iers:
            self.iers[ier.number] = ier
        else:
            # Merge test cases if IER already exists
            existing_ier = self.iers[ier.number]
            for key, test_case in ier.test_cases.items():
                existing_ier.add_test_case(test_case)
    
    def add_test_case_to_ier(self, test_case: TestCase, ier_number: str, ier_name: str) -> None:
        """Add a test case to this PI under the specified IER."""
        if ier_number not in self.iers:
            ier = IER(number=ier_number, name=ier_name)
            self.iers[ier_number] = ier
        
        self.iers[ier_number].add_test_case(test_case)

@dataclass
class CoverageData:
    """Model representing the full coverage data."""
    sis: Dict[str, SI] = field(default_factory=dict)
    pis: Dict[str, PI] = field(default_factory=dict)
    
    def add_si(self, si: SI) -> None:
        """Add an SI to the coverage data."""
        if si.number not in self.sis:
            self.sis[si.number] = si
        else:
            # Merge TINs and Functions if SI already exists
            existing_si = self.sis[si.number]
            for number, tin in si.tins.items():
                existing_si.add_tin(tin)
            for name, function in si.functions.items():
                existing_si.add_function(function)
    
    def add_pi(self, pi: PI) -> None:
        """Add a PI to the coverage data."""
        if pi.number not in self.pis:
            self.pis[pi.number] = pi
        else:
            # Merge IERs if PI already exists
            existing_pi = self.pis[pi.number]
            for number, ier in pi.iers.items():
                existing_pi.add_ier(ier)
