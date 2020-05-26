'''
App Configuration module
'''
import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    CSRF_ENABLED = True
    DEBUG = False
    EXPLAIN_TEMPLATE_LOADING = False
    SECRET_KEY = 'this-really-needs-to-be-changed'
    GOOGLEMAPS_KEY='AIzaSyC6E6P0zrsWigi7WzyaJza0PuDILDuRAMY'
    HERE_API_KEY='vSWHspuwN3ZIORZTE_YI82GGths1RXMMu9YLBv99PvM'
    TESTING = False


class ProductionConfig(Config):
    ENV = "Production"


class StagingConfig(Config):
    DEBUG = True
    EXPLAIN_TEMPLATE_LOADING = True
    ENV = "Staging"


class DevelopmentConfig(Config):
    DEBUG = True
    DEVELOPMENT = True
    EXPLAIN_TEMPLATE_LOADING = False
    ENV = "Development"

class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    ENV = "Testing"
