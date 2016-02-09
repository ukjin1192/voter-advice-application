# Political survey


## Project goal

Survey to recognize where my political tendency positioned


## Stack

#### Back-end

- <a href="http://nginx.org/" target="_blank">Nginx</a> : Web server
- <a href="https://uwsgi-docs.readthedocs.org/en/latest/" target="_blank">uWSGI</a> : Connect web server and application server
- <a href="http://www.django-rest-framework.org/" target="_blank">Django REST framework</a> : Application server
- <a href="https://www.mysql.com/" target="_blank">MySQL</a> :Relational DB
- <a href="http://www.redis.io/" target="_blank">Redis</a> : In-memory DB
- <a href="http://www.celeryproject.org/" target="_blank">Celery</a> : Async task manager
- <a href="http://www.fabfile.org/" target="_blank">Fabric</a> : Deploy tool

#### Front-end

- <a href="https://www.npmjs.com/" target="_blank">NPM</a> : Package management
- <a href="https://webpack.github.io/" target="_blank">Webpack</a> : Manage static files and bundle modules
- <a href="http://sass-lang.com/" target="_blank">SCSS</a> : Stylesheet
- <a href="http://getbootstrap.com/" target="_blank">Bootstrap</a> : Framework made by twitter
- <a href="https://github.com/alvarotrigo/fullPage.js" target="_blank">fullPage.js</a> : Fullscreen scrolling plug-in
- <a href="https://plot.ly/" target="_blank">plot.ly</a> : Visualize data
- <a href="https://github.com/andreruffert/rangeslider.js" target="_blank">rangeslider.js</a> : Range slider

#### Django framework libraries

- <a href="https://github.com/mbi/django-simple-captcha" target="_blank">django-simple-captcha</a> : Human validation
- <a href="https://github.com/celery/django-celery" target="_blank">django-celery</a> : Connect celery with django framework
- <a href="https://github.com/niwinz/django-redis" target="_blank">django-redis</a> : Connect redis with django framework
- <a href="https://github.com/django-silk/silk" target="_blank">django-silk</a> : Query inspection and debugging tool
- <a href="https://github.com/darklow/django-suit" target="_blank">django-suit</a> : Custom admin interface
- <a href="https://github.com/GetBlimp/django-rest-framework-jwt" target="_blank">django-rest-framework-jwt</a> : JSON Web Token authentication for django REST framework

#### Deployment : <a href="https://aws.amazon.com/" target="_blank">Amazon Web Services</a>

- EC2 (OS: ubuntu 14.04 LTS)
- ELB (Load balancing)
- Route 53 (DNS)
- RDS (MySQL)
- ElastiCache (Redis)
- S3 (Storage)
- CloudFront (CDN)
