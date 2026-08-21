from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class UserProfileEvaluated(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    state: Optional[str] = None
    address: Optional[str] = None
    annual_income: Optional[str] = None
    annual_income_numeric: Optional[int] = None
    occupation: Optional[str] = None


class SchemeEvaluationResult(BaseModel):
    id: str
    name: str
    category: str
    status: str  # "eligible", "possible", "needs_more_information", "not_eligible"
    reasons: List[str]
    missing_information: List[str]
    official_link: str


class EligibilityResponse(BaseModel):
    profile: Dict[str, Any]
    eligible_schemes: List[SchemeEvaluationResult]
    possible_schemes: List[SchemeEvaluationResult]
    needs_more_information: List[SchemeEvaluationResult]
    all_schemes: List[SchemeEvaluationResult]
