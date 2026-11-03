FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html about-us.html article.html articles.html contact-us.html sitemap.html policy.json /usr/share/nginx/html/

COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80
