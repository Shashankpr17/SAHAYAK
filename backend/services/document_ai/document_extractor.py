"""
SAHAYAK Document AI — Pipeline Orchestrator

Orchestrates the full document understanding pipeline:

    DOCUMENT IMAGE
        ↓
    AI VISION + TEXT EXTRACTION (gemini_client)
        ↓
    RAW DOCUMENT INFORMATION
        ↓
    INTELLIGENT FIELD UNDERSTANDING (profile_intelligence)
        ↓
    ENTITY EXTRACTION + DATA NORMALIZATION
        ↓
    ADDRESS INTELLIGENCE (address_parser)
        ↓
    VALIDATION (data_validator)
        ↓
    FINAL USER PROFILE

This is the main entry point called from field_extractor.py.
"""

from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path

from services.document_ai.gemini_client import extract_document_intelligence
from services.document_ai.profile_intelligence import (
    build_profile_from_gemini,
    merge_profiles,
)
from services.document_ai.address_parser import enrich_address
from services.document_ai.data_validator import confidence_label


def extract_document_intelligence_pipeline(
    files_to_process: List[Tuple[str, bytes]],
    document_type: Optional[str] = None,
    document_subtype: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Run the full document understanding pipeline on one or more document files.
    
    Args:
        files_to_process: List of (filename, file_bytes) tuples.
        document_type: Optional document type category (e.g., "ID Proof").
        document_subtype: Optional specific document type (e.g., "Aadhaar Card").
    
    Returns:
        Dict with keys:
            - "profile": The merged, enriched profile dict
            - "confidence_data": Confidence metadata for each field
            - "combined_text": Debug text summary
            - "document_types": List of detected document types
        
        Returns None if all extraction attempts fail.
    """
    print("=" * 60)
    print("[DOCUMENT AI] ━━━ Starting Intelligent Document Understanding Pipeline ━━━")
    print(f"[DOCUMENT AI] Processing {len(files_to_process)} document(s)")
    print("=" * 60)

    extracted_profiles = []
    document_types = []
    debug_summaries = []
    extracted_files_meta = []

    for filename, file_bytes in files_to_process:
        file_ext = Path(filename).suffix.lower()
        
        # Determine MIME type
        mime_type = "image/jpeg"
        if file_ext == ".png":
            mime_type = "image/png"
        elif file_ext == ".pdf":
            mime_type = "application/pdf"

        print(f"\n[DOCUMENT AI] ── Processing: {filename} ({len(file_bytes)} bytes, {mime_type}) ──")

        # ━━━ STEP 1: AI Vision — Send to Gemini ━━━
        raw_gemini = extract_document_intelligence(
            file_bytes=file_bytes,
            mime_type=mime_type,
            document_subtype=document_subtype,
        )

        doc_summary = ""
        if raw_gemini:
            doc_type = raw_gemini.get("documentType", "Unknown")
            personal = raw_gemini.get("personal", {})
            identity = raw_gemini.get("identity", {})
            address = raw_gemini.get("address", {})
            doc_summary = (
                f"Document Type: {doc_type}\n"
                f"Name: {personal.get('fullName') or 'None'}\n"
                f"DOB: {personal.get('dateOfBirth') or 'None'}\n"
                f"Gender: {personal.get('gender') or 'None'}\n"
                f"Address: {address.get('fullAddress') or 'None'}"
            )
        
        extracted_files_meta.append({
            "filename": filename,
            "file_type": mime_type,
            "text": doc_summary or "Failed to extract readable content.",
            "status": "success" if raw_gemini else "failed",
            "metadata": {
                "document_type": raw_gemini.get("documentType", "Unknown") if raw_gemini else "Unknown"
            }
        })

        if not raw_gemini:
            print(f"[DOCUMENT AI] WARNING: Gemini extraction failed for {filename}")
            continue

        doc_type = raw_gemini.get("documentType", "Unknown")
        document_types.append(doc_type)
        print(f"[DOCUMENT AI] Document type detected: {doc_type}")

        # ━━━ STEP 2: Profile Intelligence — Normalize + Validate ━━━
        profile = build_profile_from_gemini(raw_gemini)

        # ━━━ STEP 3: Address Intelligence — Enrich address components ━━━
        profile = enrich_address(profile)

        extracted_profiles.append(profile)

        # Build debug summary
        debug_summaries.append(
            f"Document: {filename}\n"
            f"Type: {doc_type}\n"
            f"Name: {profile.get('full_name', 'None')}\n"
            f"DOB: {profile.get('date_of_birth', 'None')}\n"
            f"Gender: {profile.get('gender', 'None')}\n"
            f"Address: {(profile.get('address') or 'None')[:60]}\n"
            f"District: {profile.get('district', 'None')}\n"
            f"State: {profile.get('state', 'None')}\n"
            f"PIN: {profile.get('pin_code', 'None')}"
        )

    if not extracted_profiles:
        print("[DOCUMENT AI] ERROR: No documents were successfully processed")
        return None

    # ━━━ STEP 4: Multi-Document Merge ━━━
    if len(extracted_profiles) == 1:
        final_profile = extracted_profiles[0]
    else:
        print(f"\n[DOCUMENT AI] ── Merging {len(extracted_profiles)} document profiles ──")
        final_profile = merge_profiles(extracted_profiles)
        # Re-run address enrichment on merged profile
        final_profile = enrich_address(final_profile)

    # ━━━ STEP 5: Final Address Intelligence Pass ━━━
    # Ensure address components are derived even after merge
    final_profile = enrich_address(final_profile)

    # ━━━ STEP 6: Build Confidence Data ━━━
    raw_confidence = final_profile.pop("_confidence", {})
    confidence_data = {}
    
    field_mappings = {
        "full_name": "full_name",
        "date_of_birth": "date_of_birth",
        "state": "state",
        "address": "address",
        "gender": "gender",
        "father_name": "father_name",
        "district": "district",
        "pin_code": "pin_code",
    }
    
    for field_key, conf_key in field_mappings.items():
        value = final_profile.get(field_key)
        conf_score = raw_confidence.get(conf_key, 0 if not value else 80)
        confidence_data[field_key] = {
            "value": value,
            "confidence": conf_score,
            "level": confidence_label(conf_score),
        }

    # ━━━ STEP 7: Debug Summary ━━━
    combined_text = "\n\n".join(debug_summaries)
    
    print("\n" + "=" * 60)
    print("[DOCUMENT AI] ━━━ Pipeline Complete ━━━")
    print(f"  Documents processed: {len(extracted_profiles)}")
    print(f"  Document types: {', '.join(document_types)}")
    print(f"  Fields extracted:")
    
    for key, value in final_profile.items():
        if key.startswith("_"):
            continue
        if key in ("aadhaar_number",) and value:
            print(f"    {key}: XXXX XXXX {value[-4:]}")
        elif key in ("pan_number",) and value:
            print(f"    {key}: {value[:2]}***{value[-1:]}")
        elif value:
            display = str(value)[:50]
            print(f"    {key}: {display}")
    
    # Log address intelligence results
    derived_fields = []
    if final_profile.get("district"):
        derived_fields.append(f"District: {final_profile['district']}")
    if final_profile.get("state"):
        derived_fields.append(f"State: {final_profile['state']}")
    if final_profile.get("pin_code"):
        derived_fields.append(f"PIN: {final_profile['pin_code']}")
    
    if derived_fields:
        print(f"  Address intelligence derived:")
        for d in derived_fields:
            print(f"    - {d}")
    
    # DOB validation status
    if final_profile.get("date_of_birth"):
        dob_level = confidence_data.get("date_of_birth", {}).get("level", "unknown")
        print(f"  DOB validation: passed (confidence: {dob_level})")
    else:
        print(f"  DOB validation: no valid DOB found")
    
    print("=" * 60)

    return {
        "profile": final_profile,
        "confidence_data": confidence_data,
        "combined_text": combined_text,
        "document_types": document_types,
        "extracted_files": extracted_files_meta,
    }
