# Feedants – Competition Details Screen

A functional full-stack Competition Details module built as part of the Feedants Full Stack Development Internship assignment.

The module implements a dynamic competition-details experience with React Native, Node.js, Express.js and MongoDB.

---

## 1. Tech Stack

### Frontend
- React Native
- Expo SDK 57
- JavaScript
- Expo Document Picker
- Expo Clipboard
- React Native Safe Area Context
- Ionicons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Multer for file uploads
- Express Validator

### Database
- MongoDB Atlas

---

## 2. Features

### Competition Details
Competition information is loaded dynamically from the backend rather than being hardcoded in the UI.

The screen displays:

- Competition title
- Tags
- Certificate information
- Prize pool
- Entry fee
- Remaining spots
- Participant count
- Judge information
- Important dates
- Previous winners
- Competition description
- Judging parameters
- Rules and eligibility
- Rewards
- Registration countdown

### Registration

Users can register for a competition when:

- Registration is open
- Registration deadline has not passed
- Competition is not full
- User is not already registered

The backend validates these conditions.

### Submission

Registered users can upload competition submissions during the submission window.

Supported file types:

- MP4
- MOV
- WebM
- JPEG
- PNG

The application dynamically displays:

- Register Now
- Upload Submission
- Submission Uploaded
- Submission Closed
- Competition Full
- Registration Closed

depending on the current backend state.

### Reviews

Participants can view competition reviews, including:

- Reviewer name
- Rating
- Comment
- Average rating
- Review count

Users can submit one review per competition.

### Other Functional Interactions

The screen also supports:

- Language selector interaction
- Judge introduction video opening when a URL is available
- Copy referral link
- Share referral link
- Payment information
- Previous winner interaction
- Expand/collapse competition information
- Bottom navigation interactions

---

## 3. Application Flow

```text
User opens application
        |
        v
Demo authentication
        |
        v
Competition loaded from API
        |
        v
Registration state checked
        |
        +----------------------+
        |                      |
        v                      v
Not Registered            Registered
        |                      |
        v                      v
Register Now             Submission Window
        |                      |
        v                      v
Registered               Upload Submission
                               |
                               v
                       Submission Uploaded