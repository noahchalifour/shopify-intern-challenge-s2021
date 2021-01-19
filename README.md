# Shopify Intern Developer Challenge Summer 2021

The challenge was to build a web application that acts as an image repository that you can upload images to.

### How To Use

This section contains a set of instructions to setup and run the website.

#### Backend Setup

To setup the backend, run the following commands:

```
cd api
virtualenv venv             # Create a virtual environment
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend Setup

To setup the frontend, run the following commands:

```
cd react-app
yarn
```

#### Running the Application

To run the application, you have to run the backend and frontend seperately. To start the backend, run the following commands:

```
cd api/src
python manage.py runserver
```

In a separate shell, to start the backend, run the following:

```
cd react-app
yarn start
```