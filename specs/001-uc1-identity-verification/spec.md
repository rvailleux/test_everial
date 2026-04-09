# Feature Specification: UC1 — Identity Verification (CNI / Passport)

**Feature Branch**: `001-uc1-identity-verification`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "UC1 — Vérification d'identité (CNI / Passeport): Documents carte d'identité, passeport. Extraction: nom, prénom, date de naissance, date d'expiration, MRZ"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture and Extract Identity from National ID Card (Priority: P1)

During a video call session, an agent (advisor, insurance agent, etc.) needs to verify a customer's identity. The customer uploads or presents their French national ID card (Carte Nationale d'Identité). The system automatically identifies the document, extracts all key identity fields, and displays them to the agent for review.

**Why this priority**: Identity verification via CNI is the core use case. A successful CNI extraction alone constitutes a working MVP that demonstrates the full recognize → analyze data flow and delivers immediate value to the agent.

**Independent Test**: Can be fully tested by uploading a CNI image and verifying that name, first name, date of birth, expiry date, and MRZ are correctly displayed — independently of any video call integration.

**Acceptance Scenarios**:

1. **Given** a customer has a valid French CNI, **When** they upload the front-face image, **Then** the system identifies it as a CNI and extracts: last name, first name, date of birth, expiry date, and MRZ within 10 seconds.
2. **Given** the document has been extracted, **When** the agent reviews the result panel, **Then** all extracted fields are displayed in a human-readable card alongside the raw extracted data.
3. **Given** the document is expired, **When** extraction completes, **Then** the expiry date is clearly shown and the agent can see it is past the current date.

---

### User Story 2 - Capture and Extract Identity from Passport (Priority: P2)

Same flow as story 1 but for a passport. The customer uploads a photo of their passport's data page. The system recognizes it as a passport, extracts all identity fields including the two-line MRZ, and displays them to the agent.

**Why this priority**: Passport is the second most common identity document. Supports a wider range of customers including foreign nationals and those without a CNI.

**Independent Test**: Can be fully tested by uploading a passport image and verifying that name, first name, nationality, date of birth, expiry date, and MRZ fields are displayed.

**Acceptance Scenarios**:

1. **Given** a customer uploads a passport image, **When** the system processes it, **Then** it identifies the document as a passport and extracts: last name, first name, nationality, date of birth, expiry date, and MRZ (TD3 format).
2. **Given** extraction is complete, **When** the agent views the result, **Then** the MRZ is displayed both raw and parsed (surname, given name, document number, nationality, DOB, expiry, check digits).

---

### User Story 3 - Handle Unreadable or Unsupported Document (Priority: P3)

A customer submits an image that is blurry, poorly lit, or is not a supported identity document. The system clearly communicates that it could not process the document and guides the user to retry.

**Why this priority**: Graceful error handling improves agent confidence and prevents silent failures during demos.

**Independent Test**: Can be tested by uploading a plain text document or a low-quality image and confirming that a clear error message is shown with a retry option.

**Acceptance Scenarios**:

1. **Given** a customer uploads a blurry or dark image, **When** the system attempts recognition, **Then** it displays an error message explaining the document could not be read and prompts the user to retake or re-upload.
2. **Given** a customer uploads a document that is not an identity document, **When** the system processes it, **Then** it informs the agent that no identity document was detected and offers a retry.

---

### Edge Cases

- What happens when only the back of the CNI is uploaded (no MRZ on the back side)?
- How does the system handle a passport from a country with a non-Latin script?
- What if the image is a photo of a photocopy or a digital screenshot?
- What if extraction is partial — some fields missing but others present?
- What if the document type is ambiguous (e.g., a residence permit resembling a CNI)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a user to submit an identity document (CNI or passport) by uploading an image file.
- **FR-002**: The system MUST automatically identify the document type (CNI or passport) without requiring the user to specify it manually.
- **FR-003**: The system MUST extract the following fields from a CNI: last name, first name, date of birth, document expiry date, MRZ.
- **FR-004**: The system MUST extract the following fields from a passport: last name, first name, nationality, date of birth, document expiry date, full MRZ (both lines).
- **FR-005**: The system MUST display extracted fields in a human-readable card format alongside the raw extraction output.
- **FR-006**: The system MUST show a processing indicator while document recognition and extraction are in progress.
- **FR-007**: The system MUST display a clear error message when the document cannot be recognized or extraction fails, with the option to retry.
- **FR-008**: The system MUST NOT expose recognition or extraction credentials to the browser at any point.
- **FR-009**: All document processing MUST go through a backend proxy — the browser never calls document recognition services directly.
- **FR-010**: The system MUST support JPEG and PNG image formats as minimum accepted input types.

### Key Entities

- **Identity Document**: Represents a submitted document — includes document type (CNI / passport), submission timestamp, and processing status.
- **Extraction Result**: The output of processing a document — includes all extracted fields (name, DOB, expiry, MRZ, nationality), raw output from the recognition service, and confidence indicators if available.
- **Session**: The video call context in which document capture takes place — links an agent and a customer for the duration of the interaction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A submitted identity document is recognized and all fields extracted within 10 seconds of upload under normal network conditions.
- **SC-002**: At least 4 of the 5 mandatory CNI fields (last name, first name, DOB, expiry, MRZ) are successfully extracted from a well-photographed document on first attempt.
- **SC-003**: Agents can read and understand the extraction result without consulting any documentation — the result card is self-explanatory.
- **SC-004**: Unreadable or unsupported documents are identified as such in 100% of cases — no silent failures where the system shows empty results without explanation.
- **SC-005**: The full flow from document upload to displayed result can be completed by a first-time user without instructions in under 60 seconds.

## Assumptions

- The demo targets French identity documents (CNI, French passport) primarily; support for foreign equivalents is out of scope for UC1.
- The user has access to a physical document or a high-quality digital scan — live camera capture is a potential enhancement but file upload is the required input method for this iteration.
- No persistent storage of extracted personal data is required — results are shown within the session only and discarded when the session ends.
- Document images are assumed to be under 10 MB in size.
- The video call session context is available but UC1 can function as a standalone demo without an active call.
- The recognize → analyze sequence is handled automatically by the backend; the frontend only triggers capture and displays results.
