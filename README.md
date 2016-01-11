# Django REST framework example


## Project goal

Survey to recognize where my political tendency positioned


## Stack

#### Back-end

- Nginx : Web server
- uWSGI : Connect web server and application server
- Django REST framework : Application server
- MySQL : Relational DB
- Redis : In-memory DB
- Celery : Async task manager
- Fabric : Deploy tool

#### Front-end

- NPM : Package management
- Webpack : Manage static files and bundle modules
- SCSS : Stylesheet
- <a href="http://getbootstrap.com/" target="_blank">Bootstrap</a> : Framework made by twitter
- <a href="https://github.com/alvarotrigo/fullPage.js" target="_blank">fullPage.js</a> : Fullscreen scrolling plug-in
- <a href="https://plot.ly/" target="_blank">plot.ly</a> : Visualize data

#### Django framework libraries

- django-simple-captcha : Human validation
- django-celery : Connect celery with django framework
- django-redis : Connect redis with django framework
- django-silk : Query inspection and debugging tool
- django-suit : Custom admin interface
- django-rest-framework-jwt : JSON Web Token authentication for django REST framework

#### Deployment : Amazon Web Services

- EC2 (OS: ubuntu 14.04 LTS)
- ELB (Load balancing)
- Adapt SSL certificate at ELB
- Route 53 (DNS)
- RDS (MySQL)
- ElastiCache (Redis)
