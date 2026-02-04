# TODO - Announcement & Notification Enhancement

## Backend Updates ✅ COMPLETED

### 1. MentorContriller.js ✅
- [x] Add `getMyAnnouncements` endpoint for mentors to view their sent announcements
- [x] Add `deleteAnnouncement` endpoint for mentors to delete their announcements

### 2. StudentController.js ✅
- [x] Add `getStudentAnnouncements` endpoint for students to view announcements sent to them

### 3. MentorRoutes.js ✅
- [x] Add route for `GET /mentor/my-announcements`
- [x] Add route for `DELETE /mentor/announcements/:id`

### 4. StudentRoutes.js ✅
- [x] Add route for `GET /student/announcements`

## Frontend Updates ✅ COMPLETED

### 5. Mentornotification.jsx ✅
- [x] Add "My Announcements" section showing announcements sent by the mentor
- [x] Add fetch for mentor's announcements
- [x] Add delete functionality for mentor's announcements
- [x] Add visual distinction between "My Announcements" and "Notifications from Admin"

### 6. StuentsNotification.jsx ✅
- [x] Add "Announcements from Mentors" section
- [x] Add fetch for student announcements
- [x] Add visual distinction between "Announcements" and "Notifications from Admin"

## Summary
All tasks have been completed. The implementation includes:

### Backend:
- `getMyAnnouncements` - Mentors can view their sent announcements
- `deleteAnnouncement` - Mentors can delete their own announcements  
- `getStudentAnnouncements` - Students can view announcements sent to their batch

### Frontend:
- **Mentor Notification Page**: Now shows two sections:
  1. "My Announcements" (green border) - Shows announcements sent by the mentor with delete option
  2. "Notifications from Admin" (blue border) - Shows notifications from admin

- **Student Notification Page**: Now shows two sections:
  1. "Announcements from Mentors" (green border) - Shows announcements sent to the student's batch
  2. "Notifications from Admin" (blue border) - Shows notifications from admin

