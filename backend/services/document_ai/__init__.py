# SAHAYAK Document AI — Intelligent Document Understanding Pipeline
"""
This package provides a modular, AI-powered document understanding pipeline
for extracting structured profile data from Indian government identity documents.

Pipeline:
    DOCUMENT IMAGE → AI VISION → RAW DATA → FIELD UNDERSTANDING
    → ENTITY EXTRACTION → DATA NORMALIZATION → ADDRESS INTELLIGENCE
    → VALIDATION → FINAL USER PROFILE

Modules:
    - gemini_client: Centralized Gemini API configuration and calls
    - document_extractor: Pipeline orchestrator
    - profile_intelligence: Data normalization and multi-document merge
    - address_parser: Address intelligence and geographic parsing
    - data_validator: Post-extraction validation and confidence scoring
"""

from services.document_ai.document_extractor import extract_document_intelligence_pipeline

__all__ = ["extract_document_intelligence_pipeline"]
