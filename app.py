"""
Cloud Heroes Africa Platform - Main Application
"""
from flask import Flask, render_template, redirect, url_for, session as flask_session
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SESSION_SECRET', 'dev-secret-key-change-in-production')

# Import routes
from src.auth.providers.google.oauth_client import google_bp
from src.auth.providers.entra.msal_config import entra_bp
from src.platform.community.forum import community_bp
from src.platform.admin_portal.dashboard import admin_bp
from src.roles.student.onboarding.flow import student_bp
from src.roles.administrator.onboarding.flow import administrator_bp
from src.roles.donor.onboarding.flow import donor_bp
from src.roles.volunteer.onboarding.flow import volunteer_bp

# Register blueprints
app.register_blueprint(google_bp, url_prefix='/auth/google')
app.register_blueprint(entra_bp, url_prefix='/auth/entra')
app.register_blueprint(community_bp, url_prefix='/community')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(administrator_bp, url_prefix='/administrator')
app.register_blueprint(donor_bp, url_prefix='/donor')
app.register_blueprint(volunteer_bp, url_prefix='/volunteer')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/logout')
def logout():
    flask_session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
