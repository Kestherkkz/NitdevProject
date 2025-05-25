**Multi-User Task Management API**
Overview :
This API provides a multi-user task management system built with Node.js and Express.js, featuring authentication, role-based access control, task assignment, tagging, commenting, notifications (with Nodemailer), validation, pagination, and sorting. The database is managed using PostgreSQL with migrations.
Features :
1. User Management
- JWT-based authentication for secure login/logout.
- Role-based access control (Admin, Regular User).
- Only Admins can create other Admins.
  
2. Task Management
- Users can create tasks with:
- Title
- Description
- Due Date
- Status (To-Do, In Progress, Completed)
- Users can assign tasks to themselves or others.
- Users can update the status of their own tasks.
- Admins can update the status of any task.
  
3. Tagging System
- Users can add tags to tasks (e.g., "Urgent", "Bug", "Feature").
- Users can filter tasks by tag.
  
4. Commenting System
- Users can add comments to tasks.
- Users can edit or delete their own comments.
- Admins can delete any comment.
- 
5. Notifications (With Nodemailer)
- Email Notifications:
- Users receive email alerts when assigned a task.
- Users receive email updates when the status of a task they are involved in changes.
- Users receive email after creating tasks
- Users receive email after verifying account and more.

6. Validation
- Validates payload for all endpoints (e.g., valid email format, required fields).
  
7. Pagination & Sorting
- Paginate task lists.
- Sort tasks by:
- Time created in a Descending order.
  
Technologies Used
- Node.js & Express.js – Web framework
- PostgreSQL – Relational database
- Sequelize – ORM for database migrations
- JWT (jsonwebtoken) – Authentication
- Nodemailer – Email notifications
- Postman – API documentation
