# Docarea - Document Management System

## Project Structure
```
docarea/
├── backend/
│   ├── backend/
│   ├── documents/
│   ├── users/
│   ├── workflows/
│   └── manage.py
├── requirements.txt
└── .env
└── .gitignore 
└── LICENCE

├── frontend/             # Application React
│    ├── src/
│    │   ├── components/   # Composants React
│    │   ├── pages/        #  │l'application
│    │   └── services/     # Services API
│    └── package.json      #                
└── README.md

```

## Backend Setup (Django)

### 1. Project Structure (Backend)
```
backend/
├── backend/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── documents/
├── users/
├── workflows/
└── manage.py


```

### 2. Prerequisites
- Python 3.9+
- PostgreSQL 12+
- node.js > 18



### 3. Environment Setup

1. Create a virtual environment in the project root:

```bash
python -m venv env

# Activate on Windows
env\Scripts\activate

# or use this for 3.10+
.\env\bin\activate

# Activate on macOS/Linux
source env/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### 4. Database Setup
Update the `DATABASES` section in `backend/settings.py` to:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_database_name',  # Replace with your PostgreSQL database name
        'USER': 'your_database_user',  # Replace with your PostgreSQL username
        'PASSWORD': 'your_database_password',  # Replace with your PostgreSQL password
        'HOST': 'localhost',  # Replace if using a remote database
        'PORT': '5432',  # Default PostgreSQL port
    }
}
```


### 5. Create and Apply Initial Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### 7. Start the Development Server

```bash
python manage.py runserver
```

Visit [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin) to access the admin panel.

### 8. Example Routes (Users)

- **Create User (POST):** `POST localhost/api/users/`
- **Get All Users (GET):** `GET localhost/api/users/`
- **Get User by ID (GET):** `GET localhost/api/users/{id}/`
- **Get User by Specific Attribute (GET):** `GET localhost/api/users/?username=test`
- **Update User (PUT):** `PUT localhost/api/users/{id}/`
- **Delete User (DELETE):** `DELETE localhost/api/users/{id}/`


## .gitignore

The `.gitignore` file tells Git which files and directories to ignore when tracking changes. Here's why we ignore certain files:

**Virtual Environment (`env/`, `venv/`)**:
   - Contains Python packages specific to your local setup
   - Large in size and should be recreated using requirements.txt
   - Different across operating systems



### Frontend 
