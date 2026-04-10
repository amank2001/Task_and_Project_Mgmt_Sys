TaskFlow — Task & Project Management System
A full-stack Task and Project Management System built with:

Laravel 10 (PHP) — primary REST API backend
Django 4.2 (Python) — overdue task microservice
React 18 + Vite — frontend SPA
MySQL 8 — shared database

Task Status Rules: 

TODO ──────▶ IN_PROGRESS ──────▶ DONE
  │               │
  └───────────────┴──▶ OVERDUE (auto, when due_date < today)
                              │
                              ├──▶ DONE   (admin only)
                              └──▶ IN_PROGRESS  ✗ FORBIDDEN

Manual Setup:
1. MySQL

CREATE DATABASE task_management;
CREATE USER 'taskuser'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON task_management.* TO 'taskuser'@'localhost';
FLUSH PRIVILEGES;

3. Laravel Backend

cd laravel-backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed        
php artisan serve  

4. Django Service

cd django-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8001
# Optional: python scheduler.py

5. React Frontend

cd react-frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env.local
npm run dev   

Login Req:
POST /api/auth/login
{ "email": "admin@example.com", "password": "password" }
