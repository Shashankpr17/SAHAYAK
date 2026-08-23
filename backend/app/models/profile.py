from datetime import date, datetime
import re
from typing import Optional, Any
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


class Profile(BaseModel):
    """
    Canonical SAHAYAK User Profile Data Model.
    Single source of truth for document extraction, review page, user profile,
    extension, and scheme eligibility verification.
    """
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        str_strip_whitespace=True
    )

    # -----------------------------
    # PERSONAL INFORMATION
    # -----------------------------
    full_name: Optional[str] = Field(default=None, description="Full name of the user")
    date_of_birth: Optional[date] = Field(default=None, description="Date of birth")
    gender: Optional[str] = Field(default=None, description="Gender (e.g., Male, Female, Transgender)")
    father_name: Optional[str] = Field(default=None, description="Father's or Guardian's name")
    mother_name: Optional[str] = Field(default=None, description="Mother's name")
    blood_group: Optional[str] = Field(default=None, description="Blood group (e.g., O+, A-, B+)")

    @model_validator(mode="before")
    @classmethod
    def map_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map frontend aliases
            if "city" in data and "city_locality" not in data:
                data["city_locality"] = data.pop("city")
            if "driving_licence_number" in data and "driving_license_number" not in data:
                data["driving_license_number"] = data.pop("driving_licence_number")
        return data

    # -----------------------------
    # IDENTITY INFORMATION
    # -----------------------------
    aadhaar_number: Optional[str] = Field(default=None, description="12-digit Aadhaar number")
    pan_number: Optional[str] = Field(default=None, description="Permanent Account Number (PAN)")
    driving_license_number: Optional[str] = Field(default=None, description="Driving License number")
    voter_id_number: Optional[str] = Field(default=None, description="Voter ID / EPIC number")

    # -----------------------------
    # ADDRESS INFORMATION
    # -----------------------------
    address: Optional[str] = Field(default=None, description="Complete residential address line")
    state: Optional[str] = Field(default=None, description="State or Union Territory")
    district: Optional[str] = Field(default=None, description="District")
    city_locality: Optional[str] = Field(default=None, description="City, town, or locality")
    pin_code: Optional[str] = Field(default=None, description="6-digit Indian postal PIN code")

    # -----------------------------
    # ADDITIONAL INFORMATION
    # -----------------------------
    annual_income: Optional[float] = Field(default=None, description="Annual household/individual income in INR")
    occupation: Optional[str] = Field(default=None, description="Primary occupation or profession")

    @field_validator(
        "full_name",
        "gender",
        "father_name",
        "mother_name",
        "blood_group",
        "aadhaar_number",
        "pan_number",
        "driving_license_number",
        "voter_id_number",
        "address",
        "state",
        "district",
        "city_locality",
        "occupation",
        mode="before"
    )
    @classmethod
    def sanitize_string_fields(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned or cleaned.lower() in {"none", "null", "n/a", "not available", "na", "undefined"}:
                return None
            return cleaned
        return str(v)

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_date_of_birth(cls, v: Any) -> Optional[date]:
        if v is None:
            return None
        if isinstance(v, date):
            return v
        if isinstance(v, datetime):
            return v.date()
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned or cleaned.lower() in {"none", "null", "n/a", "not available", "undefined"}:
                return None
            # Common Indian and ISO date formats
            date_formats = [
                "%Y-%m-%d",
                "%d/%m/%Y",
                "%d-%m-%Y",
                "%d.%m.%Y",
                "%Y/%m/%d"
            ]
            for fmt in date_formats:
                try:
                    return datetime.strptime(cleaned, fmt).date()
                except ValueError:
                    continue
            raise ValueError(f"Invalid date_of_birth format: '{cleaned}'. Expected standard date format (e.g. YYYY-MM-DD or DD/MM/YYYY).")
        raise ValueError(f"Invalid type for date_of_birth: {type(v).__name__}")

    @field_validator("pin_code", mode="before")
    @classmethod
    def validate_pin_code(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        pin_str = str(v).strip()
        if not pin_str or pin_str.lower() in {"none", "null", "n/a", "not available", "undefined"}:
            return None
        # Remove any internal spaces
        pin_clean = re.sub(r"\s+", "", pin_str)
        if not re.fullmatch(r"^\d{6}$", pin_clean):
            raise ValueError(f"Invalid Indian PIN code: '{v}'. PIN code must be a 6-digit number.")
        return pin_clean

    @field_validator("annual_income", mode="before")
    @classmethod
    def validate_annual_income(cls, v: Any) -> Optional[float]:
        if v is None:
            return None
        if isinstance(v, (int, float)):
            if v < 0:
                raise ValueError("Annual income cannot be negative.")
            return float(v)
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned or cleaned.lower() in {"none", "null", "n/a", "not available", "undefined"}:
                return None
            # Strip currency signs (₹, Rs., INR), commas, and spaces
            cleaned_num = re.sub(r"[^\d.]", "", cleaned)
            if not cleaned_num:
                return None
            try:
                income_val = float(cleaned_num)
                if income_val < 0:
                    raise ValueError("Annual income cannot be negative.")
                return income_val
            except ValueError:
                raise ValueError(f"Invalid annual_income value: '{v}'")
        raise ValueError(f"Invalid type for annual_income: {type(v).__name__}")


UserProfile = Profile
